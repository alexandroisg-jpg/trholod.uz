import { createRemoteJWKSet, jwtVerify } from 'jose';

export type AccessEnvironment = {
  CLOUDFLARE_ACCESS_TEAM_DOMAIN?: string;
  CLOUDFLARE_ACCESS_AUD?: string;
  OWNER_EMAIL?: string;
};

export type StoreUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

const privatePaths = ['/admin', '/orders', '/api/admin', '/api/orders'];

/** Match complete path segments, including encoded and normalized equivalents. */
export function requiresOwnerAccess(pathname: string): boolean {
  let decoded = pathname;
  const matchesPrivate = (value: string) => privatePaths.some((path) => value === path || value.startsWith(`${path}/`));
  const matchesVariant = (value: string) => {
    const slashes = value.replaceAll('\\', '/').replaceAll(/\/{2,}/g, '/');
    // Do not turn an encoded private prefix into a public path while normalizing it.
    if (matchesPrivate(slashes)) return true;
    const parts: string[] = [];
    for (const part of slashes.split('/')) {
      if (part === '..') parts.pop();
      else if (part && part !== '.') parts.push(part);
    }
    return matchesPrivate(`/${parts.join('/')}`);
  };
  try {
    for (let count = 0; count < 4; count++) {
      if (matchesVariant(decoded)) return true;
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
      if (count === 3 && /%[\da-f]{2}/i.test(decoded)) return true;
    }
  } catch {
    return true;
  }
  return matchesVariant(decoded);
}

export class AccessConfigurationError extends Error {
  constructor() {
    super('Private access has not been configured.');
    this.name = 'AccessConfigurationError';
  }
}

export function accessConfiguration(env: AccessEnvironment) {
  const rawDomain = env.CLOUDFLARE_ACCESS_TEAM_DOMAIN?.trim();
  const audience = env.CLOUDFLARE_ACCESS_AUD?.trim();
  const ownerEmail = env.OWNER_EMAIL?.trim().toLowerCase();
  if (!rawDomain || !audience || !ownerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
    throw new AccessConfigurationError();
  }
  let domain: URL;
  try {
    domain = new URL(rawDomain);
  } catch {
    throw new AccessConfigurationError();
  }
  if (
    domain.protocol !== 'https:' ||
    !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.cloudflareaccess\.com$/.test(domain.hostname) ||
    domain.port || domain.username || domain.password ||
    domain.pathname !== '/' || domain.search || domain.hash
  ) {
    throw new AccessConfigurationError();
  }
  return { issuer: domain.origin, audience, ownerEmail };
}

let trustedKeys: { issuer: string; resolve: ReturnType<typeof createRemoteJWKSet> } | undefined;

/** Only the configured Cloudflare team can provide keys; JWT headers never select a key URL. */
export async function accessUserFromHeaders(
  headers: Pick<Headers, 'get'>,
  env: AccessEnvironment,
): Promise<StoreUser | null> {
  const { issuer, audience, ownerEmail } = accessConfiguration(env);
  const token = headers.get('cf-access-jwt-assertion');
  if (!token || token.length > 32768) return null;

  if (trustedKeys?.issuer !== issuer) {
    trustedKeys = {
      issuer,
      resolve: createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`), {
        timeoutDuration: 5000,
        cooldownDuration: 30000,
        cacheMaxAge: 600000,
      }),
    };
  }

  try {
    const { payload } = await jwtVerify(token, trustedKeys.resolve, {
      algorithms: ['RS256'],
      issuer,
      audience,
      requiredClaims: ['iss', 'aud', 'sub', 'exp', 'iat', 'email', 'type'],
      clockTolerance: 0,
    });
    // An organization token or a service token is not an owner login.
    if (
      payload.type !== 'app' ||
      typeof payload.sub !== 'string' || !payload.sub || payload.sub.length > 1024 ||
      typeof payload.email !== 'string' || payload.email.toLowerCase() !== ownerEmail ||
      typeof payload.iat !== 'number' || payload.iat > Math.floor(Date.now() / 1000) + 30
    ) return null;

    return {
      userId: payload.sub,
      displayName: payload.email,
      email: payload.email,
      fullName: null,
    };
  } catch {
    // Invalid signatures, expired claims and unavailable trusted keys all deny access.
    return null;
  }
}
