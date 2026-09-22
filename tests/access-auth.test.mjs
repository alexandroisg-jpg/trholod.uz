import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { AccessConfigurationError, accessUserFromHeaders, requiresOwnerAccess } from '../lib/access-auth.ts';

const team = 'https://test-owner.cloudflareaccess.com';
const environment = {
  CLOUDFLARE_ACCESS_TEAM_DOMAIN: team,
  CLOUDFLARE_ACCESS_AUD: 'test-store-audience',
  OWNER_EMAIL: 'owner@example.com',
};
const now = Math.floor(Date.now() / 1000);
let keys;
let originalFetch;
let fetches = 0;

before(async () => {
  keys = await generateKeyPair('RS256');
  const publicJwk = await exportJWK(keys.publicKey);
  originalFetch = globalThis.fetch;
  // No live services or real identities are used by these tests.
  globalThis.fetch = async (url) => {
    assert.equal(String(url), `${team}/cdn-cgi/access/certs`);
    fetches++;
    return Response.json({ keys: [{ ...publicJwk, kid: 'test-key', alg: 'RS256', use: 'sig' }] });
  };
});
after(() => { globalThis.fetch = originalFetch; });

async function token(overrides = {}, privateKey = keys.privateKey, algorithm = 'RS256') {
  const payload = {
    iss: team,
    aud: [environment.CLOUDFLARE_ACCESS_AUD],
    sub: 'test-owner-subject',
    email: environment.OWNER_EMAIL,
    type: 'app',
    iat: now,
    nbf: now - 1,
    exp: now + 300,
    ...overrides,
  };
  for (const [name, value] of Object.entries(payload)) {
    if (value === undefined) delete payload[name];
  }
  return new SignJWT(payload).setProtectedHeader({ alg: algorithm, kid: 'test-key' }).sign(privateKey);
}

const requestHeaders = (jwt) => new Headers({ 'cf-access-jwt-assertion': jwt });

test('owner pages and APIs include roots, trailing slashes and descendants', () => {
  for (const path of ['/admin', '/orders', '/api/admin', '/api/orders']) {
    for (const suffix of ['', '/', '/details', '/nested/details']) {
      assert.equal(requiresOwnerAccess(`${path}${suffix}`), true, `${path}${suffix}`);
    }
  }
});

test('public catalog, SEO resources and assets stay public', () => {
  for (const path of [
    '/', '/catalog', '/catalog/refrigerants', '/catalog/r134a', '/credits', '/robots.txt', '/sitemap.xml',
    '/api/catalog', '/products/real-trgas-r134a.webp', '/brand/tr-monogram.webp', '/favicon.png',
    '/_next/static/chunk.js', '/administrator', '/orders-info', '/api/administer', '/api/orders-public',
  ]) assert.equal(requiresOwnerAccess(path), false, path);
});

test('encoded private paths and normalized aliases cannot bypass the owner gate', () => {
  for (const path of [
    '/%61dmin', '/%6frders/', '/api%2fadmin', '/api/%6frders', '/%2561dmin',
    '//admin//details', '/catalog/../orders', '/catalog/%2e%2e/api/orders', '/api\\admin',
    '/api/%2fadmin', '/admin/%zz', '/admin/%252e%252e/catalog', '/api/orders/%2e%2e/catalog',
  ]) assert.equal(requiresOwnerAccess(path), true, path);
});

test('verified owner identity is accepted and JWKS are cached', async () => {
  const jwt = await token();
  assert.deepEqual(await accessUserFromHeaders(requestHeaders(jwt), environment), {
    userId: 'test-owner-subject', displayName: 'owner@example.com', email: 'owner@example.com', fullName: null,
  });
  assert.ok(await accessUserFromHeaders(requestHeaders(jwt), environment));
  assert.equal(fetches, 1);
});

