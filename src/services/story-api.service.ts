/**
 * Story API Service
 * Handles all API data fetching, caching, and data transformation for story-related endpoints
 */

import { getStoryApiConfig, getStoryCacheTtl, type ApiServiceConfig } from '../lib/api-config';

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

// Variable to hold the current API path
let currentApiPath = typeof window !== 'undefined' 
  ? localStorage.getItem('selectedApiPath') || '/api/novel-vn'
  : '/api/novel-vn';

/**
 * Set the current API path
 */
export function setCurrentApiPath(apiPath: string): void {
  currentApiPath = apiPath;
  apiConfig = getStoryApiConfig(currentApiPath);
}

/**
 * Get the current API path
 */
export function getCurrentApiPath(): string {
  return currentApiPath;
}

/**
 * Get API configuration with current API path
 */
export function getApiConfig(): ApiServiceConfig {
  return getStoryApiConfig(currentApiPath);
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

// Use centralized API configuration with dynamic API path
let apiConfig = getStoryApiConfig(currentApiPath);

/**
 * Transform function for API response items
 */
function transformItem(item: any, index: number): any {
  return {
    idDoc: item.idDoc,
    name: item.name ,
    sortDesc:item.sortDesc || '',
    image:  item.tags ||item.image || '',
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
  // Update API config with current path
  apiConfig = getApiConfig();
  
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
  // Update API config with current path
  apiConfig = getApiConfig();
  
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
  // Update API config with current path
  apiConfig = getApiConfig();
  
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

/**
 * Fetch stories by mode (auth or genres) with pagination - calls external API directly with retry mechanism
 */
export async function fetchStoriesByMode(
  mode: 'auth' | 'genres',
  id: string,
  count: number = 22,
  page: number = 0
) {
  // Update API config with current path
  apiConfig = getApiConfig();
  
  const startTime = Date.now();
  
  try {
    const externalApiUrl = `${apiConfig.baseUrl}/getFindOption/${mode}/${id}/${count}/${page}`;
    console.log(`[StoryApiService] 🚀 Starting ${mode} stories request (id: ${id}, count: ${count}, page: ${page})`);
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
    console.log(`[StoryApiService] ✅ ${mode} stories API completed successfully in ${responseTime}ms (${transformedData.length} items)`);
    
    return {
      data: transformedData,
      total: rawData.totalRecode || rawData.total || 0,
      totalPage: rawData.totalPage || Math.ceil((rawData.totalRecode || rawData.total || 0) / count),
      page: page,
      limit: count,
      success: true,
      cacheStatus: 'DISABLED',
      responseTime
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Enhanced logging with structured error information
    console.error(`[StoryApiService] ❌ ${mode} stories failed after ${responseTime}ms:`, {
      error: errorMessage,
      requestUrl: `${apiConfig.baseUrl}/getFindOption/${mode}/${id}/${count}/${page}`,
      apiConfig: {
        baseUrl: apiConfig.baseUrl,
        timeout: apiConfig.timeout,
        requestParams: { mode, id, count, page }
      }
    });
    
    return {
      data: [],
      total: 0,
      totalPage: 0,
      page: page,
      limit: count,
      success: false,
      message: errorMessage,
      cacheStatus: 'DISABLED',
      responseTime
    };
  }
}

/**
 * Search stories by keyword - calls external API directly with retry mechanism
 */
export async function fetchSearchStories(
  count: number = 20,
  page: number = 0,
  keyword: string = ''
): Promise<ApiResponse<StoryItem>> {
  // Update API config with current path
  apiConfig = getApiConfig();
  
  const startTime = Date.now();

  try {
    if (!keyword.trim()) {
      return {
        data: [],
        total: 0,
        totalPage: 0,
        page: page,
        limit: count,
        success: false,
        message: 'Keyword is required for search',
        cacheStatus: 'DISABLED',
        responseTime: Date.now() - startTime
      };
    }

    console.log(`[StoryApiService] 🔍 Starting search request: keyword="${keyword}", count=${count}, page=${page}`);
    
    // Encode keyword for URL safety
    const encodedKeyword = encodeURIComponent(keyword.trim());
    const externalApiUrl = `${apiConfig.baseUrl}/SeachPage/${count}/${page}/${encodedKeyword}`;
    console.log(`[StoryApiService] 📡 Search API URL: ${externalApiUrl}`);
    
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
    
    // Use retry mechanism with built-in timeout handling
    const response = await apiFetch(externalApiUrl, fetchOptions, 2, 1000, apiConfig.timeout);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const rawData = await response.json();
    console.log('[StoryApiService] Search API response:', rawData);
    
    // Transform the response data
    const transformedData = Array.isArray(rawData) 
      ? rawData.map(transformItem)
      : rawData.data ? rawData.data.map(transformItem) : [];
    
    const responseTime = Date.now() - startTime;
    console.log(`[StoryApiService] ✅ Search completed successfully in ${responseTime}ms (${transformedData.length} results for "${keyword}")`);
    
    return {
      data: transformedData,
      total: rawData.totalRecode || transformedData.length,
      totalPage: rawData.totalPage || Math.ceil((rawData.totalRecode || transformedData.length) / count),
      page: page,
      limit: count,
      success: true,
      cacheStatus: 'DISABLED',
      responseTime
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const responseTime = Date.now() - startTime;
    
    console.error(`[StoryApiService] ❌ Search failed after ${responseTime}ms:`, {
      error: errorMessage,
      keyword,
      url: `${apiConfig.baseUrl}/SeachPage/${count}/${page}/${encodeURIComponent(keyword)}`,
      timeout: apiConfig.timeout
    });
    
    return {
      data: [],
      total: 0,
      totalPage: 0,
      page: page,
      limit: count,
      success: false,
      message: errorMessage,
      cacheStatus: 'DISABLED',
      responseTime
    };
  }
}

/**
 * Fetch all genres - calls external API directly with retry mechanism
 */
export async function fetchAllGenres() {
  // Update API config with current path
  apiConfig = getApiConfig();
  
  const startTime = Date.now();
  
  try {
    const externalApiUrl = `${apiConfig.baseUrl}/AllGenres`;
    console.log(`[StoryApiService] 🚀 Starting all genres request`);
    console.log(`[StoryApiService] 🌐 Request URL: ${externalApiUrl}`);
    
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
    
    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const rawData = await response.json();
    const responseTime = Date.now() - startTime;
    console.log(`[StoryApiService] ✅ All genres API completed successfully in ${responseTime}ms`);
    console.log('[StoryApiService] Raw API response:', rawData);
    console.log('[StoryApiService] Response type:', typeof rawData);
    console.log('[StoryApiService] Is array:', Array.isArray(rawData));
    console.log('[StoryApiService] Has data property:', rawData && typeof rawData === 'object' && 'data' in rawData);
    console.log('[StoryApiService] Data property type:', rawData && typeof rawData === 'object' && rawData.data ? typeof rawData.data : 'N/A');
    console.log('[StoryApiService] Data length:', rawData && typeof rawData === 'object' && rawData.data && Array.isArray(rawData.data) ? rawData.data.length : 'N/A');
    
    // Transform genres data - handle both array and object with data property
    const genres = Array.isArray(rawData) 
      ? rawData.map((item: any) => ({
          id: item.id ,
          name: item.name 
        }))
      : rawData && typeof rawData === 'object' && rawData.data && Array.isArray(rawData.data)
      ? rawData.data.map((item: any) => ({
          id: item.id ,
          name: item.name 
        }))
      : [];
    
    console.log('[StoryApiService] Transformed genres:', genres);
    
    return {
      data: genres,
      success: true,
      message: 'Genres fetched successfully',
      cacheStatus: 'DISABLED',
      responseTime
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Enhanced logging with structured error information
    console.error(`[StoryApiService] ❌ All genres failed after ${responseTime}ms:`, {
      error: errorMessage,
      requestUrl: `${apiConfig.baseUrl}/AllGenres`,
      apiConfig: {
        baseUrl: apiConfig.baseUrl,
        timeout: apiConfig.timeout
      }
    });
    
    return {
      data: [],
      success: false,
      message: errorMessage,
      cacheStatus: 'DISABLED',
      responseTime
    };
  }
}

/**
 * Update API configuration with new API path
 */
export function updateApiConfigWithActivePath(apiPath: string): void {
  setCurrentApiPath(apiPath);
  apiConfig = getApiConfig();
  console.log('API configuration updated with active API path', apiPath);
}

// Re-export types for external use
export type { ApiServiceConfig };

// Export for legacy compatibility and direct usage
export const StoryApiService = {
  fetchLatestStories,
  fetchTopFollowStories,
  fetchTopDayStories,
  fetchStoriesByMode,
  fetchSearchStories,
  clientApiCall,
  updateApiConfigWithActivePath,
  getApiConfig,
};

export default StoryApiService;