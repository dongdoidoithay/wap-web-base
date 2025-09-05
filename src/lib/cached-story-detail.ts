import { cache } from 'react';
import { fetchStoryDetail } from '../services/story-detail.service';

// Create a cached version of fetchStoryDetail to share data between generateMetadata and page
export const getCachedStoryDetail = cache(async (idDoc: string, idDetail: string,apipath:string) => {
  try {
    const result = await fetchStoryDetail(idDoc, idDetail,apipath);
    return result;
  } catch (error) {
    console.error('Error fetching story detail in cached function:', error);
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});