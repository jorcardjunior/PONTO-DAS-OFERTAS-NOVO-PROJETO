import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['pt', 'en', 'es'],
  defaultLocale: 'pt'
});

// Cookie names used by NextAuth v5 beta
const SESSION_COOKIE_DEV = 'authjs.session-token';
const SESSION_COOKIE_PROD = '__Secure-authjs.session-token';
const SESSION_COOKIE_DEV_ALT = 'next-auth.session-token';
const SESSION_COOKIE_PROD_ALT = '__Secure-next-auth.session-token';

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublicPage = pathname.includes('/login');

  // Suporta tanto o cookie novo (authjs) quanto o antigo (next-auth) para compatibilidade
  const authToken = req.cookies.get(SESSION_COOKIE_DEV)?.value
    || req.cookies.get(SESSION_COOKIE_PROD)?.value
    || req.cookies.get(SESSION_COOKIE_DEV_ALT)?.value
    || req.cookies.get(SESSION_COOKIE_PROD_ALT)?.value;

  if (!isPublicPage && !authToken && !pathname.startsWith('/_next') && !pathname.startsWith('/api/auth')) {
    const locale = pathname.split('/')[1] || 'pt';
    const loginUrl = new URL(`/${locale}/login`, req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(req);
}

export const config = { matcher: ['/((?!api|_next|.*\\..*).*)'] };
