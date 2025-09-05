import { NextRequest, NextResponse } from 'next/server';
import { getDomainConfig, getDomainConfigSync } from '@/lib/domain-config';
import { getSitemapPagesCount } from '@/lib/database';
import { fetchDocSitemap, fetchDocSitemapTotalPage } from '@/services/sitemap.service';

export async function GET(
  request: NextRequest,
    context: { params: Promise<{ type: string,page: string  }> }
) {
  const hostname = request.headers.get('host') || '';
  const config = await getDomainConfig(hostname);
  const baseUrl = `https://${config.domain}`;
  
  // Await the params object in Next.js 15
  const { type, page: pageParam } = await context.params;
 
  const page = parseInt(pageParam);
   let apiPath='';
  if(type!=='' && config)
  {
    const chip = config?.cateChip?.find(item => item.id === type);
    if (chip) {
      apiPath=chip["api-path"];
    
    }
  }
  if (isNaN(page) || page < 0) {
    return new NextResponse('Invalid page number', { status: 400 });
  }
  
  // Treat page 0 as page 1 for compatibility
  const actualPage = page <= 0 ? 0 : page-1;
/*    console.log('info-config', config);
   console.log('info-type', type);
  console.log('info-page', pageParam);
  console.log('info-api-path', apiPath); */

  // Check if page exists
  const totalPages = await fetchDocSitemapTotalPage(50000,apiPath);
  console.log('info-totalPages', totalPages);
  if (actualPage+1 > totalPages) {
    return new NextResponse('Page not found', { status: 404 });
  }
    try {
        // Get articles for this page
        const articles = await fetchDocSitemap(actualPage, 50000,apiPath);
        console.log('articles', articles);
        // Generate sitemap XML
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${articles.data?.data.map((article:any) => {
      const url = `${baseUrl}/${article.idDoc}?type=${type}`;
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
      } 
      catch (error) {
        console.error('Error generating sitemap:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
      }
}