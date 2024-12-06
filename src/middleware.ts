import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Refresh session if expired - required for Server Components
  const { data: { session }, error } = await supabase.auth.getSession();

  // Handle specific routes
  const path = request.nextUrl.pathname;
  const isAuthRoute = path === '/login' || path === '/signup';
  const isPublicRoute = path === '/';

  if (!session && !isAuthRoute && !isPublicRoute) {
    // Redirect unauthenticated users to login page
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectedFrom', path);
    return NextResponse.redirect(redirectUrl);
  }

  if (session && isAuthRoute) {
    // Redirect authenticated users to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};