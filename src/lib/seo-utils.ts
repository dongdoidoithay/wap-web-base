/**
 * Advanced SEO Utilities for AI Bots and Search Engine Optimization
 * This module provides enhanced tools for optimizing content visibility
 * across search engines and AI training systems.
 */

import { DomainConfig } from '@/types';

// =========================
// AI BOT DETECTION & SUPPORT
// =========================

/**
 * Comprehensive list of AI bots and their user agents
 */
export const AI_BOT_USER_AGENTS = {
  // OpenAI Bots
  CHATGPT: ['ChatGPT-User', 'GPTBot'],
  
  // Anthropic Bots  
  CLAUDE: ['anthropic-ai', 'Claude-Web'],
  
  // Google AI Bots
  GOOGLE_AI: ['Google-Extended', 'GoogleOther'],
  
  // Common Crawl (used by many AI systems)
  COMMON_CRAWL: ['CCBot'],
  
  // Meta/Facebook AI
  META_AI: ['FacebookBot', 'Meta-ExternalAgent'],
  
  // Other AI Systems
  PERPLEXITY: ['PerplexityBot'],
  YOU_COM: ['YouBot'],
  BING_AI: ['BingPreview'],
  
  // Research & Academic Bots
  SEMANTIC_SCHOLAR: ['SemanticScholarBot'],
  INTERNET_ARCHIVE: ['archive.org_bot', 'ia_archiver'],
};

/**
 * Detect if the current request is from an AI bot
 */
export function isAIBot(userAgent: string): boolean {
  const normalizedUA = userAgent.toLowerCase();
  
  return Object.values(AI_BOT_USER_AGENTS)
    .flat()
    .some(botUA => normalizedUA.includes(botUA.toLowerCase()));
}

/**
 * Get AI bot type from user agent
 */
export function getAIBotType(userAgent: string): string | null {
  const normalizedUA = userAgent.toLowerCase();
  
  for (const [botType, userAgents] of Object.entries(AI_BOT_USER_AGENTS)) {
    if (userAgents.some(ua => normalizedUA.includes(ua.toLowerCase()))) {
      return botType;
    }
  }
  
  return null;
}

// =========================
// STRUCTURED DATA GENERATORS
// =========================

/**
 * Generate enhanced Organization schema for AI understanding
 */
export function generateOrganizationSchema(config: DomainConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `https://${config.domain}#organization`,
    name: config.name,
    url: `https://${config.domain}`,
    description: config.description,
    logo: {
      "@type": "ImageObject",
      url: `https://${config.domain}${config.logo}`,
      width: 512,
      height: 512,
    },
    sameAs: [
      config.social?.facebook,
      config.social?.twitter,
      config.social?.instagram,
    ].filter(Boolean),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: `https://${config.domain}/contact`,
    },
    foundingDate: "2024",
    numberOfEmployees: "1-10",
    slogan: config.description,
    keywords: config.seo?.keywords?.join(', '),
  };
}

/**
 * Generate enhanced WebSite schema with advanced AI support
 */
export function generateWebSiteSchema(config: DomainConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `https://${config.domain}#website`,
    name: config.name,
    url: `https://${config.domain}`,
    description: config.description,
    inLanguage: "vi-VN",
    
    // Enhanced for AI understanding
    author: {
      "@type": "Organization",
      "@id": `https://${config.domain}#organization`,
    },
    
    publisher: {
      "@type": "Organization",
      "@id": `https://${config.domain}#organization`,
    },
    
    potentialAction: [
      {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `https://${config.domain}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
      {
        "@type": "ReadAction",
        target: `https://${config.domain}`,
        expectsAcceptanceOf: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          price: "0",
          priceCurrency: "USD",
        },
      },
    ],
    
    mainEntity: {
      "@type": "WebPage",
      url: `https://${config.domain}`,
      name: config.name,
      description: config.description,
    },
    
    copyrightYear: new Date().getFullYear(),
    copyrightHolder: {
      "@type": "Organization",
      "@id": `https://${config.domain}#organization`,
    },
    
    // AI Training and Usage Information
    usageInfo: "Content available for AI training and indexing",
    license: "https://creativecommons.org/licenses/by/4.0/",
    isAccessibleForFree: true,
    
    // Enhanced metadata for AI
    keywords: config.seo?.keywords?.join(', '),
    genre: "Literature, Stories, Reading",
    audience: {
      "@type": "Audience",
      audienceType: "general public",
      geographicArea: {
        "@type": "Country",
        name: "Vietnam",
      },
    },
  };
}

/**
 * Generate comprehensive Book/Story schema for literature content
 */
export function generateBookSchema(data: {
  title: string;
  author: string;
  description: string;
  genre: string;
  chapters: number;
  publishDate: string;
  url: string;
  image?: string;
  config: DomainConfig;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": `${data.url}#book`,
    name: data.title,
    description: data.description,
    url: data.url,
    
    author: {
      "@type": "Person",
      name: data.author,
      url: `https://${data.config.domain}/author/${encodeURIComponent(data.author)}`,
    },
    
    publisher: {
      "@type": "Organization",
      "@id": `https://${data.config.domain}#organization`,
    },
    
    datePublished: data.publishDate,
    inLanguage: "vi-VN",
    genre: data.genre,
    bookFormat: "https://schema.org/EBook",
    isAccessibleForFree: true,
    
    // Enhanced metadata
    numberOfPages: data.chapters,
    typicalAgeRange: "13-99",
    contentRating: "General",
    
    image: data.image ? `https://${data.config.domain}${data.image}` : undefined,
    
    // AI and accessibility
    accessibilityFeature: [
      "readingOrder",
      "structuralNavigation", 
      "tableOfContents",
    ],
    
    usageInfo: "Available for reading and AI training",
    copyrightYear: new Date().getFullYear(),
    copyrightHolder: {
      "@type": "Organization",
      "@id": `https://${data.config.domain}#organization`,
    },
    
    // Reading statistics for AI understanding
    audience: {
      "@type": "Audience",
      audienceType: "general readers",
    },
    
    workExample: {
      "@type": "WebPage",
      url: data.url,
      name: data.title,
    },
  };
}

