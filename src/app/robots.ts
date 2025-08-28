import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getDomainConfigSync } from '@/lib/domain-config';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const config = getDomainConfigSync(hostname);
  
  const baseUrl = `https://${config.domain}`;
  
  return {
    rules: [
      // General crawlers with optimized settings
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
          '/temp/',
          '/cache/',
          '/error/',
          '/*?*utm_*', // Block UTM tracking parameters
          '/*?*fb_*',  // Block Facebook tracking
          '/*?*gclid*', // Block Google click tracking
        ],
        crawlDelay: 1, // Be respectful to servers
      },
      
      // Enhanced Googlebot configuration
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
        ],
        crawlDelay: 0.5, // Googlebot can handle faster crawling
      },
      
      // Bing bot optimization
      {
        userAgent: 'bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
        ],
        crawlDelay: 1,
      },
      
      // AI Bots - Comprehensive Support
      {
        userAgent: 'ChatGPT-User', // OpenAI's ChatGPT
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
        ],
      },
      
      {
        userAgent: 'CCBot', // Common Crawl (used by many AI systems)
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
        ],
      },
      
      {
        userAgent: 'anthropic-ai', // Claude/Anthropic
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
        ],
      },
      
      {
        userAgent: 'Claude-Web', // Claude's web crawler
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
        ],
      },
      
      {
        userAgent: 'Google-Extended', // Google's AI training crawler
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
        ],
      },
      
      {
        userAgent: 'FacebookBot', // Meta AI systems
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
        ],
      },
      
      // Other important search engines
      {
        userAgent: 'YandexBot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
        ],
        crawlDelay: 2,
      },
      
      {
        userAgent: 'Baiduspider',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
        ],
        crawlDelay: 2,
      },
      
      // Block harmful bots
      {
        userAgent: [
          'AhrefsBot',
          'SemrushBot', 
          'MJ12bot',
          'DotBot',
          'archive.org_bot',
          'SiteAuditBot',
        ],
        disallow: '/',
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-index.xml`,
    ],
    host: baseUrl,
  };
} 