/**
 * Quick Search API Service
 * Handles API data fetching for quick search functionality
 */

import { API_CONFIG } from '../lib/api-config';
import { StoryItem } from './story-api.service';

export interface QuickSearchResult extends StoryItem {
  // Inherits all properties from StoryItem
}

export interface QuickSearchResponse {
  data: QuickSearchResult[];
  success: boolean;
  message?: string;
  responseTime?: number;
}

/**
 * Quick Search API Function
 * Calls: /api/six-vn/QuickSearch/{keyword}/{show}
 */
export async function fetchQuickSearch(
  keyword: string,
  show: number = 8
): Promise<QuickSearchResponse> {
  const startTime = Date.now();
  
  try {
    if (!keyword.trim() || keyword.length < 2) {
      return {
        data: [],
        success: false,
        message: 'Keyword must be at least 2 characters'
      };
    }

    // Get API path from localStorage, with fallback to default
    const savedApiPath = typeof window !== 'undefined' ? localStorage.getItem('selectedApiPath') : null;
    const apiPath = savedApiPath || '/api/novel-vn'; // Default API path
    
    // Use the base URL from the centralized configuration
    const baseUrl = API_CONFIG.BASE_URL; // Use the base URL directly
    const encodedKeyword = encodeURIComponent(keyword.trim());
    const apiUrl = `${baseUrl}${apiPath}/QuickSearch/${encodedKeyword}/${show}`;
    
    console.log(`[QuickSearchService] 🔍 Searching for: "${keyword}" (limit: ${show})`);
    console.log(`[QuickSearchService] 🌐 API URL: ${apiUrl}`);
    
    // Create fetch options with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, API_CONFIG.TIMEOUT);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (compatible; StoryReader/1.0)'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const rawData = await response.json();
    const responseTime = Date.now() - startTime;
    
    // Transform data to match expected format
    const transformedData = Array.isArray(rawData) 
      ? rawData.slice(0, show)
      : rawData.data ? rawData.data.slice(0, show) : [];
    
    console.log(`[QuickSearchService] ✅ Found ${transformedData.length} results in ${responseTime}ms`);
    
    return {
      data: transformedData,
      success: true,
      responseTime
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    console.error(`[QuickSearchService] ❌ Search failed after ${responseTime}ms:`, {
      keyword,
      error: errorMessage
    });
    
    return {
      data: [],
      success: false,
      message: errorMessage,
      responseTime
    };
  }
}