/**
 * Generate Chapter schema for individual chapter pages
 */
export function generateChapterSchema(data: {
  chapterTitle: string;
  chapterNumber: number;
  bookTitle: string;
  bookUrl: string;
  chapterUrl: string;
  content: string;
  publishDate: string;
  author: string;
  config: DomainConfig;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Chapter",
    "@id": `${data.chapterUrl}#chapter`,
    name: data.chapterTitle,
    url: data.chapterUrl,
    position: data.chapterNumber,
    
    isPartOf: {
      "@type": "Book",
      "@id": `${data.bookUrl}#book`,
      name: data.bookTitle,
      url: data.bookUrl,
    },
    
    author: {
      "@type": "Person",
      name: data.author,
    },
    
    publisher: {
      "@type": "Organization",
      "@id": `https://${data.config.domain}#organization`,
    },
    
    datePublished: data.publishDate,
    inLanguage: "vi-VN",
    
    // Content analysis for AI
    wordCount: data.content.length,
    text: data.content.substring(0, 500) + "...", // Preview for AI
    
    // Enhanced metadata
    genre: "Literature",
    isAccessibleForFree: true,
    usageInfo: "Available for reading and AI analysis",
    
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": data.chapterUrl,
      url: data.chapterUrl,
      name: data.chapterTitle,
    },
    
    // Navigation aids for AI
    hasPart: data.content.split('\n\n').length > 1 ? {
      "@type": "WebPageElement",
      cssSelector: ".chapter-content p",
    } : undefined,
  };
}

// =========================
// SEO OPTIMIZATION UTILITIES
// =========================

/**
 * Generate optimized meta description for AI and search engines
 */
export function generateOptimizedDescription(
  content: string,
  title: string,
  keywords: string[],
  maxLength: number = 160
): string {
  // Extract first meaningful sentence
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  let description = sentences[0]?.trim() || content.substring(0, 100);
  
  // Ensure title is included for relevance
  if (!description.toLowerCase().includes(title.toLowerCase().split(' ')[0])) {
    description = `${title}: ${description}`;
  }
  
  // Add primary keyword if not present
  const primaryKeyword = keywords[0];
  if (primaryKeyword && !description.toLowerCase().includes(primaryKeyword.toLowerCase())) {
    description += ` - ${primaryKeyword}`;
  }
  
  // Truncate to optimal length
  if (description.length > maxLength) {
    description = description.substring(0, maxLength - 3) + '...';
  }
  
  return description;
}

/**
 * Generate reading time estimate for content
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200; // Average reading speed
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Extract key phrases for better SEO and AI understanding
 */
export function extractKeyPhrases(content: string, limit: number = 10): string[] {
  // Simple key phrase extraction (could be enhanced with NLP)
  const words = content.toLowerCase().match(/\b[\w]{3,}\b/g) || [];
  const frequency: Record<string, number> = {};
  
  words.forEach(word => {
    if (word.length > 3) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  });
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([word]) => word);
}

// =========================
// PERFORMANCE OPTIMIZATION
// =========================

/**
 * Generate critical resource hints for faster loading
 */
export function generateResourceHints(config: DomainConfig) {
  const hints = [];
  
  // DNS prefetch for external resources
  if (config.seo?.googleAnalyticsId) {
    hints.push({
      rel: 'dns-prefetch',
      href: 'https://www.googletagmanager.com',
    });
  }
  
  // Preconnect to critical third parties
  hints.push(
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' }
  );
  
  // Prefetch logo and critical images
  if (config.logo) {
    hints.push({
      rel: 'prefetch',
      href: `https://${config.domain}${config.logo}`,
      as: 'image',
    });
  }
  
  return hints;
}

/**
 * Generate optimized Open Graph data for social sharing and AI
 */
export function generateOpenGraphData(data: {
  title: string;
  description: string;
  url: string;
  image?: string;
  config: DomainConfig;
  type?: 'website' | 'article' | 'book';
  author?: string;
  publishedTime?: string;
}) {
  return {
    title: data.title,
    description: data.description,
    url: data.url,
    type: data.type || 'website',
    siteName: data.config.name,
    locale: 'vi_VN',
    
    images: [
      {
        url: data.image || `https://${data.config.domain}${data.config.seo?.ogImage}`,
        width: 1200,
        height: 630,
        alt: data.title,
        type: 'image/png',
      },
    ],
    
    // Enhanced metadata for AI systems
    ...(data.type === 'article' && {
      article: {
        publishedTime: data.publishedTime,
        author: data.author,
        section: 'Literature',
        tags: data.config.seo?.keywords || [],
      },
    }),
    
    // Additional metadata for better AI understanding
    determiner: 'auto',
    alternateLocale: ['en_US'],
  };
}

export default {
  AI_BOT_USER_AGENTS,
  isAIBot,
  getAIBotType,
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateBookSchema,
  generateChapterSchema,
  generateOptimizedDescription,
  calculateReadingTime,
  extractKeyPhrases,
  generateResourceHints,
  generateOpenGraphData,
};