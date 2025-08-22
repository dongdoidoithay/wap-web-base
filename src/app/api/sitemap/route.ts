import { NextRequest, NextResponse } from 'next/server';
import { getDomainConfig } from '../../../lib/domain-config';
import { getSitemapPagesCount, getStaticPages, getCategories } from '../../../lib/database';

export async function GET(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const config = getDomainConfig(hostname);
  
  const baseUrl = `https://${config.domain}`;
  
  try {
    // Get static pages
    const staticPages = await getStaticPages();
    
    // Get categories
    const categories = await getCategories();
    const categoryPages = categories.map(category => 
      `/chuyen-muc/${encodeURIComponent(category)}`
    );
    
    // Get total sitemap pages count
    const sitemapPagesCount = await getSitemapPagesCount();
    
    // Generate sitemap index XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map((page) => {
  const url = `${baseUrl}${page}`;
  const lastmod = new Date().toISOString();
  
  return `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`;
}).join('\n')}
${categoryPages.map((page) => {
  const url = `${baseUrl}${page}`;
  const lastmod = new Date().toISOString();
  
  return `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`;
}).join('\n')}
${Array.from({ length: sitemapPagesCount }, (_, i) => {
  const pageNum = i + 1;
  const url = `${baseUrl}/sitemap-articles-${pageNum}.xml`;
  const lastmod = new Date().toISOString();
  
  return `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`;
}).join('\n')}
</sitemapindex>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 