import { env } from 'cloudflare:workers';
import { NextResponse, type NextRequest } from 'next/server';
import { AccessConfigurationError, accessUserFromHeaders, requiresOwnerAccess, safeReturnPath } from './lib/access-auth';

/** Public catalog; owner pages and APIs require a verified owner-session cookie. */
export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  if (url.hostname === 'www.trholod.uz' || (url.hostname === 'trholod.uz' && url.protocol !== 'https:')) {
    url.protocol = 'https:';
    url.hostname = 'trholod.uz';
    return NextResponse.redirect(url, 308);
  }
  if (!requiresOwnerAccess(request.nextUrl.pathname)) return NextResponse.next();
  let status = 401;
  let message = 'Войдите, чтобы открыть этот раздел.';
  try {
    if (await accessUserFromHeaders(request.headers, env)) {
      const response = NextResponse.next();
      response.headers.set('Cache-Control', 'private, no-store');
      return response;
    }
  } catch (error) {
    if (error instanceof AccessConfigurationError) {
      status = 503;
      message = 'Доступ к этому закрытому разделу ещё настраивается. Каталог доступен без входа.';
    }
  }
  const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow' };
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return Response.json({ error: message }, { status, headers });
  }
  if (status === 401) {
    const login = new URL('/login', request.url);
    login.searchParams.set('returnTo', safeReturnPath(`${request.nextUrl.pathname}${request.nextUrl.search}`));
    return new Response(null, { status: 303, headers: { ...headers, Location: login.href } });
  }
  return new Response(message, { status, headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8' } });
}

export const config = { matcher: '/:path*' };
