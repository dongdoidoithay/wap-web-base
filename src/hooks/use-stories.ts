/**
 * Custom hook for managing story data fetching and caching
 * Provides a clean interface for components to interact with the Story API Service
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  StoryItem, 
  ApiResponse, 
  clientApiCall,
  clearCache,
  getCacheStats,
  invalidateCache
} from '@/services/story-api.service';

export interface UseStoriesOptions {
  limit?: number;
  initialPage?: number;
  autoFetch?: boolean;
  cacheEnabled?: boolean;
}

export interface UseStoriesReturn {
  // Data state
  stories: StoryItem[];
  loading: boolean;
  error: string | null;
  
  // Pagination state
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  
  // Performance metrics
  lastResponseTime: number;
  cacheStatus: string;
  
  // Actions
  fetchPage: (page: number) => Promise<void>;
  refresh: () => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  clearAllCache: () => void;
  
  // Debug helpers
  getCacheInfo: () => any;
  testApiCall: () => Promise<void>;
}

export function useStories(options: UseStoriesOptions = {}): UseStoriesReturn {
  const {
    limit = 22,
    initialPage = 0,
    autoFetch = true,
    cacheEnabled = true
  } = options;

  // State management
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalItems, setTotalItems] = useState(0);
  const [lastResponseTime, setLastResponseTime] = useState(0);
  const [cacheStatus, setCacheStatus] = useState<string>('UNKNOWN');
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Computed values
  const totalPages = Math.ceil(totalItems / limit);
  const hasNext = currentPage < totalPages - 1;
  const hasPrev = currentPage > 0;

  // Fetch function using the service
  const fetchPage = useCallback(async (page: number) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const apiUrl = `/api/stories/latest?limit=${limit}&page=${page}`;
      const result = await clientApiCall<StoryItem>(
        apiUrl, 
        `latest-${limit}-${page}`, 
        cacheEnabled
      );

      // Update metrics
      setLastResponseTime(result.responseTime || 0);
      setCacheStatus(result.cacheStatus || 'UNKNOWN');

      if (result.success !== false) {
        setStories(result.data || []);
        setTotalItems(result.total || result.data?.length || 0);
        setCurrentPage(page);

        // Update URL for non-initial loads
        if (hasInitialLoad && typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          if (page === 0) {
            url.searchParams.delete('page');
          } else {
            url.searchParams.set('page', page.toString());
          }
          window.history.pushState({}, '', url.toString());
        }
      } else {
        throw new Error(result.message || 'API returned error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('[useStories] Error fetching data:', errorMessage);
    } finally {
      setLoading(false);
      if (!hasInitialLoad) {
        setHasInitialLoad(true);
      }
    }
  }, [limit, loading, cacheEnabled, hasInitialLoad]);

  // Navigation functions
  const nextPage = useCallback(async () => {
    if (hasNext && !loading) {
      await fetchPage(currentPage + 1);
    }
  }, [currentPage, hasNext, loading, fetchPage]);

  const prevPage = useCallback(async () => {
    if (hasPrev && !loading) {
      await fetchPage(currentPage - 1);
    }
  }, [currentPage, hasPrev, loading, fetchPage]);

  // Refresh current page
  const refresh = useCallback(async () => {
    await fetchPage(currentPage);
  }, [currentPage, fetchPage]);

  // Cache management
  const clearAllCache = useCallback(() => {
    clearCache();
    console.log('[useStories] Cache cleared');
  }, []);

  const getCacheInfo = useCallback(() => {
    return getCacheStats();
  }, []);

  // Test API call for debugging
  const testApiCall = useCallback(async () => {
    try {
      const result = await clientApiCall<StoryItem>(
        '/api/stories/latest?limit=5&page=0', 
        'test-call', 
        false
      );
      
      const message = `
Test API Call Result:
- Success: ${result.success ? 'Yes' : 'No'}
- Data Count: ${result.data?.length || 0}
- Total: ${result.total || 0}
- Cache Status: ${result.cacheStatus}
- Response Time: ${result.responseTime}ms
- Error: ${result.message || 'None'}
      `.trim();
      
      console.log('[useStories] Test API call:', result);
      alert(message);
    } catch (error) {
      const errorMessage = `Test API call failed: ${error}`;
      console.error('[useStories] Test API error:', error);
      alert(errorMessage);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && !hasInitialLoad) {
      fetchPage(initialPage);
    }
  }, [autoFetch, hasInitialLoad, initialPage, fetchPage]);

  return {
    // Data state
    stories,
    loading,
    error,
    
    // Pagination state
    currentPage,
    totalItems,
    totalPages,
    hasNext,
    hasPrev,
    
    // Performance metrics
    lastResponseTime,
    cacheStatus,
    
    // Actions
    fetchPage,
    refresh,
    nextPage,
    prevPage,
    clearAllCache,
    
    // Debug helpers
    getCacheInfo,
    testApiCall,
  };
}

// Hook for fetching static story lists (top follow, top day)
export function useStaticStories(
  endpoint: string,
  cacheKey: string,
  autoFetch: boolean = true
) {
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponseTime, setLastResponseTime] = useState(0);
  const [cacheStatus, setCacheStatus] = useState<string>('UNKNOWN');

  const fetchStories = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await clientApiCall<StoryItem>(endpoint, cacheKey, true);

      setLastResponseTime(result.responseTime || 0);
      setCacheStatus(result.cacheStatus || 'UNKNOWN');

      if (result.success !== false) {
        setStories(result.data || []);
      } else {
        throw new Error(result.message || 'API returned error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error(`[useStaticStories] Error fetching ${endpoint}:`, errorMessage);
    } finally {
      setLoading(false);
    }
  }, [endpoint, cacheKey, loading]);

  useEffect(() => {
    if (autoFetch) {
      fetchStories();
    }
  }, [autoFetch, fetchStories]);

  return {
    stories,
    loading,
    error,
    lastResponseTime,
    cacheStatus,
    refresh: fetchStories,
  };
}