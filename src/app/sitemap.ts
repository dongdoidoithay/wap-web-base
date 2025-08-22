import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getDomainConfig } from '../../lib/domain-config';
import { getSitemapPagesCount, getStaticPages, getCategories } from '../../lib/database';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const config = getDomainConfig(hostname);
  
  const baseUrl = `https://${config.domain}`;
  
  // Get static pages
  const staticPages = await getStaticPages();
  
  // Get categories
  const categories = await getCategories();
  const categoryPages = categories.map(category => 
    `/chuyen-muc/${encodeURIComponent(category)}`
  );
  
  // Get total sitemap pages count
  const sitemapPagesCount = await getSitemapPagesCount();
  
  const sitemapEntries: MetadataRoute.Sitemap = [];
  
  // Add static pages
  sitemapEntries.push(...staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  })));
  
  // Add category pages
  sitemapEntries.push(...categoryPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })));
  
  // Add sitemap index entries
  for (let i = 1; i <= sitemapPagesCount; i++) {
    sitemapEntries.push({
      url: `${baseUrl}/sitemap-articles-${i}.xml`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.5,
    });
  }
  
  return sitemapEntries;
} 