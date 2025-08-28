/**
 * AI Bot and Search Engine Robots Directives Generator
 * Optimized for modern AI systems and search engines
 */

import { headers } from 'next/headers';

/**
 * Generate comprehensive robots meta directives
 */
export async function generateRobotsDirectives(options: {
  noindex?: boolean;
  nofollow?: boolean;
  noarchive?: boolean;
  nosnippet?: boolean;
  noimageindex?: boolean;
  maxSnippet?: number;
  maxImagePreview?: 'none' | 'standard' | 'large';
  maxVideoPreview?: number;
  unavailableAfter?: string;
  aiTraining?: boolean;
}) {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  
  // Base directives
  const directives = [];
  
  if (options.noindex) directives.push('noindex');
  else directives.push('index');
  
  if (options.nofollow) directives.push('nofollow');
  else directives.push('follow');
  
  if (options.noarchive) directives.push('noarchive');
  if (options.nosnippet) directives.push('nosnippet');
  if (options.noimageindex) directives.push('noimageindex');
  
  // Enhanced directives for modern bots
  if (options.maxSnippet !== undefined) {
    directives.push(`max-snippet:${options.maxSnippet}`);
  }
  
  if (options.maxImagePreview) {
    directives.push(`max-image-preview:${options.maxImagePreview}`);
  }
  
  if (options.maxVideoPreview !== undefined) {
    directives.push(`max-video-preview:${options.maxVideoPreview}`);
  }
  
  if (options.unavailableAfter) {
    directives.push(`unavailable_after:${options.unavailableAfter}`);
  }
  
  return directives.join(', ');
}

/**
 * AI Bot specific meta tags
 */
export const AI_BOT_META_TAGS = {
  // Content classification for AI
  'ai-content-declaration': 'human-authored',
  'content-usage': 'training-allowed', 
  'AI-generated': 'false',
  'content-policy': 'open',
  'ai-training': 'allowed',
  
  // Quality signals for AI
  'content-quality': 'high',
  'content-freshness': 'updated',
  'content-language-confidence': 'high',
  'content-type': 'article',
  'reading-level': 'general',
  
  // Usage permissions
  'robots-nocache': 'false',
  'content-license': 'open',
  'data-usage': 'analytical',
};

/**
 * Generate AI-optimized meta tags
 */
export function generateAIMetaTags(customTags: Record<string, string> = {}) {
  return {
    ...AI_BOT_META_TAGS,
    ...customTags,
  };
}