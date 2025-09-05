/**
 * Story Detail Service
 * Handles fetching detailed information about individual stories
 */

import { getStoryApiConfig } from '../lib/api-config';

export interface StoryDetailResponse {
  data: any; // Changed to any to handle the raw API response
  success: boolean;
  message?: string;
  responseTime?: number;
}

// Use centralized API configuration with dynamic API path
let apiConfig = getStoryApiConfig(typeof window !== 'undefined' 
  ? localStorage.getItem('selectedApiPath') || '/api/novel-vn'
  : '/api/novel-vn');

/**
 * Client-side function to fetch story detail
 */

export async function fetchDocSitemapTotalPage(count: number,apiPath:string): Promise<number> {
  const startTime = Date.now();
 if(apiPath!==''){
     apiConfig = getStoryApiConfig(apiPath);
  }
  try {
    if (count<=0) {
      throw new Error('count');
    }
 

    // Build external API URL for story detail
    const externalApiUrl = `${apiConfig.baseUrl}/SitemapDocTotalPage/${count}`;
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
      return 0;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const rawData = await response.json();
    // Return the raw API response as is, since the page component expects this structure
   
      return parseFloat(rawData);
    

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[StoryDetailService] Error:`, errorMessage);

    return 0;
  }
}
export async function fetchDocSitemap(page: number,count: number,apiPath:string): Promise<StoryDetailResponse> {
  const startTime = Date.now();
  if(apiPath!==''){
     apiConfig = getStoryApiConfig(apiPath);
  }
  try {
    if (count<=0 ) {
      throw new Error('count');
    }
 

    // Build external API URL for story detail
    const externalApiUrl = `${apiConfig.baseUrl}/SitemapDoc/${count}/${page}`;
    console.log(`[SitemapDoc] Calling external API: ${externalApiUrl}`);

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
    // Return the raw API response as is, since the page component expects this structure
    if (rawData && typeof rawData === 'object') {
      const result = {
        data: rawData,
        success: true,
        responseTime,
      };

      console.log(`[SitemapDoc] Success: ${externalApiUrl}, Time: ${responseTime}ms`);
      return result;
    } else {
      return {
        data: null,
        success: false,
        message: 'Invalid story data received',
        responseTime,
      };
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[SitemapDoc] Error:`, errorMessage);

    return {
      data: null,
      success: false,
      message: errorMessage,
      responseTime: Date.now() - startTime,
    };
  }
}


export async function fetchDetailSitemapTotalPage(count: number,apiPath:string): Promise<number> {
  const startTime = Date.now();
 if(apiPath!==''){
     apiConfig = getStoryApiConfig(apiPath);
  }
  try {
    if (count<=0) {
      throw new Error('count');
    }
 

    // Build external API URL for story detail
    const externalApiUrl = `${apiConfig.baseUrl}/SitemapDetailTotalPage/${count}`;
    console.log(`[fetchDetailSitemapTotalPage] Calling external API: ${externalApiUrl}`);

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
      return 0;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const rawData = await response.json();
    // Return the raw API response as is, since the page component expects this structure
   
      return parseFloat(rawData);
    

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[fetchDetailSitemapTotalPage] Error:`, errorMessage);

    return 0;
  }
}
export async function fetchDetailSitemap(page: number,count: number,apiPath:string): Promise<StoryDetailResponse> {
  const startTime = Date.now();
  if(apiPath!==''){
     apiConfig = getStoryApiConfig(apiPath);
  }
  try {
    if (count<=0 ) {
      throw new Error('count');
    }
 

    // Build external API URL for story detail
    const externalApiUrl = `${apiConfig.baseUrl}/SitemapDetail/${count}/${page}`;
    console.log(`[fetchDetailSitemap] Calling external API: ${externalApiUrl}`);

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
    // Return the raw API response as is, since the page component expects this structure
    if (rawData && typeof rawData === 'object') {
      const result = {
        data: rawData,
        success: true,
        responseTime,
      };

      console.log(`[fetchDetailSitemap] Success: ${externalApiUrl}, Time: ${responseTime}ms`);
      return result;
    } else {
      return {
        data: null,
        success: false,
        message: 'Invalid story data received',
        responseTime,
      };
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[SitemapDoc] Error:`, errorMessage);

    return {
      data: null,
      success: false,
      message: errorMessage,
      responseTime: Date.now() - startTime,
    };
  }
}

