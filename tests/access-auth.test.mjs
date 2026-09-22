import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { decodeJwt, SignJWT } from 'jose';
import { AccessConfigurationError, accessUserFromHeaders, createOwnerSession, ownerSessionCookie, sessionCookieName,
  sessionLifetime, sha256, validOwnerPassword, safeReturnPath, requiresOwnerAccess, requireAuthPost,
  handleOwnerLogin, handleOwnerLogout, reserveLoginAttempt, loginReservationSql } from '../lib/access-auth.ts';
const password = randomBytes(32).toString('hex');
const environment = { SESSION_SECRET: randomBytes(48).toString('hex'), ADMIN_ACCESS_KEY_SHA256: await sha256(password), OWNER_EMAIL: 'owner@example.com' };
function database() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../drizzle/0002_owner_login_limits.sql', import.meta.url), 'utf8'));
  return { sqlite, prepare(sql) { return { bind(...values) { return {
    async first() { return sqlite.prepare(sql).get(...values) || null; },
    async run() { return sqlite.prepare(sql).run(...values); },
  }; } }; } };
}
const headersFor = (token) => new Headers({ cookie: `${sessionCookieName}=${token}` });
const request = (body = { password }, extra = {}) => new Request('https://trholod.uz/api/auth/login', {
  method: 'POST', headers: { Origin: 'https://trholod.uz', 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.1', ...extra }, body: JSON.stringify(body),
});
test('owner path roots and descendants remain closed without prefix collisions', () => {
  for (const path of ['/admin', '/orders', '/api/admin', '/api/orders']) {
    for (const suffix of ['', '/', '/details', '/nested/details']) assert.equal(requiresOwnerAccess(`${path}${suffix}`), true);
  }
  for (const path of ['/', '/catalog', '/catalog/r134a', '/catalog/category/tools', '/credits', '/robots.txt', '/sitemap.xml', '/api/catalog', '/login', '/logout', '/api/auth/login', '/api/auth/logout', '/products/photo.webp', '/_next/static/chunk.js', '/administrator', '/orders-info', '/api/orders-public']) assert.equal(requiresOwnerAccess(path), false, path);
});
test('encoded and normalized private routes cannot bypass protection', () => {
  for (const path of ['/%61dmin', '/%6frders/', '/api%2fadmin', '/api/%6frders', '/%2561dmin', '//admin//details', '/catalog/../orders', '/catalog/%2e%2e/api/orders', '/api\\admin', '/api/%2fadmin', '/admin/%zz', '/admin/%252e%252e/catalog']) assert.equal(requiresOwnerAccess(path), true, path);
});
test('correct password creates a bounded signed owner session and secure cookie', async () => {
  assert.equal(await validOwnerPassword(password, environment), true);
  assert.equal(await validOwnerPassword(`${password}x`, environment), false);
  const token = await createOwnerSession(environment);
  assert.deepEqual(await accessUserFromHeaders(headersFor(token), environment), { userId: 'owner-v1', email: 'owner@example.com', displayName: 'owner@example.com', fullName: null });
  const payload = decodeJwt(token); assert.equal(payload.exp - payload.iat, sessionLifetime);
  const cookie = ownerSessionCookie(token);
  for (const flag of ['__Host-trholod-session=', 'Path=/', 'HttpOnly', 'Secure', 'SameSite=Lax', 'Max-Age=28800']) assert.ok(cookie.includes(flag));
  assert.ok(!cookie.includes('Domain='));
});
test('untrusted identity headers, malformed cookies and duplicate cookies do not authenticate', async () => {
  const token = await createOwnerSession(environment);
  for (const headers of [new Headers({ 'oai-authenticated-user-id': 'owner', 'cf-access-authenticated-user-email': environment.OWNER_EMAIL }), headersFor('not-a-token'), new Headers({ cookie: `${sessionCookieName}=${token}; ${sessionCookieName}=${token}` }), headersFor('x'.repeat(4097))]) assert.equal(await accessUserFromHeaders(headers, environment), null);
});
test('wrong signatures, expired sessions and rotated credentials invalidate cookies', async () => {
  const token = await createOwnerSession(environment);
  assert.equal(await accessUserFromHeaders(headersFor(token), { ...environment, SESSION_SECRET: randomBytes(48).toString('hex') }), null);
  assert.equal(await accessUserFromHeaders(headersFor(token), { ...environment, ADMIN_ACCESS_KEY_SHA256: await sha256('changed') }), null);
  assert.equal(await accessUserFromHeaders(headersFor(token), { ...environment, OWNER_EMAIL: 'different@example.com' }), null);
  const expired = await createOwnerSession(environment, Math.floor(Date.now() / 1000) - sessionLifetime - 1);
  assert.equal(await accessUserFromHeaders(headersFor(expired), environment), null);
});
test('issuer, audience, owner identity, algorithm and maximum lifetime are enforced', async () => {
  const payload = decodeJwt(await createOwnerSession(environment));
  for (const overrides of [{ iss: 'https://other.example' }, { aud: 'other-app' }, { sub: 'other-owner' }, { exp: payload.exp + 1 }, { iat: payload.iat + 300 }, { email: 'other@example.com' }, { credentialVersion: 'forged' }]) {
    const token = await new SignJWT({ ...payload, ...overrides }).setProtectedHeader({ alg: 'HS256' }).sign(new TextEncoder().encode(environment.SESSION_SECRET));
    assert.equal(await accessUserFromHeaders(headersFor(token), environment), null);
  }
  const wrongAlgorithm = await new SignJWT(payload).setProtectedHeader({ alg: 'HS384' }).sign(new TextEncoder().encode(environment.SESSION_SECRET));
  assert.equal(await accessUserFromHeaders(headersFor(wrongAlgorithm), environment), null);
});
test('missing or invalid configuration fails closed', async () => {
  for (const config of [{}, { ...environment, SESSION_SECRET: 'short' }, { ...environment, ADMIN_ACCESS_KEY_SHA256: 'bad' }, { ...environment, OWNER_EMAIL: '' }]) {
    await assert.rejects(accessUserFromHeaders(new Headers(), config), AccessConfigurationError);
    assert.equal((await handleOwnerLogin(request(), config)).status, 503);
  }
});
test('return destinations reject external, encoded and reserved paths', () => {
  for (const path of ['https://evil.example/', '//evil.example', '/\\evil.example', '/%2f%2fevil.example', '/%255cevil.example', '/login', '/login/again', '/logout', '/api/auth/login', '/catalog/../login', '/cdn-cgi/access/logout', '/%6cogin', '/%00admin']) assert.equal(safeReturnPath(path), '/orders', path);
  assert.equal(safeReturnPath('/admin?tab=products'), '/admin?tab=products'); assert.equal(safeReturnPath('/'), '/');
});
test('login and logout require same-origin JSON POST', async () => {
  for (const headers of [{ Origin: 'https://evil.example' }, { Origin: '' }, { 'Content-Type': 'text/plain' }, { 'Sec-Fetch-Site': 'cross-site' }]) {
    assert.throws(() => requireAuthPost(request({}, headers)));
    assert.ok([403, 415].includes((await handleOwnerLogin(request({}, headers), environment)).status));
    assert.ok([403, 415].includes((await handleOwnerLogout(request({}, headers))).status));
  }
  assert.equal((await handleOwnerLogout(new Request('https://trholod.uz/api/auth/logout'))).status, 405);
});
test('D1 conditional attempt reservation enforces 10-per-window and backoff', async () => {
  const DB = database(); const env = { ...environment, DB };
  await reserveLoginAttempt(request(), env, 10000); await reserveLoginAttempt(request(), env, 10000);
  await assert.rejects(reserveLoginAttempt(request(), env, 10000), (error) => error.status === 429 && error.retryAfter > 0);
  for (let attempt = 2; attempt < 10; attempt++) await reserveLoginAttempt(request(), env, 10000 + attempt * 65);
  await assert.rejects(reserveLoginAttempt(request(), env, 10800), (error) => error.status === 429);
  await reserveLoginAttempt(request(), env, 10900);
  assert.equal(DB.sqlite.prepare("SELECT attempts FROM owner_login_limits WHERE bucket LIKE 'ip:%'").get().attempts, 1); DB.sqlite.close();
});
test('atomic SQL cannot exceed the attempt ceiling at the same timestamp', () => {
  const DB = database(); const statement = DB.sqlite.prepare(loginReservationSql); let accepted = 0;
  for (let index = 0; index < 50; index++) if (statement.get('test', 10000, 10000, 9100, 10000, 9100, 10000, 0, 9100, 9100, 10, 10000)) accepted++;
  assert.equal(accepted, 10); assert.equal(DB.sqlite.prepare('SELECT attempts FROM owner_login_limits WHERE bucket = ?').get('test').attempts, 10); DB.sqlite.close();
});
test('global cap applies across different IP addresses', async () => {
  const DB = database();
  for (let index = 0; index < 100; index++) await reserveLoginAttempt(request({}, { 'CF-Connecting-IP': `203.0.113.${index}` }), { ...environment, DB }, 10000);
  await assert.rejects(reserveLoginAttempt(request({}, { 'CF-Connecting-IP': '198.51.100.1' }), { ...environment, DB }, 10000), (error) => error.status === 429); DB.sqlite.close();
});
test('login issues cookie only after password and D1 reservation succeed', async () => {
  const DB = database();
  const wrong = await handleOwnerLogin(request({ password: 'wrong' }), { ...environment, DB });
  assert.equal(wrong.status, 401); assert.equal(wrong.headers.get('set-cookie'), null);
  const ok = await handleOwnerLogin(request({ password, returnTo: '/admin' }), { ...environment, DB });
  assert.equal(ok.status, 200); assert.equal((await ok.json()).returnTo, '/admin'); assert.ok(ok.headers.get('set-cookie').startsWith(sessionCookieName));
  assert.equal((await handleOwnerLogin(request(), environment)).status, 503);
  const broken = { prepare() { throw new Error('D1 unavailable'); } };
  assert.equal((await handleOwnerLogin(request(), { ...environment, DB: broken })).status, 503); DB.sqlite.close();
});
test('oversized login bodies are rejected and logout clears cookie', async () => {
  assert.equal((await handleOwnerLogin(request({ password: 'x'.repeat(5000) }), environment)).status, 413);
  const logout = await handleOwnerLogout(request({})); assert.equal(logout.status, 200); assert.ok(logout.headers.get('set-cookie').includes('Max-Age=0'));
});
