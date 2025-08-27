/**
 * Story API Service
 * Handles all API data fetching, caching, and data transformation for story-related endpoints
 */

import { STORY_API_CONFIG, getStoryCacheTtl, type ApiServiceConfig } from '../lib/api-config';

// API Interfaces
export interface StoryItem {
  idDoc: string;
  name: string;
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
  totalPage?: number;
  page?: number;
  limit?: number;
  success?: boolean;
  message?: string;
  cacheStatus?: 'HIT' | 'MISS' | 'UNKNOWN' | 'DISABLED';
  responseTime?: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Retry helper function for API calls - Fixed AbortController reuse issue
 */
async function apiFetch(
  url: string, 
  baseOptions: Omit<RequestInit, 'signal'>, // Remove signal from base options
  maxRetries: number = 2, 
  retryDelay: number = 1000,
  timeout: number = 8000
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Create a fresh AbortController for each attempt
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(`[RetryFetch] ⏰ Request timeout after ${timeout}ms`);
      controller.abort();
    }, timeout);
    
    try {
      if (attempt === 0) {
        console.log(`[RetryFetch] 🎡 Initial request to ${url}`);
      } else {
        console.log(`[RetryFetch] 🔄 Retry attempt ${attempt}/${maxRetries} for ${url}`);
      }
      
      // Create fresh fetch options with new signal
      const fetchOptions: RequestInit = {
        ...baseOptions,
        signal: controller.signal
      };
      
      const response = await fetch(url, fetchOptions);
      console.log(`[RetryFetch] ✅ Request successful:`, response);
      // Clear timeout on successful request
      clearTimeout(timeoutId);
      return response;
     
    } catch (error) {
      // Clear timeout on error
      clearTimeout(timeoutId);
      const errorMsg = `${error}`;
      console.warn(`[ERR] 🚨 HTTP Error`, errorMsg);
      
      // If this is the last attempt or a non-retryable error, throw
      if (attempt === maxRetries) {
        throw new Error(errorMsg);
      }
      
      // Wait before retrying
      if (attempt < maxRetries) {
        console.log(`[RetryFetch] ⏳ Waiting ${retryDelay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  // This should never be reached, but TypeScript requires it
  throw new Error('Maximum retries exceeded');
}

// Use centralized API configuration
const apiConfig = STORY_API_CONFIG;

/**
 * Transform function for API response items
 */
function transformItem(item: any, index: number): any {
  return {
    idDoc: item.idDoc,
    name: item.name ,
    sortDesc:item.sortDesc || '',
    image: item.image || '',
    thumbnail: item.image || '',
    url: item.url  || '',
    slug: item.slug || '',
    auth: item.auth || '',
    authName: item.authName || '',
    genres: item.genres || '',
    genresName: item.genresName || '',
    status: item.status || '',
    views: item.views || 0,
    follows: item.follows || 0,
    chapters: item.detail_documents || [],
    lastChapter: item.detail_documents || [],
    date: item.date|| new Date().toISOString()
  };
}

/**
 * Client-side API call function - calls external API directly
 */
export async function clientApiCall<T>(
  endpoint: string
): Promise<ApiResponse<T>> {
  const startTime = Date.now();
  let cacheStatus: 'HIT' | 'MISS' | 'UNKNOWN' | 'DISABLED' = 'DISABLED';

  try {
    // Parse endpoint to extract parameters for external API
    const url = new URL(endpoint, 'http://localhost'); // dummy base for URL parsing
    const searchParams = url.searchParams;
    const limit = parseInt(searchParams.get('limit') || '22', 10);
    const page = parseInt(searchParams.get('page') || '0', 10);

    // Validate parameters
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    if (page < 0) {
      throw new Error('Page must be 0 or greater');
    }

    // Build external API URL
    const externalApiUrl = `${apiConfig.baseUrl}/HomeLastUpdate/${limit}/${page}`;
    console.log(`[StoryApiService] Calling external API: ${externalApiUrl}`);

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

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const rawData = await response.json();
    console.log('[StoryApiService] External API response:', rawData);

    // Transform the response data
    const transformedData = Array.isArray(rawData) 
      ? rawData.map(transformItem)
      : rawData.data ? rawData.data.map(transformItem) : [];

    const result = {
      data: transformedData as T[],
      total: rawData.totalRecode ,
      totalPage: rawData.totalPage,
      page: page,
      limit: limit,
      success: true,
      cacheStatus,
      responseTime,
    };

    console.log(`[StoryApiService] Success: ${externalApiUrl}, Time: ${responseTime}ms, Items: ${transformedData.length}`);
    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[StoryApiService] External API error:`, errorMessage);

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
 * Fetch latest updated stories with pagination - calls external API directly with retry mechanism
 */
export async function fetchLatestStories(
  limit: number = 22, 
  page: number = 0
) {
  const startTime = Date.now();
  
  try {
    const externalApiUrl = `${apiConfig.baseUrl}/HomeLastUpdate/${limit}/${page}`;
    console.log(`[StoryApiService] 🚀 Starting latest stories request (limit: ${limit}, page: ${page})`);
    console.log(`[StoryApiService] 🌐 Request URL: ${externalApiUrl}`);
    console.log(`[StoryApiService] ⚙️ Config: timeout=${apiConfig.timeout}ms, baseUrl=${apiConfig.baseUrl}`);
    
    const fetchOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Connection': 'keep-alive',
        'User-Agent': 'Mozilla/5.0 (compatible; StoryReader/1.0)'
      },
      cache: 'no-store' as RequestCache
    };
    
    // Use retry mechanism with built-in timeout handling (1 retry for faster response)
    const response = await apiFetch(externalApiUrl, fetchOptions, 1, 1000, apiConfig.timeout);
    
    const rawData = await response.json();
    const transformedData = Array.isArray(rawData) 
      ? rawData.map(transformItem)
      : rawData.data ? rawData.data.map(transformItem) : [];
    
    const responseTime = Date.now() - startTime;
    console.log(`[StoryApiService] ✅ Latest stories API completed successfully in ${responseTime}ms (${transformedData.length} items)`);
    
    return {
      data: transformedData,
      total: rawData.totalRecode,
      totalPage: rawData.totalPage,
      page: page,
      limit: limit,
      success: true,
      cacheStatus: 'DISABLED',
      responseTime
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Enhanced logging with structured error information
    console.error(`[StoryApiService] ❌ Latest stories failed after ${responseTime}ms:`, {
      error: errorMessage,
      requestUrl: `${apiConfig.baseUrl}/HomeLastUpdate/${limit}/${page}`,
      apiConfig: {
        baseUrl: apiConfig.baseUrl,
        timeout: apiConfig.timeout,
        requestParams: { limit, page }
      }
    });
    
    return {
      data: [],
      total: 0,
      totalPage: 0,
      page: page,
      limit: limit,
      success: false,
      message: errorMessage,
      cacheStatus: 'DISABLED',
      responseTime
    };
  }
}

/**
 * Fetch top followed stories - calls external API directly with retry mechanism
 */
export async function fetchTopFollowStories(
  limit: number = 10, 
  page: number = 0
) {
  const startTime = Date.now();
  
  try {
    const externalApiUrl = `${apiConfig.baseUrl}/HomeTopFllow/${limit}/${page}`;
    console.log(`[StoryApiService] 🚀 Starting top follow stories request (limit: ${limit})`);
    
    const fetchOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Connection': 'keep-alive',
        'User-Agent': 'Mozilla/5.0 (compatible; StoryReader/1.0)'
      },
      cache: 'no-store' as RequestCache
    };
    
    // Use retry mechanism with built-in timeout handling (1 retry for faster response)  
    const response = await apiFetch(externalApiUrl, fetchOptions, 1, 1000, apiConfig.timeout);
    
    const rawData = await response.json();
    const transformedData = Array.isArray(rawData) 
      ? rawData.map(transformItem)
      : rawData.data ? rawData.data.map(transformItem) : [];
    
    const responseTime = Date.now() - startTime;
    console.log(`[StoryApiService] ✅ Top follow stories API completed successfully in ${responseTime}ms (${transformedData.length} items)`);
    
    return {
      data: transformedData,
      total: rawData.totalRecode ,
      totalPage: rawData.totalPage ,
      page: page,
      limit: limit,
      success: true,
      cacheStatus: 'DISABLED',
      responseTime
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const responseTime = Date.now() - startTime;
    
    console.error(`[StoryApiService] ❌ Top follow stories failed after ${responseTime}ms:`, {
      error: errorMessage,
      url: `${apiConfig.baseUrl}/HomeTopFllow/${limit}/${page}`,
      timeout: apiConfig.timeout
    });
    
    return {
      data: [],
      total: 0,
      totalPage: 0,
      page: page,
      limit: limit,
      success: false,
      message: errorMessage,
      cacheStatus: 'DISABLED',
      responseTime
    };
  }
}

