import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getDomainConfig } from '@/lib/domain-config';
import { fetchDetailSitemapTotalPage, fetchDocSitemapTotalPage } from '@/services/sitemap.service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const config = await getDomainConfig(hostname);
    
  
  const baseUrl = `https://${config.domain}`;
  
  const sitemapEntries: MetadataRoute.Sitemap = [];
  
  // Process each chip sequentially to ensure proper async handling
  if (config?.cateChip) {
    for (const chip of config.cateChip) {
      const apiPath = chip["api-path"];
      const type = chip.id;
      
      try {
        // Fetch document sitemap count
        const sitemapPagesCount = await fetchDocSitemapTotalPage(50000, apiPath);
        
        for (let i = 1; i <= sitemapPagesCount; i++) {
          sitemapEntries.push({
            url: `${baseUrl}/${type}-info-${i}.xml`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.5,
          });
        }
        
        // Fetch detail sitemap count
        const sitemapDetailPagesCount = await fetchDetailSitemapTotalPage(50000, apiPath);
        
        for (let i = 1; i <= sitemapDetailPagesCount; i++) {
          sitemapEntries.push({
            url: `${baseUrl}/${type}-detail-${i}.xml`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.5,
          });
        }
      } catch (error) {
        console.error(`Error processing chip ${type}:`, error);
        // Continue with other chips even if one fails
      }
    }
  }

  return sitemapEntries;
}