test('spoofed Sites and Cloudflare email headers cannot authenticate', async () => {
  const headers = new Headers({
    'oai-authenticated-user-id': 'owner',
    'oai-authenticated-user-email': 'owner@example.com',
    'cf-access-authenticated-user-email': 'owner@example.com',
  });
  assert.equal(await accessUserFromHeaders(headers, environment), null);
});

test('a different signing key cannot forge the owner identity', async () => {
  const attacker = await generateKeyPair('RS256');
  const jwt = await token({}, attacker.privateKey);
  assert.equal(await accessUserFromHeaders(requestHeaders(jwt), environment), null);
});

test('malformed, unsigned and unexpected-algorithm tokens are rejected', async () => {
  const hmac = await token({}, new TextEncoder().encode('test-key-with-thirty-two-bytes!!'), 'HS256');
  for (const jwt of ['not-a-jwt', 'eyJhbGciOiJub25lIn0.eyJlbWFpbCI6Im93bmVyQGV4YW1wbGUuY29tIn0.', hmac]) {
    assert.equal(await accessUserFromHeaders(requestHeaders(jwt), environment), null);
  }
});

test('another app or another Cloudflare team cannot authenticate', async () => {
  for (const claims of [{ aud: ['another-app'] }, { iss: 'https://other.cloudflareaccess.com' }]) {
    assert.equal(await accessUserFromHeaders(requestHeaders(await token(claims)), environment), null);
  }
});

test('expired, premature and future-issued tokens are rejected', async () => {
  for (const claims of [{ exp: now - 1 }, { nbf: now + 300 }, { iat: now + 300 }]) {
    assert.equal(await accessUserFromHeaders(requestHeaders(await token(claims)), environment), null);
  }
});

test('non-owner users and non-user sessions are rejected', async () => {
  for (const claims of [
    { email: 'someone@example.com' }, { type: 'org' }, { sub: '' }, { email: undefined },
    { email: 'owner@example.com ', sub: 'test-owner-subject' },
  ]) {
    assert.equal(await accessUserFromHeaders(requestHeaders(await token(claims)), environment), null);
  }
});

test('required lifetime and identity claims cannot be omitted', async () => {
  for (const name of ['iss', 'aud', 'exp', 'iat', 'sub', 'type']) {
    assert.equal(await accessUserFromHeaders(requestHeaders(await token({ [name]: undefined })), environment), null);
  }
});

test('missing or unsafe configuration fails closed before fetching any key', async () => {
  const jwt = requestHeaders(await token());
  const count = fetches;
  for (const config of [
    {}, { ...environment, OWNER_EMAIL: '' }, { ...environment, CLOUDFLARE_ACCESS_AUD: '' },
    { ...environment, CLOUDFLARE_ACCESS_TEAM_DOMAIN: 'http://test-owner.cloudflareaccess.com' },
    { ...environment, CLOUDFLARE_ACCESS_TEAM_DOMAIN: 'https://test-owner.cloudflareaccess.com.attacker.example' },
    { ...environment, CLOUDFLARE_ACCESS_TEAM_DOMAIN: 'https://localhost' },
    { ...environment, CLOUDFLARE_ACCESS_TEAM_DOMAIN: `${team}/another-path` },
  ]) {
    await assert.rejects(accessUserFromHeaders(jwt, config), AccessConfigurationError);
  }
  assert.equal(fetches, count);
});

test('oversized input cannot trigger remote key retrieval', async () => {
  const count = fetches;
  assert.equal(await accessUserFromHeaders(requestHeaders('x'.repeat(32769)), environment), null);
  assert.equal(fetches, count);
});

test('an unavailable trusted key endpoint denies access', async () => {
  const savedFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('offline'); };
  try {
    const config = { ...environment, CLOUDFLARE_ACCESS_TEAM_DOMAIN: 'https://offline-test.cloudflareaccess.com' };
    assert.equal(await accessUserFromHeaders(requestHeaders(await token({ iss: config.CLOUDFLARE_ACCESS_TEAM_DOMAIN })), config), null);
  } finally {
    globalThis.fetch = savedFetch;
  }
});
