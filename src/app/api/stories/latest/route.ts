import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG, createFetchOptions, debugLog } from '@/lib/api-config';

// Cache for API responses to reduce external API calls
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = API_CONFIG.CACHE_DURATION;
const MAX_CACHE_ENTRIES = API_CONFIG.MAX_CACHE_ENTRIES;

// Function to get cached data
function getCachedData(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key); // Remove expired cache
  return null;
}

// Function to set cached data
function setCachedData(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
  
  // Clean up old cache entries
  if (cache.size > MAX_CACHE_ENTRIES) {
    const firstKey = cache.keys().next().value;
    if (firstKey) {
      cache.delete(firstKey);
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '22', 10);
    const page = parseInt(searchParams.get('page') || '0', 10);

    debugLog(`Fetching stories - limit: ${limit}, page: ${page}`);

    // Create cache key
    const cacheKey = `stories-${limit}-${page}`;
    
    // Check cache first
    const cachedResult = getCachedData(cacheKey);
    if (cachedResult) {
      debugLog(`Returning cached data for ${cacheKey}`);
      const cachedResponse = NextResponse.json(cachedResult);
      cachedResponse.headers.set('X-API-Cache', 'HIT');
      cachedResponse.headers.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=60');
      return cachedResponse;
    }

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100', success: false },
        { status: 400 }
      );
    }

    if (page < 0) {
      return NextResponse.json(
        { error: 'Page must be 0 or greater', success: false },
        { status: 400 }
      );
    }

    // Fetch data from external API with optimized settings
    const apiUrl = `${API_CONFIG.EXTERNAL_API_BASE_URL}/api/six-vn/HomeLastUpdate/${limit}/${page}`;
    debugLog(`Calling external API: ${apiUrl}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.EXTERNAL_API_TIMEOUT);
    
    const fetchOptions = createFetchOptions(controller.signal);
    const fetchResponse = await fetch(apiUrl, fetchOptions);
    
    clearTimeout(timeoutId); // Clear timeout if request completes

    debugLog(`External API response status: ${fetchResponse.status}`);

    if (!fetchResponse.ok) {
      throw new Error(`External API error: ${fetchResponse.status} - ${fetchResponse.statusText}`);
    }

    const data = await fetchResponse.json();
    debugLog(`External API response data length:`, Array.isArray(data) ? data.length : (data.data?.length || 'unknown'));

    // Transform the response data (optimized)
    const transformedData = Array.isArray(data) 
      ? data.map(transformItem)
      : data.data ? data.data.map(transformItem) : [];

    const result = {
      data: transformedData,
      total: data.total || transformedData.length,
      page: page,
      limit: limit,
      success: true
    };

    // Cache the result
    setCachedData(cacheKey, result);

    debugLog(`Returning ${transformedData.length} items (fresh data)`);
    
    // Add response optimization headers
    const apiResponse = NextResponse.json(result);
    apiResponse.headers.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=60'); // 2 min cache
    apiResponse.headers.set('X-API-Cache', 'MISS');
    
    return apiResponse;

  } catch (error) {
    console.error('[API] Error fetching latest stories:', error);
    
    // Provide specific error messages for common issues
    let errorMessage = 'Failed to fetch stories';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        errorMessage = `API request timeout (${API_CONFIG.EXTERNAL_API_TIMEOUT}ms) - external server may be slow or unavailable`;
        statusCode = 504;
      } else if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        errorMessage = 'Cannot connect to external API server (localhost:9000) - please ensure it is running';
        statusCode = 503;
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      {
        error: errorMessage,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: [],
        total: 0,
        success: false
      },
      { status: statusCode }
    );
  }
}

// Optimized transform function (moved outside to reduce inline processing)
function transformItem(item: any, index: number): any {
  return {
    id: item.id || `item-${index}`,
    title: item.title || item.name || `Item ${index + 1}`,
    description: item.description || item.desc || '',
    image: item.image || item.thumbnail || '',
    url: item.url || item.link || '',
    slug: item.slug || '',
    author: item.author || '',
    category: item.category || '',
    status: item.status || '',
    views: item.views || 0,
    follows: item.follows || 0,
    chapters: item.chapters || 0,
    lastChapter: item.lastChapter || item.last_chapter || '',
    updatedAt: item.updatedAt || item.updated_at || new Date().toISOString(),
    createdAt: item.createdAt || item.created_at || new Date().toISOString()
  };
}