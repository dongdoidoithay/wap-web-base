import { NextRequest, NextResponse } from 'next/server';
import { getDomainConfig } from '../../../lib/domain-config';

export async function GET(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const config = getDomainConfig(hostname);
  
  const baseUrl = `https://${config.domain}`;
  
  const robots = `User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /private/

# Sitemap Index
Sitemap: ${baseUrl}/sitemap.xml

Host: ${baseUrl}`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
} 