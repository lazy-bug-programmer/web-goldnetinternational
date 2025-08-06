import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the session/auth token from cookies
  const authToken = request.cookies.get('auth-token')?.value;
  const userEmail = request.cookies.get('user-email')?.value;

  // Check if the route is protected
  if (pathname.startsWith('/dashboard')) {
    // If no auth token, redirect to login
    if (!authToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check admin routes
    if (pathname.startsWith('/dashboard/admin')) {
      // Only allow admin@web.com to access admin routes
      if (userEmail !== 'admin@web.com') {
        // Redirect non-admin users to regular dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
