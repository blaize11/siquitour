import { NextRequest, NextResponse } from 'next/server';

// Must match the cookie name used in src/lib/session.ts.
const COOKIE_NAME = 'siquitour_admin_token';

// Optimistic check only (cookie presence, not validity) — matches Next's documented
// pattern. Real enforcement happens per-page via requireAdmin() in src/lib/auth.ts.
export function proxy(request: NextRequest) {
  const hasToken = Boolean(request.cookies.get(COOKIE_NAME)?.value);
  const isLoginPage = request.nextUrl.pathname === '/login';

  if (!hasToken && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (hasToken && isLoginPage) {
    return NextResponse.redirect(new URL('/users', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
