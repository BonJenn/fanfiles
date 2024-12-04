import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  console.log('Middleware - Path:', req.nextUrl.pathname);
  console.log('Middleware - Session:', !!session);

  // Redirect if not authenticated
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    console.log('Redirecting to login - no session');
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Redirect if already authenticated
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')) {
    console.log('Redirecting to dashboard - has session');
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings', '/login', '/signup'],
};