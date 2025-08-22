import { getArticlesCount, getSitemapPagesCount } from './database';

interface SitemapCache {
  lastGenerated: number;
  totalArticles: number;
  totalPages: number;
  isGenerating: boolean;
}

const cache: Map<string, SitemapCache> = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function getSitemapCache(domain: string): Promise<SitemapCache | null> {
  const cached = cache.get(domain);
  
  if (!cached) {
    return null;
  }
  
  // Check if cache is still valid
  if (Date.now() - cached.lastGenerated < CACHE_DURATION) {
    return cached;
  }
  
  // Cache expired, remove it
  cache.delete(domain);
  return null;
}

export async function setSitemapCache(domain: string): Promise<void> {
  if (cache.get(domain)?.isGenerating) {
    return; // Already generating
  }
  
  cache.set(domain, {
    lastGenerated: Date.now(),
    totalArticles: 0,
    totalPages: 0,
    isGenerating: true,
  });
  
  try {
    const [totalArticles, totalPages] = await Promise.all([
      getArticlesCount(),
      getSitemapPagesCount(),
    ]);
    
    cache.set(domain, {
      lastGenerated: Date.now(),
      totalArticles,
      totalPages,
      isGenerating: false,
    });
  } catch (error) {
    cache.delete(domain);
    throw error;
  }
}

export async function invalidateSitemapCache(domain: string): Promise<void> {
  cache.delete(domain);
}

export function getCacheStats(): { domains: number; totalSize: number } {
  return {
    domains: cache.size,
    totalSize: Array.from(cache.values()).reduce((sum, item) => sum + JSON.stringify(item).length, 0),
  };
} 