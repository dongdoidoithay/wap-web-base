/**
 * Story API Service
 * Handles all API data fetching, caching, and data transformation for story-related endpoints
 */

import { API_CONFIG, STORY_API_CONFIG, getStoryCacheTtl, type ApiServiceConfig } from '../lib/api-config';
import { createFetchOptions, debugLog } from '../lib/api-config';

// API Interfaces
export interface StoryItem {
  idDoc: string;
  title: string;
  sortDesc?: string;
  image?: string;
  thumbnail?: string;
  url?: string;
  slug?: string;
  auth?: string;
  authName?: string;
  genres?: string;
  genresName?: string;
  status?: string;
  statusName?: string;
  views?: number;
  follows?: number;
  chapters?: number;
  lastChapter?: string;
  updatedAt?: string;
  createdAt?: string;
  date?: string;
}

export interface ApiResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  success?: boolean;
  message?: string;
  cacheStatus?: 'HIT' | 'MISS' | 'UNKNOWN';
  responseTime?: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Use centralized API configuration
const apiConfig = STORY_API_CONFIG;

// In-memory cache implementation
class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxEntries: number;

  constructor(maxEntries: number = 50) {
    this.maxEntries = maxEntries;
  }

  set<T>(key: string, data: T, ttl: number): void {
    if (this.cache.size >= this.maxEntries) {
      // Remove oldest entry (LRU-style cleanup)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
    };
  }
}

// Global cache instance
const apiCache = new MemoryCache(apiConfig.cache.maxEntries);

/**
 * Maps raw API response data to StoryItem interface
 */
function mapToStoryItem(item: any): StoryItem {
  return {
    idDoc:item.idDoc,
    title: item.name,
    sortDesc:  item.sortDesc,
    image: item.image,
    thumbnail: item.thumbnail,
    url: item.url,
    slug: item.slug,
    auth: item.auth,
    authName: item.authName ,
    genres:  item.genres,
    genresName: item.genresName ,
    status: item.status,
    statusName: item.statusName,
    views: item.views,
    follows: item.follows,
    chapters: item.dtaildocuments,
    date: item.date ,
  };
}

/**
 * Enhanced fetch function with timeout, compression, and error handling
 */
async function enhancedFetch(
  url: string,
  options: RequestInit = {},
  timeout: number = apiConfig.timeout
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...apiConfig.defaultHeaders,
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Generic API call function with caching support
 */
async function apiCall<T>(
  endpoint: string,
  cacheKey: string,
  cacheTtl: number = apiConfig.cache.defaultTtl,
  useCache: boolean = apiConfig.cache.enabled
): Promise<ApiResponse<T>> {
  const startTime = Date.now();
  let cacheStatus: 'HIT' | 'MISS' | 'UNKNOWN' = 'UNKNOWN';

  // Check cache first
  if (useCache && apiCache.has(cacheKey)) {
    const cachedData = apiCache.get<ApiResponse<T>>(cacheKey);
    if (cachedData) {
      cacheStatus = 'HIT';
      return {
        ...cachedData,
        cacheStatus,
        responseTime: Date.now() - startTime,
      };
    }
  }

  try {
    const url = `${apiConfig.baseUrl}${endpoint}`;
    console.log(`[StoryApiService] Fetching: ${url}`);

    const response = await enhancedFetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const rawData = await response.json();
    cacheStatus = 'MISS';

    // Transform data based on response structure
    const mappedData = Array.isArray(rawData) 
      ? rawData.map(mapToStoryItem)
      : (rawData.data || []).map(mapToStoryItem);

    const result: ApiResponse<T> = {
      data: mappedData as T[],
      total: rawData.total || rawData.length || mappedData.length,
      success: true,
      cacheStatus,
      responseTime: Date.now() - startTime,
    };

    // Cache the result
    if (useCache) {
      apiCache.set(cacheKey, result, cacheTtl);
    }

    console.log(`[StoryApiService] Success: ${url}, Time: ${result.responseTime}ms, Cache: ${cacheStatus}`);
    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[StoryApiService] Error fetching ${endpoint}:`, errorMessage);

    return {
      data: [],
      total: 0,
      success: false,
      message: errorMessage,
      cacheStatus,
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * Client-side API call function (for components)
 */
export async function clientApiCall<T>(
  endpoint: string,
  cacheKey: string,
  useCache: boolean = true
): Promise<ApiResponse<T>> {
  const startTime = Date.now();
  let cacheStatus: 'HIT' | 'MISS' | 'UNKNOWN' = 'UNKNOWN';

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: useCache ? 'default' : 'no-store',
    });

    const responseTime = Date.now() - startTime;
    cacheStatus = response.headers.get('X-API-Cache') as any || 'UNKNOWN';

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      ...result,
      cacheStatus,
      responseTime,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[StoryApiService] Client error:`, errorMessage);

    return {
      data: [],
      total: 0,
      success: false,
      message: errorMessage,
      cacheStatus,
      responseTime: Date.now() - startTime,
    };
  }
}

// Story API Service Functions

/**
 * Fetch latest updated stories with pagination
 */
export async function fetchLatestStories(
  limit: number = 22, 
  page: number = 0,
  useCache: boolean = true
): Promise<ApiResponse<StoryItem>> {
  const cacheKey = `latest-stories-${limit}-${page}`;
  return apiCall<StoryItem>(
    `/HomeLastUpdate/${limit}/${page}`,
    cacheKey,
    getStoryCacheTtl('latest'),
    useCache
  );
}

/**
 * Fetch top followed stories
 */
export async function fetchTopFollowStories(
  limit: number = 10, 
  page: number = 0,
  useCache: boolean = true
): Promise<ApiResponse<StoryItem>> {
  const cacheKey = `top-follow-stories-${limit}-${page}`;
  return apiCall<StoryItem>(
    `/HomeTopFllow/${limit}/${page}`,
    cacheKey,
    getStoryCacheTtl('topFollow'),
    useCache
  );
}

/**
 * Fetch top daily stories
 */
export async function fetchTopDayStories(
  limit: number = 100,
  useCache: boolean = true
): Promise<ApiResponse<StoryItem>> {
  const cacheKey = `top-day-stories-${limit}`;
  return apiCall<StoryItem>(
    `/HomeTopDay/${limit}`,
    cacheKey,
    getStoryCacheTtl('topDay'),
    useCache
  );
}

// Cache management functions

/**
 * Clear all cached data
 */
export function clearCache(): void {
  apiCache.clear();
  console.log('[StoryApiService] Cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return apiCache.getStats();
}

/**
 * Force refresh data by clearing specific cache entries
 */
export function invalidateCache(pattern?: string): void {
  if (pattern) {
    // Clear specific cache entries matching pattern
    // This would require implementing pattern matching
    console.log(`[StoryApiService] Invalidating cache entries matching: ${pattern}`);
  } else {
    clearCache();
  }
}

// Configuration management

/**
 * Update API configuration
 */
export function updateApiConfig(config: Partial<ApiServiceConfig>): void {
  Object.assign(apiConfig, config);
  debugLog('API configuration updated', config);
}

/**
 * Get current API configuration
 */
export function getApiConfig(): ApiServiceConfig {
  return { ...apiConfig };
}

// Re-export types for external use
export type { ApiServiceConfig };

// Export for legacy compatibility and direct usage
export const StoryApiService = {
  fetchLatestStories,
  fetchTopFollowStories,
  fetchTopDayStories,
  clientApiCall,
  clearCache,
  getCacheStats,
  invalidateCache,
  updateApiConfig,
  getApiConfig,
};

export default StoryApiService;