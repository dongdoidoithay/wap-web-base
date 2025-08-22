import { NextRequest, NextResponse } from 'next/server';
import { getDomainConfig, getAllDomains } from './lib/domain-config';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const domain = hostname.replace(/:\d+$/, '').toLowerCase();
  
  // Get domain configuration
  const config = getDomainConfig(hostname);
  
  // Add domain info to headers for use in components
  const response = NextResponse.next();
  response.headers.set('x-domain', config.domain);
  response.headers.set('x-domain-name', config.name);
  
  // Optional: Redirect www to non-www or vice versa
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
  }
  
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