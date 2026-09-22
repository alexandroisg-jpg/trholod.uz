import { env } from 'cloudflare:workers';
import { NextResponse, type NextRequest } from 'next/server';
import { AccessConfigurationError, accessUserFromHeaders, requiresOwnerAccess } from './lib/access-auth';

/** Public catalog; owner pages and order/admin APIs also verify Access at the origin. */
export async function middleware(request: NextRequest) {
  if (!requiresOwnerAccess(request.nextUrl.pathname)) return NextResponse.next();
  let status = 403;
  let message = 'Этот раздел доступен только владельцу. Войдите через раздел «Мои заказы» на сайте магазина.';
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
  const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return Response.json({ error: message }, { status, headers });
  }
  return new Response(message, { status, headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8' } });
}

export const config = { matcher: '/:path*' };
