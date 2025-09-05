import { NextRequest, NextResponse } from 'next/server';
import { getDomainConfig } from '@/lib/domain-config';
import { fetchDetailSitemapTotalPage, fetchDocSitemapTotalPage } from '@/services/sitemap.service';


export async function GET(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const config = await getDomainConfig(hostname);
  
  const baseUrl = `https://${config.domain}`;
  
  try {
    // Get static pages
    // Generate sitemap index XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${config?.cateChip?.map(async (chip) => {
   const apiPath=chip["api-path"];
   const type=chip.id;
   const sitemapPagesCount = await fetchDocSitemapTotalPage(50000,apiPath);
    return Array.from({ length: sitemapPagesCount }, (_, i) => {
      const pageNum = i + 1;
      const url = `${baseUrl}/${type}-info-${pageNum}.xml`;
      const lastmod = new Date().toISOString();
      
      return `  <sitemap>
        <loc>${url}</loc>
        <lastmod>${lastmod}</lastmod>
      </sitemap>`;
    })

}).join('\n')}

${config?.cateChip?.map(async (chip) => {
   const apiPath=chip["api-path"];
   const type=chip.id;
   const sitemapPagesCount = await fetchDetailSitemapTotalPage(50000,apiPath);
    return Array.from({ length: sitemapPagesCount }, (_, i) => {
      const pageNum = i + 1;
      const url = `${baseUrl}/${type}-detail-${pageNum}.xml`;
      const lastmod = new Date().toISOString();
      
      return `  <sitemap>
        <loc>${url}</loc>
        <lastmod>${lastmod}</lastmod>
      </sitemap>`;
    })

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