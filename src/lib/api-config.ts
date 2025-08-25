// API Configuration for performance optimization
export const API_CONFIG = {
  // External API settings
  EXTERNAL_API_BASE_URL: 'http://localhost:9000',
  EXTERNAL_API_TIMEOUT: 3000, // 3 seconds
  
  // Cache settings
  CACHE_DURATION: 2 * 60 * 1000, // 2 minutes
  MAX_CACHE_ENTRIES: 50, // Maximum number of cached responses
  
  // Request optimization
  ENABLE_KEEP_ALIVE: true,
  ENABLE_CACHE_HEADERS: true,
  
  // Error handling
  MAX_RETRIES: 1,
  RETRY_DELAY: 500, // 500ms
  
  // Response optimization
  ENABLE_COMPRESSION: true,
  
  // Development settings
  ENABLE_DEBUG_LOGS: process.env.NODE_ENV === 'development',
} as const;

// Helper function to create optimized fetch options
export function createFetchOptions(signal?: AbortSignal) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
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
export function debugLog(message: string, ...args: any[]) {
  if (API_CONFIG.ENABLE_DEBUG_LOGS) {
    console.log(`[API Debug] ${message}`, ...args);
  }
}