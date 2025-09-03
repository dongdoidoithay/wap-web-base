// Centralized API Configuration for all services
export const API_CONFIG = {
  // Base API settings
  BASE_URL: 'https://api.mangago.fit',
  // API_PATH will be dynamically determined
  TIMEOUT: 5000, // Reduced to 5 seconds for faster failure detection
  
  // Cache settings
  CACHE: {
    ENABLED: true,
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes (matching story service)
    MAX_ENTRIES: 50,
    STORY_CACHE_TTL: {
      LATEST: 5 * 60 * 1000, // 5 minutes
      TOP_FOLLOW: 10 * 60 * 1000, // 10 minutes
      TOP_DAY: 60 * 60 * 1000, // 1 hour
    },
  },
  
  // Request optimization
  ENABLE_KEEP_ALIVE: true,
  ENABLE_CACHE_HEADERS: true,
  ENABLE_COMPRESSION: true,
  
  // Error handling - Enhanced retry mechanism
  MAX_RETRIES: 2, // Increased retries for better reliability
  RETRY_DELAY: 1000, // Increased to 1 second for external API
  
  // Development settings
  ENABLE_DEBUG_LOGS: process.env.NODE_ENV === 'development',
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  } as Record<string, string>,
} as const;

// Function to get the API path based on the active cateChip
export function getActiveApiPath(): string {
  // This function should be used in server components or when the hook is not available
  // For client components, use the useActiveApiPath hook instead
  return '/api/novel-vn'; // Default fallback
}

// API Service Configuration Interface
export interface ApiServiceConfig {
  baseUrl: string;
  timeout: number;
  defaultHeaders: Record<string, string>;
  cache: {
    enabled: boolean;
    defaultTtl: number;
    maxEntries: number;
  };
}

// Function to get the story API configuration with dynamic API path
export function getStoryApiConfig(apiPath: string = '/api/novel-vn'): ApiServiceConfig {
  return {
    baseUrl: `${API_CONFIG.BASE_URL}${apiPath}`,
    timeout: API_CONFIG.TIMEOUT,
    defaultHeaders: API_CONFIG.DEFAULT_HEADERS,
    cache: {
      enabled: API_CONFIG.CACHE.ENABLED,
      defaultTtl: API_CONFIG.CACHE.DEFAULT_TTL,
      maxEntries: API_CONFIG.CACHE.MAX_ENTRIES,
    },
  };
}

// Get cache TTL for specific story endpoints
export function getStoryCacheTtl(endpoint: 'latest' | 'topFollow' | 'topDay'): number {
  switch (endpoint) {
    case 'latest':
      return API_CONFIG.CACHE.STORY_CACHE_TTL.LATEST;
    case 'topFollow':
      return API_CONFIG.CACHE.STORY_CACHE_TTL.TOP_FOLLOW;
    case 'topDay':
      return API_CONFIG.CACHE.STORY_CACHE_TTL.TOP_DAY;
    default:
      return API_CONFIG.CACHE.DEFAULT_TTL;
  }
}

// Helper function to create optimized fetch options
export function createFetchOptions(signal?: AbortSignal): RequestInit {
  const headers: HeadersInit = {
    ...API_CONFIG.DEFAULT_HEADERS,
  };
  
  if (API_CONFIG.ENABLE_KEEP_ALIVE) {
    headers['Connection'] = 'keep-alive';
  }
  
  if (API_CONFIG.ENABLE_CACHE_HEADERS) {
    headers['Cache-Control'] = 'no-cache';
  }
  
  if (API_CONFIG.ENABLE_COMPRESSION) {
    headers['Accept-Encoding'] = 'gzip, deflate, br';
  }
  
  return {
    method: 'GET',
    headers,
    signal,
    keepalive: API_CONFIG.ENABLE_KEEP_ALIVE,
  } as RequestInit;
}

// Helper function for logging
export function debugLog(message: string, ...args: any[]): void {
  if (API_CONFIG.ENABLE_DEBUG_LOGS) {
    console.log(`[API Debug] ${message}`, ...args);
  }
}