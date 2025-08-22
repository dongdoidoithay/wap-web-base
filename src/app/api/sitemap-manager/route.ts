import { NextRequest, NextResponse } from 'next/server';
import { getSitemapCache, setSitemapCache, invalidateSitemapCache, getCacheStats } from '../../../lib/sitemap-cache';
import { getDomainConfig } from '../../../lib/domain-config';
import { getArticlesCount, getSitemapPagesCount } from '../../../lib/database';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hostname = searchParams.get('hostname');
  
  if (!hostname) {
    return NextResponse.json({ error: 'Hostname is required' }, { status: 400 });
  }
  
  try {
    const config = getDomainConfig(hostname);
    const cache = await getSitemapCache(config.domain);
    
    if (!cache) {
      // Generate cache if not exists
      await setSitemapCache(config.domain);
      const newCache = await getSitemapCache(config.domain);
      
      return NextResponse.json({
        domain: config.domain,
        cache: newCache,
        stats: getCacheStats(),
      });
    }
    
    return NextResponse.json({
      domain: config.domain,
      cache,
      stats: getCacheStats(),
    });
  } catch (error) {
    console.error('Error getting sitemap cache:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hostname = searchParams.get('hostname');
  const action = searchParams.get('action');
  
  if (!hostname) {
    return NextResponse.json({ error: 'Hostname is required' }, { status: 400 });
  }
  
  try {
    const config = getDomainConfig(hostname);
    
    switch (action) {
      case 'regenerate':
        await invalidateSitemapCache(config.domain);
        await setSitemapCache(config.domain);
        return NextResponse.json({ 
          success: true, 
          message: 'Sitemap cache regenerated',
          domain: config.domain 
        });
        
      case 'invalidate':
        await invalidateSitemapCache(config.domain);
        return NextResponse.json({ 
          success: true, 
          message: 'Sitemap cache invalidated',
          domain: config.domain 
        });
        
      case 'stats':
        const [articlesCount, sitemapPagesCount] = await Promise.all([
          getArticlesCount(),
          getSitemapPagesCount(),
        ]);
        
        return NextResponse.json({
          domain: config.domain,
          articlesCount,
          sitemapPagesCount,
          cacheStats: getCacheStats(),
        });
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error managing sitemap:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 