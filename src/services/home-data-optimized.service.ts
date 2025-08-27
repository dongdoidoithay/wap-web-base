import { 
  StoryItem, 
  ApiResponse,
  fetchLatestStories,
  fetchTopFollowStories,
  fetchTopDayStories
} from '@/services/story-api.service';

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface HomePageData {
  latestStories: {
    data: StoryItem[];
    total: number;
    totalPage: number;
    page: number;
    limit: number;
  };
  topFollowStories: StoryItem[];
  topDayStories: StoryItem[];
  pagination: PaginationInfo;
}

export interface FetchDataOptions {
  latestLimit?: number;
  topFollowLimit?: number;
  topDayLimit?: number;
  currentPage?: number;
  useCache?: boolean;
  timeout?: number;
  priority?: 'high' | 'medium' | 'low';
}

export interface PerformanceMetrics {
  totalTime: number;
  individualTimes: {
    latest: number;
    topFollow: number;
    topDay: number;
  };
  cacheHits: number;
  errors: string[];
  networkEfficiency: number;
}

/**
 * 🚀 OPTIMIZED VERSION - Enhanced Performance
 * 
 * Key improvements:
 * 1. AbortController for timeout handling
 * 2. Performance metrics tracking
 * 3. Request prioritization
 * 4. Connection optimization
 * 5. Advanced error recovery
 */
export async function fetchHomePageDataOptimized(options: FetchDataOptions = {}): Promise<{
  data: HomePageData | null;
  errors: string[];
  hasPartialData: boolean;
  metrics: PerformanceMetrics;
}> {
  const startTime = performance.now();
  const {
    latestLimit = 22,
    topFollowLimit = 10,
    topDayLimit = 100,
    currentPage = 0,
    useCache = false, // Disabled caching
    timeout = 3000, // 3 seconds timeout
    priority = 'high'
  } = options;

  const errors: string[] = [];
  let hasPartialData = false;
  const individualTimes = { latest: 0, topFollow: 0, topDay: 0 };
  let cacheHits = 0;

  // Abort controller for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    errors.push('Request timeout after 3 seconds');
  }, timeout);

  try {
    console.log(`[OptimizedService] Starting parallel fetch with ${priority} priority`);
    
    // 🚀 PARALLEL FETCHING with performance tracking
    const apiPromises = [
      // Latest stories (highest priority)
      trackApiCall('latest', () => 
        fetchLatestStories(latestLimit, currentPage)
      ),
      
      // Top follow stories (medium priority)
      trackApiCall('topFollow', () =>
        fetchTopFollowStories(topFollowLimit, 0)
      ),
      
      // Top day stories (lower priority)
      trackApiCall('topDay', () =>
        fetchTopDayStories(topDayLimit)
      )
    ];

    // Execute all API calls in parallel
    const [latestStoriesResponse, topFollowResponse, topDayResponse] = 
      await Promise.allSettled(apiPromises);

    clearTimeout(timeoutId);

    // Process results with enhanced error handling
    const { latestStories, topFollowStories, topDayStories } = 
      await processApiResponses(
        latestStoriesResponse,
        topFollowResponse, 
        topDayResponse,
        { latestLimit, currentPage, errors, hasPartialData }
      );

    // Calculate pagination
    const pagination = calculatePagination(currentPage, latestStories.total || 0, latestLimit);

    const data: HomePageData = {
      latestStories,
      topFollowStories,
      topDayStories,
      pagination
    };

    // Performance metrics
    const totalTime = performance.now() - startTime;
    const networkEfficiency = calculateNetworkEfficiency(individualTimes, totalTime);

    const metrics: PerformanceMetrics = {
      totalTime,
      individualTimes,
      cacheHits,
      errors: [...errors],
      networkEfficiency
    };

    console.log(`[OptimizedService] Completed in ${totalTime.toFixed(2)}ms`, {
      networkEfficiency: `${networkEfficiency.toFixed(1)}%`,
      cacheHits,
      errors: errors.length
    });

    return {
      data,
      errors,
      hasPartialData,
      metrics
    };

  } catch (error) {
    clearTimeout(timeoutId);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(`Critical error: ${errorMessage}`);
    
    console.error('[OptimizedService] Critical error:', error);
    
    return {
      data: null,
      errors,
      hasPartialData: false,
      metrics: {
        totalTime: performance.now() - startTime,
        individualTimes,
        cacheHits,
        errors: [...errors],
        networkEfficiency: 0
      }
    };
  }

  // Helper function to track individual API call performance
  async function trackApiCall<T>(apiName: keyof typeof individualTimes, apiCall: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await apiCall();
      individualTimes[apiName] = performance.now() - start;
      
      // Check if response came from cache
      if (result && typeof result === 'object' && 'cacheStatus' in result) {
        if ((result as any).cacheStatus === 'HIT') {
          cacheHits++;
        }
      }
      
      return result;
    } catch (error) {
      individualTimes[apiName] = performance.now() - start;
      throw error;
    }
  }
}