/**
 * Fetch top daily stories - calls external API directly with retry mechanism
 */
export async function fetchTopDayStories(
  limit: number = 100
) {
  const startTime = Date.now();
  
  try {
    const externalApiUrl = `${apiConfig.baseUrl}/HomeTopDay/${limit}`;
    console.log(`[StoryApiService] 🚀 Starting top day stories request (limit: ${limit})`);
    
    const fetchOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Connection': 'keep-alive',
        'User-Agent': 'Mozilla/5.0 (compatible; StoryReader/1.0)'
      },
      cache: 'no-store' as RequestCache
    };
    
    // Use retry mechanism with built-in timeout handling (1 retry for faster response)
    const response = await apiFetch(externalApiUrl, fetchOptions, 1, 1000, apiConfig.timeout);
    
    const rawData = await response.json();
    const transformedData = Array.isArray(rawData) 
      ? rawData.map(transformItem)
      : rawData.data ? rawData.data.map(transformItem) : [];
    
    const responseTime = Date.now() - startTime;
    console.log(`[StoryApiService] ✅ Top day stories API completed successfully in ${responseTime}ms (${transformedData.length} items)`);
    
    return {
      data: transformedData,
      totalPage: rawData.totalPage,
      success: true,
      cacheStatus: 'DISABLED',
      responseTime
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const responseTime = Date.now() - startTime;
    
    console.error(`[StoryApiService] ❌ Top day stories failed after ${responseTime}ms:`, {
      error: errorMessage,
      url: `${apiConfig.baseUrl}/HomeTopDay/${limit}`,
      timeout: apiConfig.timeout
    });
    
    return {
      data: [],
      totalPage: 0,
      success: false,
      message: errorMessage,
      cacheStatus: 'DISABLED',
      responseTime
    };
  }
}

// Configuration management

/**
 * Update API configuration
 */
export function updateApiConfig(config: Partial<ApiServiceConfig>): void {
  Object.assign(apiConfig, config);
  console.log('API configuration updated', config);
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
  updateApiConfig,
  getApiConfig,
};

export default StoryApiService;