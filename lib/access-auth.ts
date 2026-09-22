import { SignJWT, jwtVerify } from 'jose';

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

export type AccessEnvironment = { DB?: D1Database; SESSION_SECRET?: string; ADMIN_ACCESS_KEY_SHA256?: string; OWNER_EMAIL?: string };
export type StoreUser = { userId: string; displayName: string; email: string; fullName: string | null };
export const sessionCookieName = '__Host-trholod-session';
export const sessionLifetime = 8 * 60 * 60;
const issuer = 'https://trholod.uz';
const audience = 'trholod-owner';

export class AccessConfigurationError extends Error {
  constructor() { super('Owner login has not been configured.'); this.name = 'AccessConfigurationError'; }
}
export function accessConfiguration(env: AccessEnvironment) {
  const ownerEmail = env.OWNER_EMAIL?.trim().toLowerCase();
  const secret = new TextEncoder().encode(env.SESSION_SECRET || '');
  const passwordHash = env.ADMIN_ACCESS_KEY_SHA256 || '';
  if (secret.byteLength < 32 || !/^[a-f\d]{64}$/i.test(passwordHash) || !ownerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) throw new AccessConfigurationError();
  return { ownerEmail, secret, passwordHash: passwordHash.toLowerCase() };
}
export async function sha256(value: string) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
function sameHash(left: string, right: string) {
  let difference = left.length ^ right.length;
  for (let index = 0; index < 64; index++) difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  return difference === 0;
}
export async function validOwnerPassword(password: string, env: AccessEnvironment) {
  const { passwordHash } = accessConfiguration(env);
  return sameHash(await sha256(password), passwordHash);
}
async function credentialVersion(env: AccessEnvironment) {
  return sha256(`trholod:credential:${env.ADMIN_ACCESS_KEY_SHA256?.toLowerCase()}:${env.SESSION_SECRET}`);
}
export async function createOwnerSession(env: AccessEnvironment, now = Math.floor(Date.now() / 1000)) {
  const { ownerEmail, secret } = accessConfiguration(env);
  return new SignJWT({ email: ownerEmail, credentialVersion: await credentialVersion(env) }).setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuer(issuer).setAudience(audience).setSubject('owner-v1').setIssuedAt(now).setExpirationTime(now + sessionLifetime).setJti(crypto.randomUUID()).sign(secret);
}
export function ownerSessionCookie(token: string) {
  return `${sessionCookieName}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${sessionLifetime}`;
}
export function clearOwnerSessionCookie() {
  return `${sessionCookieName}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
export async function accessUserFromHeaders(headers: Pick<Headers, 'get'>, env: AccessEnvironment): Promise<StoreUser | null> {
  const { ownerEmail, secret } = accessConfiguration(env);
  const cookies = (headers.get('cookie') || '').split(';').map((value) => value.trim()).filter((value) => value.startsWith(`${sessionCookieName}=`));
  if (cookies.length !== 1) return null;
  const token = cookies[0].slice(sessionCookieName.length + 1);
  if (!token || token.length > 4096) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'], issuer, audience, subject: 'owner-v1',
      requiredClaims: ['iss', 'aud', 'sub', 'exp', 'iat', 'jti', 'email', 'credentialVersion'], maxTokenAge: sessionLifetime, clockTolerance: 0 });
    const now = Math.floor(Date.now() / 1000);
    if (payload.email !== ownerEmail || typeof payload.iat !== 'number' || typeof payload.exp !== 'number' || payload.iat > now
      || payload.exp - payload.iat > sessionLifetime || payload.credentialVersion !== await credentialVersion(env)) return null;
    return { userId: 'owner-v1', displayName: ownerEmail, email: ownerEmail, fullName: null };
  } catch { return null; }
}
export function safeReturnPath(input: unknown): string {
  const fallback = '/orders';
  if (typeof input !== 'string' || input.length > 2048 || !input.startsWith('/') || input.startsWith('//')) return fallback;
  let decoded = input;
  try {
    for (let count = 0; count < 4; count++) {
      if (decoded.startsWith('//') || /[\\\u0000-\u001f\u007f]/.test(decoded)) return fallback;
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
      if (count === 3 && /%[\da-f]{2}/i.test(decoded)) return fallback;
    }
    const normalized = new URL(decoded, issuer);
    if (normalized.origin !== issuer || /^\/(?:login|logout|api|cdn-cgi)(?:\/|$)/.test(normalized.pathname)) return fallback;
    const url = new URL(input, issuer);
    return url.origin === issuer ? `${url.pathname}${url.search}` : fallback;
  } catch { return fallback; }
}
class AuthHttpError extends Error {
  status: number;
  retryAfter?: number;
  constructor(status: number, message: string, retryAfter?: number) { super(message); this.status = status; this.retryAfter = retryAfter; }
}
export function requireAuthPost(request: Request) {
  if (request.method !== 'POST') throw new AuthHttpError(405, 'Требуется POST-запрос.');
  if (request.headers.get('origin') !== new URL(request.url).origin || request.headers.get('sec-fetch-site') === 'cross-site') throw new AuthHttpError(403, 'Отправьте форму со страницы магазина.');
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new AuthHttpError(415, 'Неверный формат запроса.');
}
async function loginBody(request: Request) {
  if (!request.body) throw new AuthHttpError(400, 'Введите ключ владельца.');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 4096) { await reader.cancel(); throw new AuthHttpError(413, 'Слишком большой запрос.'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try {
    const value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (!value || typeof value.password !== 'string' || value.password.length < 1 || value.password.length > 512) throw new Error();
    return { password: value.password, returnTo: safeReturnPath(value.returnTo) };
  } catch { throw new AuthHttpError(400, 'Проверьте введённый ключ.'); }
}
/** Conditional UPSERT reserves one attempt atomically; concurrent calls cannot exceed the limit. */
export const loginReservationSql = `INSERT INTO owner_login_limits (bucket, window_start, attempts, next_allowed_at)
VALUES (?, ?, 1, ?)
ON CONFLICT(bucket) DO UPDATE SET
  window_start = CASE WHEN window_start <= ? THEN ? ELSE window_start END,
  attempts = CASE WHEN window_start <= ? THEN 1 ELSE attempts + 1 END,
  next_allowed_at = ? + CASE WHEN ? = 0 OR window_start <= ? THEN 0 ELSE min(60, 1 << min(attempts - 1, 6)) END
WHERE (window_start <= ? OR attempts < ?) AND next_allowed_at <= ?
RETURNING attempts, window_start, next_allowed_at`;
type LoginBucket = { attempts: number; window_start: number; next_allowed_at: number };
async function reserveLoginBucket(database: D1Database, bucket: string, limit: number, backoff: boolean, now: number) {
  const cutoff = now - 900;
  const reserved = await database.prepare(loginReservationSql).bind(bucket, now, now, cutoff, now, cutoff, now, backoff ? 1 : 0, cutoff, cutoff, limit, now).first<LoginBucket>();
  if (reserved) return;
  const current = await database.prepare('SELECT attempts, window_start, next_allowed_at FROM owner_login_limits WHERE bucket = ?').bind(bucket).first<LoginBucket>();
  const retryAfter = current ? Math.max(1, (current.attempts >= limit ? current.window_start + 900 : current.next_allowed_at) - now) : 60;
  throw new AuthHttpError(429, 'Слишком много попыток. Подождите перед следующим входом.', retryAfter);
}
export async function reserveLoginAttempt(request: Request, env: AccessEnvironment, now = Math.floor(Date.now() / 1000)) {
  if (!env.DB) throw new AccessConfigurationError();
  // Cloudflare supplies this header at the edge. Missing addresses share a single bucket.
  const address = request.headers.get('cf-connecting-ip')?.slice(0, 128) || 'missing-address';
  const bucket = `ip:${await sha256(`${env.SESSION_SECRET}:${address}`)}`;
  await env.DB.prepare('DELETE FROM owner_login_limits WHERE window_start < ?').bind(now - 86400).run();
  await reserveLoginBucket(env.DB, bucket, 10, true, now);
  await reserveLoginBucket(env.DB, 'owner-v1:global', 100, false, now);
}
const authHeaders = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow' };
function authFailure(error: unknown) {
  if (error instanceof AuthHttpError) return Response.json({ error: error.message }, { status: error.status, headers: { ...authHeaders, ...(error.retryAfter ? { 'Retry-After': String(error.retryAfter) } : {}) } });
  return Response.json({ error: 'Вход временно недоступен. Попробуйте позже.' }, { status: 503, headers: authHeaders });
}
export async function handleOwnerLogin(request: Request, env: AccessEnvironment) {
  try {
    requireAuthPost(request);
    accessConfiguration(env);
    const data = await loginBody(request);
    await reserveLoginAttempt(request, env);
    if (!await validOwnerPassword(data.password, env)) throw new AuthHttpError(401, 'Неверный ключ владельца.');
    const token = await createOwnerSession(env);
    return Response.json({ ok: true, returnTo: data.returnTo }, { headers: { ...authHeaders, 'Set-Cookie': ownerSessionCookie(token) } });
  } catch (error) { return authFailure(error); }
}
export async function handleOwnerLogout(request: Request) {
  try {
    requireAuthPost(request);
    return Response.json({ ok: true }, { headers: { ...authHeaders, 'Set-Cookie': clearOwnerSessionCookie() } });
  } catch (error) { return authFailure(error); }
}
