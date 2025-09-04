import { NextRequest, NextResponse } from 'next/server';
import { getDomainConfigSync } from '../../../../lib/domain-config';
import { getArticlesByPage, getSitemapPagesCount } from '../../../../lib/database';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ page: string }> }
) {
  const hostname = request.headers.get('host') || '';
  const config = getDomainConfigSync(hostname);
  const baseUrl = `https://${config.domain}`;
  
  // Await the params object in Next.js 15
  const { page: pageParam } = await context.params;
  const page = parseInt(pageParam);
  
  if (isNaN(page) || page < 1) {
    return new NextResponse('Invalid page number', { status: 400 });
  }
  
  // Check if page exists
  const totalPages = await getSitemapPagesCount();
  if (page > totalPages) {
    return new NextResponse('Page not found', { status: 404 });
  }
  
  try {
    // Get articles for this page
    const articles = await getArticlesByPage(page, 50000);
    
    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${articles.map((article) => {
  const url = `${baseUrl}/bai-viet/${article.slug}`;
  const lastmod = new Date(article.updated_at).toISOString();
  
  // Determine priority based on article age
  const daysSincePublished = Math.floor((Date.now() - new Date(article.published_at).getTime()) / (1000 * 60 * 60 * 24));
  let priority = 0.6;
  let changefreq = 'monthly';
  
  if (daysSincePublished < 7) {
    priority = 0.9;
    changefreq = 'daily';
  } else if (daysSincePublished < 30) {
    priority = 0.8;
    changefreq = 'weekly';
  } else if (daysSincePublished < 90) {
    priority = 0.7;
    changefreq = 'weekly';
  }
  
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
}).join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}