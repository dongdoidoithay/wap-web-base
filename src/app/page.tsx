'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { StoryListSkeleton } from '@/components/loading-skeleton';
import { SEOHead } from '@/components/seo-head';
import { ApiErrorBoundary } from '@/components/api-error-boundary';
import { useLanguage } from '@/contexts/language-context';
import { TextConstants } from '@/lib/text-constants';

// UI Components
import { 
  Header, 
  SearchBar, 
  CategoryChips, 
  FooterNav,
  StorySection,
  StoryList,
  StoryGrid,
  StoryRanking,
  SectionControls,
  Pagination
} from '@/components/ui';

// Hooks and Services
import { useDomain } from '@/hooks/use-domain';
import { useReadingHistory } from '@/lib/reading-history';
import { 
  fetchLatestStories, 
  fetchTopFollowStories, 
  fetchTopDayStories 
} from '@/services/story-api.service';
import { 
  parsePageFromSearchParams, 
  generateStructuredData 
} from '@/services/home-data-optimized.service';

// Types
import type { HomePageProps } from '@/types';
import type { StoryItem } from '@/types';
import Link from 'next/link';

// Progressive Data Types (inline)
interface ProgressiveHomeData {
  latestStories: {
    data: StoryItem[];
    total: number;
    loading: boolean;
    error: string | null;
    responseTime?: number;
  };
  topFollowStories: {
    data: StoryItem[];
    loading: boolean;
    error: string | null;
    responseTime?: number;
  };
  topDayStories: {
    data: StoryItem[];
    loading: boolean;
    error: string | null;
    responseTime?: number;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

/**
 * Home Page Component with Progressive Data Loading
 * Features:
 * 1. Domain-based configuration loading
 * 2. Progressive data loading - renders each section as API completes
 * 3. Independent section loading and error handling
 * 4. SEO optimization with structured data
 */
export default function HomePage({ searchParams }: HomePageProps) {
  const { currentLang } = useLanguage();
  
  // ========================
  // 1. DOMAIN CONFIGURATION
  // ========================
  const domainConfig = useDomain();
  const isConfigLoading = !domainConfig;
  
  // ========================
  // 1.1. READING HISTORY
  // ========================
  const { history: readingHistory } = useReadingHistory();
  const [recentReadStories, setRecentReadStories] = useState<any[]>([]);

  // ========================
  // 2. SEARCH PARAMS RESOLUTION
  // ========================
  const [resolvedParams, setResolvedParams] = useState<{ page?: string } | null>(null);
  const [showImages, setShowImages] = useState(false);

  // Constants
  const ITEMS_PER_PAGE = 22;

  // Parse page from search params
  const currentPageFromParams = useMemo(() => {
    if (!resolvedParams) return 0;
    return parsePageFromSearchParams(resolvedParams);
  }, [resolvedParams]);

  // ========================
  // 3. PROGRESSIVE DATA LOADING - Direct Implementation
  // ========================
  
  // Progressive data state
  const [progressiveData, setProgressiveData] = useState<ProgressiveHomeData>({
    latestStories: {
      data: [],
      total: 0,
      loading: false,
      error: null
    },
    topFollowStories: {
      data: [],
      loading: false,
      error: null
    },
    topDayStories: {
      data: [],
      loading: false,
      error: null
    },
    pagination: {
      currentPage: 0,
      totalPages: 0,
      totalItems: 0
    }
  });
  
  // Progressive data fetcher reference (replaced with AbortController)
  const abortControllerRef = useRef<AbortController | null>(null);

  // Constants
  const LATEST_LIMIT = ITEMS_PER_PAGE;
  const TOP_FOLLOW_LIMIT = 10;
  const TOP_DAY_LIMIT = 15;
  
  // ========================
  // DIRECT FETCH IMPLEMENTATION - Single fetch for all APIs
  // ========================
  
  // Fetch all data once - optimized for performance
  const fetchAllData = useCallback(async (page = 0) => {
    // Cancel any existing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    

    // Set all loading states to true
    setProgressiveData(prev => ({
      ...prev,
      latestStories: { ...prev.latestStories, loading: true, error: null },
      topFollowStories: { ...prev.topFollowStories, loading: true, error: null },
      topDayStories: { ...prev.topDayStories, loading: true, error: null },
      pagination: { ...prev.pagination, currentPage: page }
    }));
    
    // Fetch all APIs in parallel - single Promise.allSettled call
    try {
      const [latestResult, topFollowResult, topDayResult] = await Promise.allSettled([
        fetchLatestStories(LATEST_LIMIT, page),
        fetchTopFollowStories(TOP_FOLLOW_LIMIT, 0),
        fetchTopDayStories(TOP_DAY_LIMIT)
      ]);
      
      // Process results and update state in one batch
      setProgressiveData(prev => {
        const newState = { ...prev };
        
        // Update latest stories
        if (latestResult.status === 'fulfilled') {
          newState.latestStories = {
            data: latestResult.value.data || [],
            total: latestResult.value.total || 0,
            loading: false,
            error: null,
            responseTime: latestResult.value.responseTime
          };
          newState.pagination = {
            currentPage: page,
            totalPages: latestResult.value.totalPage || 0,
            totalItems: latestResult.value.total || 0
          };
        } else {
          newState.latestStories = {
            ...prev.latestStories,
            loading: false,
            error: `${TextConstants.common.error_occurred[currentLang]} tải truyện mới: ${latestResult.reason?.message || 'Unknown error'}`
          };
        }
        
        // Update top follow stories
        if (topFollowResult.status === 'fulfilled') {
          newState.topFollowStories = {
            data: topFollowResult.value.data || [],
            loading: false,
            error: null,
            responseTime: topFollowResult.value.responseTime
          };
        } else {
          newState.topFollowStories = {
            ...prev.topFollowStories,
            loading: false,
            error: `${TextConstants.common.error_occurred[currentLang]} tải top follow: ${topFollowResult.reason?.message || 'Unknown error'}`
          };
        }
        
        // Update top day stories
        if (topDayResult.status === 'fulfilled') {
          newState.topDayStories = {
            data: topDayResult.value.data || [],
            loading: false,
            error: null,
            responseTime: topDayResult.value.responseTime
          };
        } else {
          newState.topDayStories = {
            ...prev.topDayStories,
            loading: false,
            error: `${TextConstants.common.error_occurred[currentLang]} tải top ngày: ${topDayResult.reason?.message || 'Unknown error'}`
          };
        }
        
        return newState;
      });
      
   
    } catch (error) {
      console.error('❌ Error in fetchAllData:', error);
      // Set all to error state
      setProgressiveData(prev => ({
        ...prev,
        latestStories: { ...prev.latestStories, loading: false, error: `${TextConstants.common.error_occurred[currentLang]} kết nối mạng` },
        topFollowStories: { ...prev.topFollowStories, loading: false, error: `${TextConstants.common.error_occurred[currentLang]} kết nối mạng` },
        topDayStories: { ...prev.topDayStories, loading: false, error: `${TextConstants.common.error_occurred[currentLang]} kết nối mạng` }
      }));
    }
  }, [currentLang]); // Add currentLang as dependency
  
  // Page change handler - direct implementation
  const handlePageChange = useCallback((newPage: number) => {
    fetchAllData(newPage);
  }, [fetchAllData]);
  

  // Cancel fetch function
  const cancelFetch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);
  
  // Computed loading states for UI - memoized to prevent re-renders
  const isAnyLoading = useMemo(() => 
    progressiveData.latestStories.loading || 
    progressiveData.topFollowStories.loading || 
    progressiveData.topDayStories.loading,
    [progressiveData.latestStories.loading, progressiveData.topFollowStories.loading, progressiveData.topDayStories.loading]
  );
                       
  const allCompleted = useMemo(() => 
    !progressiveData.latestStories.loading && 
    !progressiveData.topFollowStories.loading && 
    !progressiveData.topDayStories.loading &&
    (progressiveData.latestStories.data.length > 0 ||
     progressiveData.topFollowStories.data.length > 0 ||
     progressiveData.topDayStories.data.length > 0),
    [
      progressiveData.latestStories.loading,
      progressiveData.topFollowStories.loading, 
      progressiveData.topDayStories.loading,
      progressiveData.latestStories.data.length,
      progressiveData.topFollowStories.data.length,
      progressiveData.topDayStories.data.length
    ]
  );
                        
  const hasAnyError = useMemo(() => 
    !!progressiveData.latestStories.error || 
    !!progressiveData.topFollowStories.error || 
    !!progressiveData.topDayStories.error,
    [
      progressiveData.latestStories.error,
      progressiveData.topFollowStories.error,
      progressiveData.topDayStories.error
    ]
  );
       
  // ========================
  // 4. EVENT HANDLERS
  // ========================

  // ========================
  // 5. SEO OPTIMIZATION
  // ========================
  
  const seoData = useMemo(() => {
    if (!domainConfig) {
      return {
        siteLd: {},
        breadcrumbLd: {},
        title: TextConstants.common.loading[currentLang] + '...',
        description: TextConstants.common.loading_data[currentLang] + '...',
        canonical: ''
      };
    }
    
    const { siteLd, breadcrumbLd } = generateStructuredData(domainConfig);
    
    return {
      siteLd,
      breadcrumbLd,
      title: domainConfig.seo?.title || domainConfig.name || TextConstants.common.home[currentLang],
      description: domainConfig.seo?.description || domainConfig.description || '',
      canonical: `https://${domainConfig.domain}`
    };
  }, [domainConfig, currentLang]);

  // ========================
  // 6. EFFECTS
  // ========================
  
  // Resolve search params
  useEffect(() => {
    let isMounted = true;
    const resolveParams = async () => {
      try {
        const params = await searchParams;
        if (isMounted) {
          setResolvedParams(params || {});
        }
      } catch (error) {
        console.error('Error resolving search params:', error);
        if (isMounted) {
          setResolvedParams({});
        }
      }
    };
    resolveParams();
    return () => { isMounted = false; };
  }, [searchParams]);

  // Start data loading when config and params are ready
  useEffect(() => {
      fetchAllData(currentPageFromParams);
  }, []);

  // Load recent reading history
  useEffect(() => {
    // Use the first 3 items from readingHistory
    const recent = readingHistory.slice(0, 3);
    setRecentReadStories(recent);
  }, [readingHistory]); // Depend on readingHistory array instead of function

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelFetch();
    };
  }, [cancelFetch]);

  // ========================
  // 7. LOADING STATE
  // ========================
  
  if (isConfigLoading || !domainConfig || resolvedParams === null) {
    return (
      <div className="min-h-dvh bg-background text-body-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted">{TextConstants.common.loading[currentLang]}</div>
        </div>
      </div>
    );
  }

  // ========================
  // 8. RENDER
  // ========================
  return (
    <>
      {/* SEO HEAD */}
      <SEOHead 
        title={seoData.title}
        description={seoData.description}
        canonical={seoData.canonical}
      />
      
      {/* STRUCTURED DATA FOR SEO */}
      {Object.keys(seoData.siteLd).length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(seoData.siteLd) }}
        />
      )}
      {Object.keys(seoData.breadcrumbLd).length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(seoData.breadcrumbLd) }}
        />
      )}
      
      <div className="min-h-dvh bg-background text-body-primary">
        {/* HEADER  */}
        <Header config={domainConfig} />
        
        <main className="pb-24">
          {/* SEARCH BAR */}
          <SearchBar/>
          {/* CATEGORIES - now using cateChip */}
          <CategoryChips cateChips={domainConfig.cateChip || []} />
          
          {/* MAIN HEADING */}
          <div className="mx-auto max-w-screen-sm px-3 pt-6 pb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-primary text-center">
              {domainConfig.seo.title || TextConstants.common.home[currentLang]}
            </h1>
          </div>
          
          {/* RECENT READING HISTORY - Shows only if user has reading history */}
          {recentReadStories.length > 0 && (
            <StorySection
              title={TextConstants.home.recently_read[currentLang]}
              actions={
                <Link 
                  href="/reading-history" 
                  className="text-sm text-muted hover:text-primary transition-colors"
                >
                  {TextConstants.common.view_all[currentLang]} →
                </Link>
              }
            >
              <div className="space-y-3">
                {recentReadStories.map((story, index) => (
                  <Link
                    key={story.idDoc}
                    href={story.chapterUrl}
                    className="flex items-center gap-3 p-3 bg-background rounded-lg border hover:border-primary/50 transition-all group"
                  >
                   
                    {story.storyImage && (
                      <img 
                        src={story.storyImage} 
                        alt={story.storyName}
                        className="w-12 h-16 object-cover rounded flex-shrink-0"
                        loading="lazy"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-body-primary group-hover:text-primary transition-colors truncate">
                        {story.storyName}
                      </h3>
                      <p className="text-xs text-muted mb-1 truncate">
                        {story.chapterName}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted">
                        <span>{TextConstants.common.chapter[currentLang]} {story.currentChapterIndex + 1}/{story.totalChapters}</span>
                        <span>{new Date(story.lastReadAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </StorySection>
          )}
          
          {/* MAIN CONTENT - PROGRESSIVE RENDERING */}
          <ApiErrorBoundary>
            <div className="space-y-6">
              
              {/* LATEST STORIES SECTION - Renders immediately when loaded */}
              <StorySection
                  title={TextConstants.home.latest_stories[currentLang]}
                  error={progressiveData.latestStories.error}
                  actions={
                   <Link 
                      href="/truyen-moi-cap-nhat?page=1" 
                      className="text-sm text-muted hover:text-primary transition-colors"
                    >
                      {TextConstants.common.view_all[currentLang]} →
                    </Link>
                  }
              >
                {progressiveData.latestStories.loading && (
                  <StoryListSkeleton count={ITEMS_PER_PAGE} />
                )}
                
                {!progressiveData.latestStories.loading && progressiveData.latestStories.data.length > 0 && (
                  <>
                    <StoryList
                      stories={progressiveData.latestStories.data}
                      showImages={showImages}
                      loading={false}
                    />
                    
                    <Pagination
                      currentPage={progressiveData.pagination.currentPage}
                      totalPages={progressiveData.pagination.totalPages}
                      loading={progressiveData.latestStories.loading}
                      onPageChange={handlePageChange}
                    />
                  </>
                )}

                {!progressiveData.latestStories.loading && progressiveData.latestStories.data.length === 0 && !progressiveData.latestStories.error && (
                  <div className="text-center py-8 text-muted">
                    <p>{TextConstants.home.no_stories_found[currentLang]}</p>
                  </div>
                )}
              </StorySection>

              {/* TOP FOLLOW STORIES - Renders when loaded, independent of other sections */}
              {(progressiveData.topFollowStories.data.length > 0 || progressiveData.topFollowStories.loading) && (
                <StorySection 
                  title={TextConstants.home.top_followed[currentLang]}
                  error={progressiveData.topFollowStories.error}
                  
                >
                  {progressiveData.topFollowStories.loading ? (
                    <div className="grid grid-cols-2 gap-4">
                      {Array.from({ length: 10 }, (_, i) => (
                        <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <StoryGrid
                      stories={progressiveData.topFollowStories.data}
                      maxItems={10}
                      columns={2}
                    />
                  )}
                </StorySection>
              )}

              {/* TOP DAY STORIES - Renders when loaded, independent of other sections */}
              {(progressiveData.topDayStories.data.length > 0 || progressiveData.topDayStories.loading) && (
                <StorySection 
                  title={TextConstants.home.top_day[currentLang]}
                  error={progressiveData.topDayStories.error}
                >
                  {progressiveData.topDayStories.loading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 15 }, (_, i) => (
                        <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <StoryRanking
                      stories={progressiveData.topDayStories.data}
                      maxItems={15}
                    />
                  )}
                </StorySection>
              )}

              {/* LOADING INDICATOR - Shows overall progress */}
              {isAnyLoading && (
                <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">{TextConstants.home.loading_data[currentLang]}</span>
                  </div>
                </div>
              )}

              {/* SUCCESS INDICATOR - Shows when all loading is complete */}
              {allCompleted && !hasAnyError && (
                <div className="fixed bottom-4 right-4 bg-success text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{TextConstants.home.load_complete[currentLang]}</span>
                  </div>
                </div>
              )}
            </div>
          </ApiErrorBoundary>
        </main>
        
        {/* FOOTER */}
        <FooterNav />
      </div>

      {/* STYLES FOR ANIMATIONS */}
      <style jsx>{`
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translateY(10px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 3s ease-in-out forwards;
        }
      `}</style>
    </>
  );
}