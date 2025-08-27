/**
 * Story Detail Service
 * Handles fetching detailed information about individual stories
 */

import { STORY_API_CONFIG } from '../lib/api-config';
import type { StoryItem, StoryDetail, Chapter } from '../types';

export interface StoryDetailResponse {
  data: StoryDetail | null;
  success: boolean;
  message?: string;
  responseTime?: number;
}

// Use centralized API configuration
const apiConfig = STORY_API_CONFIG;

/**
 * Maps raw API response data to StoryDetail interface
 */
function mapToStoryDetail(item: any): StoryDetail {
  return {
    idDoc: item.idDoc || item.id || '',
    name: item.name || item.title || '',
    sortDesc: item.sortDesc || item.description || item.summary || '',
    description: item.description || item.content || '',
    image: item.image || item.cover || item.thumbnail || '',
    thumbnail: item.thumbnail || item.image || item.cover || '',
    url: item.url || item.link || '',
    slug: item.slug || '',
    auth: item.auth || item.author_id || '',
    authName: item.authName || item.author || item.author_name || '',
    genres: item.genres || item.category_ids || '',
    genresName: item.genresName || item.categories || item.genre || '',
    status: item.status || '',
    statusName: item.statusName || item.status_name || '',
    views: parseInt(item.views) || 0,
    follows: parseInt(item.follows) || parseInt(item.bookmarks) || 0,
    chapters: parseInt(item.chapters) || parseInt(item.chapter_count) || 0,
    lastChapter: item.lastChapter || item.last_chapter || '',
    updatedAt: item.updatedAt || item.updated_at || item.modified_date || '',
    createdAt: item.createdAt || item.created_at || item.publish_date || '',
    date: item.date || item.updatedAt || item.updated_at || '',
    rating: parseFloat(item.rating) || 0,
    tags: Array.isArray(item.tags) ? item.tags : [],
  };
}

/**
 * Client-side function to fetch story detail
 */
export async function fetchStoryDetail(slug: string): Promise<StoryDetailResponse> {
  const startTime = Date.now();

  try {
    if (!slug) {
      throw new Error('Story slug is required');
    }

    // Build external API URL for story detail
    const externalApiUrl = `${apiConfig.baseUrl}/story/${encodeURIComponent(slug)}`;
    console.log(`[StoryDetailService] Calling external API: ${externalApiUrl}`);

    // Create fetch options with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);

    const response = await fetch(externalApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br'
      },
      signal: controller.signal,
      cache: 'no-store'
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    if (response.status === 404) {
      return {
        data: null,
        success: false,
        message: 'Story not found',
        responseTime,
      };
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const rawData = await response.json();
    console.log('[StoryDetailService] External API response:', rawData);

    // Handle different response formats
    let storyData = null;
    if (rawData && typeof rawData === 'object') {
      if (rawData.data) {
        storyData = rawData.data;
      } else if (rawData.idDoc || rawData.id || rawData.name || rawData.title) {
        storyData = rawData;
      }
    }

    if (!storyData) {
      return {
        data: null,
        success: false,
        message: 'Invalid story data received',
        responseTime,
      };
    }

    // Transform the response data
    const transformedStory = mapToStoryDetail(storyData);

    const result = {
      data: transformedStory,
      success: true,
      responseTime,
    };

    console.log(`[StoryDetailService] Success: ${externalApiUrl}, Time: ${responseTime}ms`);
    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[StoryDetailService] Error:`, errorMessage);

    return {
      data: null,
      success: false,
      message: errorMessage,
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * Server-side synchronous function to fetch story detail for metadata generation
 * This is a simplified version that can be used in generateMetadata
 */
export async function fetchStoryDetailSync(slug: string): Promise<StoryDetail | null> {
  try {
    const result = await fetchStoryDetail(slug);
    return result.success ? result.data : null;
  } catch (error) {
    console.error('[StoryDetailService] Sync fetch error:', error);
    return null;
  }
}

/**
 * Mock data generator for development/testing
 * Remove this in production when real API is available
 */
export function generateMockStoryDetail(slug: string): StoryDetail {
  return {
    idDoc: `story-${slug}`,
    name: `Truyện ${slug.charAt(0).toUpperCase() + slug.slice(1)}`,
    sortDesc: `Đây là mô tả ngắn cho truyện ${slug}. Một câu chuyện hấp dẫn với nhiều tình tiết thú vị và nhân vật sinh động.`,
    description: `Mô tả chi tiết về truyện ${slug}. Câu chuyện xoay quanh những nhân vật chính với những cuộc phiêu lưu đầy thú vị. Với lối viết lôi cuốn và cốt truyện hấp dẫn, đây là một tác phẩm đáng đọc.`,
    image: `https://picsum.photos/600/800?random=${slug}`,
    thumbnail: `https://picsum.photos/300/400?random=${slug}`,
    url: `/story/${slug}`,
    slug: slug,
    auth: 'author-001',
    authName: 'Tác Giả Demo',
    genres: 'fantasy,romance',
    genresName: 'Huyền Huyễn, Lãng Mạn',
    status: 'ongoing',
    statusName: 'Đang cập nhật',
    views: Math.floor(Math.random() * 100000) + 10000,
    follows: Math.floor(Math.random() * 10000) + 1000,
    chapters: Math.floor(Math.random() * 500) + 50,
    lastChapter: `Chương ${Math.floor(Math.random() * 500) + 50}: Tiêu đề chương`,
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    date: new Date().toISOString(),
    rating: Math.random() * 2 + 3, // 3-5 stars
    tags: ['tag1', 'tag2', 'tag3'],
  };
}

/**
 * Development fallback function that returns mock data
 * Replace this with real API calls when backend is ready
 */
export async function fetchStoryDetailDev(slug: string): Promise<StoryDetailResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
  
  // Simulate occasional errors for testing
  if (Math.random() < 0.1) {
    return {
      data: null,
      success: false,
      message: 'Simulated network error',
      responseTime: 1000,
    };
  }

  // Return mock data
  return {
    data: generateMockStoryDetail(slug),
    success: true,
    responseTime: Math.random() * 500 + 200,
  };
}