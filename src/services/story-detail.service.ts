/**
 * Story Detail Service
 * Handles fetching detailed information about individual stories
 */

import { STORY_API_CONFIG } from '../lib/api-config';
import type { StoryItem, StoryDetail, Chapter } from '../types';

export interface StoryDetailResponse {
  data: any; // Changed to any to handle the raw API response
  success: boolean;
  message?: string;
  responseTime?: number;
}

// Use centralized API configuration
const apiConfig = STORY_API_CONFIG;

/**
 * Client-side function to fetch story detail
 */
export async function fetchStoryDetail(idDoc: string,idDetail:string): Promise<StoryDetailResponse> {
  const startTime = Date.now();

  try {
    if (!idDoc) {
      throw new Error('Story slug is required');
    }
    if(!idDetail){
      idDetail="_";
    }

    // Build external API URL for story detail
    const externalApiUrl = `${apiConfig.baseUrl}/GetDetailByDocDetail/${encodeURIComponent(idDoc)}/${encodeURIComponent(idDetail)}`;
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
    // Return the raw API response as is, since the page component expects this structure
    if (rawData && typeof rawData === 'object') {
      const result = {
        data: rawData,
        success: true,
        responseTime,
      };

      console.log(`[StoryDetailService] Success: ${externalApiUrl}, Time: ${responseTime}ms`);
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
    console.error(`[StoryDetailService] Error:`, errorMessage);

    return {
      data: null,
      success: false,
      message: errorMessage,
      responseTime: Date.now() - startTime,
    };
  }
}

export async function fetchStoryListChapter(idDoc: string): Promise<StoryDetailResponse> {
  const startTime = Date.now();

  try {
    if (!idDoc) {
      throw new Error('Story slug is required');
    }
 

    // Build external API URL for story detail
    const externalApiUrl = `${apiConfig.baseUrl}/GetAllChapterList/${encodeURIComponent(idDoc)}`;
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
    // Return the raw API response as is, since the page component expects this structure
    if (rawData && typeof rawData === 'object') {
      const result = {
        data: rawData,
        success: true,
        responseTime,
      };

      console.log(`[StoryDetailService] Success: ${externalApiUrl}, Time: ${responseTime}ms`);
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
    console.error(`[StoryDetailService] Error:`, errorMessage);

    return {
      data: null,
      success: false,
      message: errorMessage,
      responseTime: Date.now() - startTime,
    };
  }
}
