import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';
import { getDomainConfig } from '@/lib/domain-config';
import { fetchDetailSitemap, fetchDetailSitemapTotalPage } from '@/services/sitemap.service';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ type: string,page: string  }> }
) {
  const hostname = request.headers.get('host') || '';
  const config =  await getDomainConfig(hostname);
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
  
  // Define cache file path
  const cacheDir = join(process.cwd(), 'public', config.domain);
  const cacheFilePath = join(cacheDir, `${type}-detail-${pageParam}.xml`);
  
  try {
    // Check if cache directory exists, create if not
    try {
      await fs.access(cacheDir);
    } catch {
      await fs.mkdir(cacheDir, { recursive: true });
    }
    
    // Try to read from cache first
    try {
      const cachedData = await fs.readFile(cacheFilePath, 'utf8');
      console.log(`Serving cached file: ${cacheFilePath}`);
      return new NextResponse(cachedData, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      });
    } catch (fileError) {
      // File doesn't exist, continue to generate
      console.log(`Cache file not found, generating new sitemap: ${cacheFilePath}`);
    }
  
    // Check if page exists
    const totalPages = await fetchDetailSitemapTotalPage(50000,apiPath);
    if (actualPage+1 > totalPages) {
      return new NextResponse('Page not found', { status: 404 });
    }
    
    // Get articles for this page
    const articles = await fetchDetailSitemap(actualPage, 50000,apiPath);
    
    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${articles.data?.data.map((article:any) => {
  const url = `${baseUrl}/${article.idDoc}/${article.idDetail}`;
  const lastmod = new Date(article.date).toISOString();
  
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

    // Save to cache file
    try {
      await fs.writeFile(cacheFilePath, sitemap, 'utf8');
      console.log(`Sitemap cached to: ${cacheFilePath}`);
    } catch (writeError) {
      console.error('Error writing cache file:', writeError);
    }

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