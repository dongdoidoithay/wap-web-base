'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SEOHead } from '@/components/seo-head';
import { useDomain } from '@/hooks/use-domain';
import { StoryListSkeleton } from '@/components/loading-skeleton';
import { ApiErrorBoundary } from '@/components/api-error-boundary';

// UI Components
import { 
  Header, 
  FooterNav,
  StorySection,
  StoryList,
  Pagination
} from '@/components/ui';

// Services
import { fetchStoriesByMode } from '@/services/story-api.service';

// Types
import type { StoryItem } from '@/types';

// Contexts
import { useLanguage } from '@/contexts/language-context';
import { TextConstants } from '@/lib/text-constants';

// Author Stories data structure
interface AuthorStoriesData {
  stories: StoryItem[];
  total: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  responseTime?: number;
  authorName?: string;
}

/**
 * Author Stories Page Component
 * Features:
 * 1. Domain-based configuration loading
 * 2. Progressive data loading
 * 3. URL-based pagination support
 * 4. SEO optimization
 * 5. Error handling and loading states
 * 6. Search page styling consistency
 */
export default function MangaAuthPage() {
  const { currentLang } = useLanguage();
  
  // ========================
  // 1. DOMAIN CONFIGURATION
  // ========================
  const domainConfig = useDomain();
  const isConfigLoading = !domainConfig;
  
  // ========================
  // 2. URL PARAMETERS
  // ========================
  const searchParams = useSearchParams();
  const authorId = searchParams.get('id') || '';
  const authorName = searchParams.get('name') || '';
  const pageParam = searchParams.get('page') || '1';
  const currentPage = Math.max(0, parseInt(pageParam, 10) - 1); // Convert to 0-based indexing

  // ========================
  // 3. STATE MANAGEMENT
  // ========================
  const [authorData, setAuthorData] = useState<AuthorStoriesData>({
    stories: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
    loading: false,
    error: null,
    authorName: authorName
  });
  
  // Abort controller for cancelling requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Constants
  const ITEMS_PER_PAGE = 22;

  // ========================
  // 4. DATA FETCHING
  // ========================
  
  const fetchAuthorStoriesData = useCallback(async (page: number = 0) => {
    // Cancel any existing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    if (!authorId) {
      setAuthorData(prev => ({
        ...prev,
        stories: [],
        total: 0,
        totalPages: 0,
        loading: false,
        error: 'Không tìm thấy tác giả'
      }));
      return;
    }
    
    console.log(`🔍 Fetching author stories: author ${authorId}, page ${page + 1}`);
    
    // Set loading state
    setAuthorData(prev => ({
      ...prev,
      loading: true,
      error: null,
      currentPage: page
    }));
    
    try {
      const result = await fetchStoriesByMode('auth', authorId, ITEMS_PER_PAGE, page);
      
      if (result.success) {
        setAuthorData(prev => ({
          ...prev,
          stories: result.data || [],
          total: result.total || 0,
          totalPages: result.totalPage || 0,
          loading: false,
          error: null,
          responseTime: result.responseTime,
          authorName: prev.authorName || authorName || (result.data.length > 0 ? result.data[0].authName : '')
        }));
        
        console.log(`✅ Author stories loaded: ${result.data?.length || 0} stories found`);
      } else {
        throw new Error(result.message || 'Failed to fetch author stories');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Author stories fetch error:', errorMessage);
      
      setAuthorData(prev => ({
        ...prev,
        stories: [],
        total: 0,
        totalPages: 0,
        loading: false,
        error: errorMessage
      }));
    }
  }, [authorId, authorName]);

  // ========================
  // 5. EVENT HANDLERS
  // ========================
  
  const handlePageChange = useCallback((newPage: number) => {
    // Update URL with new page
    const url = new URL(window.location.href);
    url.searchParams.set('page', (newPage + 1).toString());
    window.history.pushState({}, '', url.toString());
    
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Fetch new page data
    fetchAuthorStoriesData(newPage);
  }, [fetchAuthorStoriesData]);

  const handleRefresh = useCallback(() => {
    // Use current state value without depending on it
    setAuthorData(prev => {
      const refreshPage = prev.currentPage;
      // Call fetch with current page immediately
      setTimeout(() => fetchAuthorStoriesData(refreshPage), 0);
      return prev;
    });
  }, [fetchAuthorStoriesData]); // No dependencies to avoid cycles

  // ========================
  // 6. EFFECTS
  // ========================
  
  // Fetch data when authorId or pageParam changes
  useEffect(() => {
    if (authorId) {
      fetchAuthorStoriesData(currentPage);
    }
  }, [authorId, currentPage, fetchAuthorStoriesData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ========================
  // 7. SEO DATA
  // ========================
  
  const seoData = React.useMemo(() => {
    if (!domainConfig || !authorData.authorName) {
      return {
        title: `${TextConstants.authorStories.title[currentLang]}...`,
        description: TextConstants.common.loading_data[currentLang],
        canonical: ''
      };
    }
    
    const title = TextConstants.authorStories.author_stories_title[currentLang]
      .replace('{authorName}', authorData.authorName)
      .replace('{domainName}', domainConfig.name);
    const description = TextConstants.authorStories.author_stories_description[currentLang]
      .replace('{count}', authorData.total > 0 ? authorData.total.toString() : '')
      .replace('{authorName}', authorData.authorName)
      .replace('{domainName}', domainConfig.name);
    const canonical = `https://${domainConfig.domain}/truyen-tac-gia?id=${authorId}`;
    
    return { title, description, canonical };
  }, [domainConfig, authorData.authorName, authorData.total, authorId, currentLang]);

  // ========================
  // 8. LOADING STATE
  // ========================
  
  if (isConfigLoading || !domainConfig) {
    return (
      <div className="min-h-dvh bg-background text-body-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted">{TextConstants.common.loading[currentLang]}</div>
        </div>
      </div>
    );
  }

  // ========================
  // 9. RENDER
  // ========================
  
  return (
    <>
      {/* SEO HEAD */}
      <SEOHead 
        title={seoData.title}
        description={seoData.description}
        canonical={seoData.canonical}
        noindex={!authorId}
      />
      
      <div className="min-h-dvh bg-background text-body-primary">
        {/* HEADER */}
        <Header config={domainConfig} />
        
        <main>
          <div className="container mx-auto px-4 py-6 max-w-4xl pb-24">
              {/* PAGE HEADER */}
              <div className="mx-auto max-w-screen-sm px-3 pt-6 pb-4">
                <div className="text-center">
                  <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                    {TextConstants.authorStories.page_title[currentLang]}
                  </h1>
                  {authorData.authorName && (
                    <h2 className="text-xl md:text-2xl font-semibold text-primary mb-2">
                      {authorData.authorName}
                    </h2>
                  )}
                  <p className="text-muted">
                    {authorData.total > 0 ? (
                      <>{TextConstants.authorStories.stories_count[currentLang].replace('{count}', authorData.total.toString())}{authorData.responseTime && <span className="text-xs"> ({authorData.responseTime}ms)</span>}</>
                    ) : authorData.loading ? (
                      TextConstants.authorStories.loading[currentLang]
                    ) : (
                      TextConstants.authorStories.description[currentLang]
                    )}
                  </p>
                </div>
              </div>

              {/* BREADCRUMB */}
              <nav className="mx-auto max-w-screen-sm px-3 py-3 space-x-2 text-sm text-muted">
                <Link href="/" className="hover:text-primary transition-colors">
                  {TextConstants.common.home[currentLang]}
                </Link>
                <span>›</span>
                <span className="text-body-primary font-medium">{TextConstants.authorStories.breadcrumb[currentLang]}</span>
                {authorData.authorName && (
                  <>
                    <span>›</span>
                    <span className="text-body-primary font-medium">{authorData.authorName}</span>
                  </>
                )}
              </nav>

              {/* AUTHOR STORIES CONTENT */}
              <div className="px-3">
                <ApiErrorBoundary>
                  {/* Status Message */}
                  <div className="mb-4 text-center">
                    {authorData.loading ? (
                      <p className="text-muted">
                        {TextConstants.authorStories.loading_stories[currentLang]}
                      </p>
                    ) : authorData.error ? (
                      <p className="text-red-500">
                        {TextConstants.common.error_occurred[currentLang]}: {authorData.error}
                      </p>
                    ) : authorData.stories.length > 0 ? (
                      <p className="text-muted">
                        {TextConstants.authorStories.displaying_stories[currentLang]
                          .replace('{count}', authorData.stories.length.toString())
                          .replace('{currentPage}', (authorData.currentPage + 1).toString())
                          .replace('{totalPages}', authorData.totalPages.toString())}
                        {authorData.responseTime && (
                          <span className="text-xs"> ({authorData.responseTime}ms)</span>
                        )}
                      </p>
                    ) : (
                      <p className="text-muted">
                        {TextConstants.authorStories.no_stories[currentLang]}
                      </p>
                    )}
                  </div>

                  {/* Stories Section */}
                  <StorySection
                    title={`${TextConstants.authorStories.story_list_title[currentLang]} ${authorData.authorName || ''}`}
                    error={authorData.error}
                    actions={
                      authorData.stories.length > 0 ? (
                        <button
                          onClick={handleRefresh}
                          disabled={authorData.loading}
                          className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {TextConstants.authorStories.refresh[currentLang]}
                        </button>
                      ) : null
                    }
                  >
                    {authorData.loading && (
                      <StoryListSkeleton count={ITEMS_PER_PAGE} />
                    )}
                    
                    {!authorData.loading && authorData.stories.length > 0 && (
                      <>
                        <StoryList
                          stories={authorData.stories}
                          showImages={true}
                          loading={false}
                        />
                        
                        {authorData.totalPages > 1 && (
                          <Pagination
                            currentPage={authorData.currentPage}
                            totalPages={authorData.totalPages}
                            loading={authorData.loading}
                            onPageChange={handlePageChange}
                          />
                        )}
                      </>
                    )}

                    {!authorData.loading && authorData.stories.length === 0 && !authorData.error && (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">😔</div>
                        <h3 className="text-lg font-medium text-body-primary mb-2">
                          {TextConstants.authorStories.no_stories_title[currentLang]}
                        </h3>
                        <p className="text-muted mb-6">
                          {TextConstants.authorStories.no_stories_description[currentLang]}
                        </p>
                        <div className="space-y-2 text-sm text-muted">
                          <p>💡 <strong>{TextConstants.common.search.suggestions_title[currentLang]}:</strong></p>
                          <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
                            <li>{TextConstants.authorStories.suggestion_refresh_page[currentLang]}</li>
                            <li>{TextConstants.authorStories.suggestion_check_connection[currentLang]}</li>
                            <li>{TextConstants.authorStories.suggestion_use_search[currentLang]}</li>
                          </ul>
                        </div>
                        
                        <div className="mt-8">
                          <Link 
                            href="/" 
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                          >
                            🏠 {TextConstants.common.home[currentLang]}
                          </Link>
                        </div>
                      </div>
                    )}
                  </StorySection>
                </ApiErrorBoundary>
              </div>
          </div>
        </main>
        
        {/* FOOTER */}
        <FooterNav />
      </div>

      {/* Loading indicator for ongoing fetches */}
      {authorData.loading && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">{TextConstants.authorStories.loading_indicator[currentLang]}</span>
          </div>
        </div>
      )}
    </>
  );
}