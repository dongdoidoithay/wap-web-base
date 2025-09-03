import { NextRequest, NextResponse } from 'next/server';
import { getDomainConfigSync, getAllDomainsSync } from './lib/domain-config';
import { verifyToken } from './lib/auth-utils';

// Protected routes that require authentication
const protectedRoutes = ['/admin', '/profile', '/dashboard'];

// Public auth routes that should redirect if already logged in
const authRoutes = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const domain = hostname.replace(/:\d+$/, '').toLowerCase();
  const pathname = request.nextUrl.pathname;
  
  // Get domain configuration
  const config = getDomainConfigSync(hostname);
  
  // Check authentication for protected routes
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
/*   if (isProtectedRoute || isAuthRoute) {
    // Get token from cookie or Authorization header
    const cookieToken = request.cookies.get('auth_token')?.value;
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    const token = cookieToken || headerToken;
    const isAuthenticated = token ? verifyToken(token).isValid : false;
    
    // Redirect unauthenticated users from protected routes
    if (isProtectedRoute && !isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Redirect authenticated users from auth routes
    if (isAuthRoute && isAuthenticated) {
      const redirectTo = request.nextUrl.searchParams.get('redirect') || '/';
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }
   */
  // Add domain info to headers for use in components
  const response = NextResponse.next();
  response.headers.set('x-domain', config.domain);
  response.headers.set('x-domain-name', config.name);
  
  // Add authentication status to headers
  const token = request.cookies.get('auth_token')?.value;
  const isAuthenticated = token ? verifyToken(token).isValid : false;
  response.headers.set('x-authenticated', isAuthenticated.toString());
  
/*   // Optional: Redirect www to non-www or vice versa
  if (domain.startsWith('www.') && !config.domain.startsWith('www.')) {
    const newUrl = request.nextUrl.clone();
    newUrl.hostname = config.domain;
    return NextResponse.redirect(newUrl, 301);
  }
  
  // Optional: Redirect non-www to www
  if (!domain.startsWith('www.') && config.domain.startsWith('www.')) {
    const newUrl = request.nextUrl.clone();
    newUrl.hostname = config.domain;
    return NextResponse.redirect(newUrl, 301);
  } */
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 