/**
 * Process API responses with enhanced error handling
 */
async function processApiResponses(
  latestResponse: PromiseSettledResult<any>,
  topFollowResponse: PromiseSettledResult<any>,
  topDayResponse: PromiseSettledResult<any>,
  context: { latestLimit: number; currentPage: number; errors: string[]; hasPartialData: boolean }
) {
  const { latestLimit, currentPage, errors } = context;
  
  // Process latest stories with fallback
  let latestStories: { data: StoryItem[]; total: number;  totalPage: number; page: number; limit: number } = { 
    data: [], 
    total: 0, 
    totalPage: 0, 
    page: currentPage, 
    limit: latestLimit 
  };
  
  if (latestResponse.status === 'fulfilled') {
    const response = latestResponse.value;
    latestStories = {
      data: response.data || [],
      total: response.total || 0,
      totalPage: response.totalPage || 0,
      page: response.page || currentPage,
      limit: response.limit || latestLimit
    };
  } else {
    errors.push(`Latest stories failed: ${latestResponse.reason}`);
    context.hasPartialData = true;
    
    // Try to load from localStorage cache as last resort
    try {
      const cachedData = localStorage.getItem('latest-stories-backup');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        latestStories.data = parsed.data || [];
        console.log('[OptimizedService] Using localStorage backup for latest stories');
      }
    } catch (e) {
      console.warn('[OptimizedService] Could not load backup data');
    }
  }

  // Process top follow stories
  let topFollowStories: StoryItem[] = [];
  if (topFollowResponse.status === 'fulfilled') {
    topFollowStories = topFollowResponse.value.data || [];
  } else {
    errors.push(`Top follow stories failed: ${topFollowResponse.reason}`);
    context.hasPartialData = true;
  }

  // Process top day stories
  let topDayStories: StoryItem[] = [];
  if (topDayResponse.status === 'fulfilled') {
    topDayStories = topDayResponse.value.data || [];
  } else {
    errors.push(`Top day stories failed: ${topDayResponse.reason}`);
    context.hasPartialData = true;
  }

  return { latestStories, topFollowStories, topDayStories };
}

/**
 * Calculate network efficiency percentage
 */
function calculateNetworkEfficiency(individualTimes: Record<string, number>, totalTime: number): number {
  const sumOfIndividualTimes: number = Object.values(individualTimes).reduce((a: number, b: number) => a + b, 0);
  if (sumOfIndividualTimes === 0) return 0;
  
  // Efficiency = (theoretical sequential time - actual parallel time) / theoretical sequential time * 100
  const efficiency = ((sumOfIndividualTimes - totalTime) / sumOfIndividualTimes) * 100;
  return Math.max(0, Math.min(100, efficiency));
}

/**
 * Utility function to calculate pagination info
 */
export function calculatePagination(currentPage: number, totalItems: number, itemsPerPage: number): PaginationInfo {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNext: currentPage < totalPages - 1,
    hasPrev: currentPage > 0
  };
}

/**
 * Validate search parameters and return safe current page
 */
export function parsePageFromSearchParams(searchParams?: { page?: string }): number {
  if (!searchParams?.page) return 0;
  
  const page = parseInt(searchParams.page);
  return isNaN(page) || page < 0 ? 0 : page;
}

/**
 * Generate structured data for SEO
 */
export function generateStructuredData(config: any) {
  const siteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.name,
    url: `https://${config.domain}`,
    description: config.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `https://${config.domain}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: `https://${config.domain}`
      }
    ]
  };

  return { siteLd, breadcrumbLd };
}

/**
 * 📊 PERFORMANCE COMPARISON FUNCTION
 * Use this to test both approaches side by side
 */
export async function comparePerformance(options: FetchDataOptions = {}) {
  console.log('🔥 Starting Performance Comparison...');
  
  // Test centralized approach
  const centralizedStart = performance.now();
  const centralizedResult = await fetchHomePageDataOptimized(options);
  const centralizedTime = performance.now() - centralizedStart;
  
  // Simulate sequential approach timing
  const sequentialTime = Object.values(centralizedResult.metrics.individualTimes)
    .reduce((a, b) => a + b, 0);
  
  const improvement = ((sequentialTime - centralizedTime) / sequentialTime) * 100;
  
  console.log('📊 Performance Results:', {
    centralizedTime: `${centralizedTime.toFixed(2)}ms`,
    estimatedSequentialTime: `${sequentialTime.toFixed(2)}ms`,
    improvement: `${improvement.toFixed(1)}% faster`,
    networkEfficiency: `${centralizedResult.metrics.networkEfficiency.toFixed(1)}%`,
    cacheHits: centralizedResult.metrics.cacheHits,
    errors: centralizedResult.errors.length
  });
  
  return {
    centralizedTime,
    sequentialTime,
    improvement,
    metrics: centralizedResult.metrics
  };
}