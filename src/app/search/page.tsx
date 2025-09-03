'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { StoryListSkeleton } from '@/components/loading-skeleton';
import { SEOHead } from '@/components/seo-head';
import { ApiErrorBoundary } from '@/components/api-error-boundary';

// UI Components
import { 
  Header, 
  FooterNav,
  StorySection,
  StoryList,
  Pagination
} from '@/components/ui';

// Hooks and Services
import { useDomain } from '@/hooks/use-domain';
import { fetchSearchStories } from '@/services/story-api.service';

// Types
import type { StoryItem } from '@/types';

// Contexts
import { useLanguage } from '@/contexts/language-context';
import { TextConstants } from '@/lib/text-constants';

// Search result data structure
interface SearchData {
  results: StoryItem[];
  total: number;
  totalPages: number;
  currentPage: number;
  keyword: string;
  loading: boolean;
  error: string | null;
  responseTime?: number;
  hasSearched: boolean;
}

/**
 * Search Page Component
 * Features:
 * 1. Domain-based configuration loading
 * 2. URL search parameter handling
 * 3. Progressive search results loading
 * 4. SEO optimization for search pages
 * 5. Pagination support
 */
export default function SearchPage() {
  // ========================
  // 1. HOOKS
  // ========================
  const { currentLang } = useLanguage();
  
  // ========================
  // 2. DOMAIN CONFIGURATION
  // ========================
  const domainConfig = useDomain();
  const isConfigLoading = !domainConfig;
  
  // ========================
  // 2. SEARCH PARAMS
  // ========================
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const pageParam = searchParams.get('page') || '1';
  const currentPage = Math.max(0, parseInt(pageParam, 10) - 1); // Convert to 0-based indexing

  // ========================
  // 3. SEARCH STATE
  // ========================
  const [searchData, setSearchData] = useState<SearchData>({
    results: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
    keyword: '',
    loading: false,
    error: null,
    hasSearched: false
  });

  // Search input state for the form
  const [searchInput, setSearchInput] = useState(query);
  
  // Abort controller for cancelling requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Constants
  const ITEMS_PER_PAGE = 20;
  
  // ========================
  // 4. SEARCH FUNCTIONS
  // ========================
  
  const performSearch = useCallback(async (keyword: string, page: number = 0) => {
    // Cancel any existing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    if (!keyword.trim()) {
      setSearchData(prev => ({
        ...prev,
        results: [],
        total: 0,
        totalPages: 0,
        currentPage: page,
        keyword: keyword,
        loading: false,
        error: null,
        hasSearched: false
      }));
      return;
    }

    console.log(`🔍 Performing search: "${keyword}" (page ${page + 1})`);
    
    // Set loading state
    setSearchData(prev => ({
      ...prev,
      loading: true,
      error: null,
      currentPage: page,
      keyword: keyword,
      hasSearched: true
    }));
    
    try {
      const result = await fetchSearchStories(ITEMS_PER_PAGE, page, keyword);
      
      if (result.success) {
        setSearchData(prev => ({
          ...prev,
          results: result.data || [],
          total: result.total || 0,
          totalPages: result.totalPage || 0,
          loading: false,
          error: null,
          responseTime: result.responseTime
        }));
        
        console.log(`✅ Search completed: ${result.data?.length || 0} results found for "${keyword}"`);
      } else {
        throw new Error(result.message || 'Search failed');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown search error';
      console.error('❌ Search error:', errorMessage);
      
      setSearchData(prev => ({
        ...prev,
        results: [],
        total: 0,
        totalPages: 0,
        loading: false,
        error: errorMessage
      }));
    }
  }, []);

  // ========================
  // 5. EVENT HANDLERS
  // ========================
  
  const handleSearch = useCallback((keyword: string) => {
    // Update URL with search params
    const url = new URL(window.location.href);
    url.searchParams.set('q', keyword);
    url.searchParams.set('page', '1');
    window.history.pushState({}, '', url.toString());
    
    // Perform search
    performSearch(keyword, 0);
  }, [performSearch]);

  const handlePageChange = useCallback((newPage: number) => {
    // Update URL with new page
    const url = new URL(window.location.href);
    url.searchParams.set('page', (newPage + 1).toString());
    window.history.pushState({}, '', url.toString());
    
    // Perform search with new page
    performSearch(searchData.keyword, newPage);
  }, [performSearch, searchData.keyword]);

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      handleSearch(searchInput.trim());
    }
  }, [searchInput, handleSearch]);

  // ========================
  // 6. EFFECTS
  // ========================
  
  // Perform search when URL params change
  useEffect(() => {
    if (query) {
      setSearchInput(query);
      performSearch(query, currentPage);
    }
  }, [query, currentPage, performSearch]);

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
  
  const seoData = useMemo(() => {
    if (!domainConfig) {
      return {
        title: 'Tìm kiếm...',
        description: 'Đang tải...',
        canonical: ''
      };
    }
    
    const hasQuery = query.trim();
    const title = hasQuery 
      ? `${TextConstants.common.search[currentLang]} "${query}" - ${domainConfig.name}`
      : `${TextConstants.common.search[currentLang]} - ${domainConfig.name}`;
    
    const description = hasQuery
      ? `${TextConstants.common.search.view_all_results[currentLang].replace('{query}', query)} ${TextConstants.common.search.results_count[currentLang].replace('{count}', searchData.total.toString())}.`
      : `${TextConstants.common.search.description[currentLang].replace('{domainName}', domainConfig.name)}`;
    
    const canonical = `https://${domainConfig.domain}/search${hasQuery ? `?q=${encodeURIComponent(query)}` : ''}`;
    
    return { title, description, canonical };
  }, [domainConfig, query, searchData.total]);

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
        noindex={!query.trim()} // Don't index empty search pages
      />
      
      <div className="min-h-dvh bg-background text-body-primary">
        {/* HEADER */}
        <Header config={domainConfig} />
        
        <main className="pb-24">
          {/* SEARCH FORM */}
          <div className="mx-auto max-w-screen-sm px-3 pt-6 pb-4">
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="search-input" className="block text-sm font-medium text-body-primary mb-2">
                  🔍 {TextConstants.common.search[currentLang]}
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-light bg-surface px-3 py-2 shadow-sm">
                  <input
                    id="search-input"
                    type="search"
                    placeholder={TextConstants.common.search.placeholder[currentLang]}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full bg-transparent outline-none placeholder:text-muted text-sm text-body-primary"
                    autoComplete="off"
                    minLength={2}
                    disabled={searchData.loading}
                  />
                  <button
                    type="submit"
                    disabled={searchData.loading || !searchInput.trim()}
                    className="rounded-xl px-4 py-1.5 text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {searchData.loading ? TextConstants.common.loading[currentLang] : TextConstants.common.search.button[currentLang]}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* SEARCH RESULTS */}
          <div className="px-3">
            <ApiErrorBoundary>
              {/* Search Status */}
              {searchData.hasSearched && (
                <div className="mb-4 text-center">
                  {searchData.loading ? (
                    <p className="text-muted">
                      🔄 {TextConstants.common.search.loading_search[currentLang].replace('{keyword}', searchData.keyword)}
                    </p>
                  ) : searchData.error ? (
                    <p className="text-red-500">
                      ❌ {TextConstants.common.search.search_error[currentLang]}: {searchData.error}
                    </p>
                  ) : (
                    <p className="text-muted">
                      {searchData.total > 0 ? (
                        <>
                          ✅ {TextConstants.common.search.results_found[currentLang].replace('{count}', searchData.total.toString()).replace('{keyword}', searchData.keyword)}
                          {searchData.responseTime && (
                            <span className="text-xs"> ({searchData.responseTime}ms)</span>
                          )}
                        </>
                      ) : (
                        <>
                          😔 {TextConstants.common.search.no_results[currentLang].replace('{keyword}', searchData.keyword)}
                        </>
                      )}
                    </p>
                  )}
                </div>
              )}

              {/* Results Section */}
              {(searchData.hasSearched || searchData.loading) && (
                <StorySection
                  title={
                    searchData.keyword 
                      ? `📚 ${TextConstants.common.search.results_title[currentLang]}: "${searchData.keyword}"` 
                      : `📚 ${TextConstants.common.search.results_title[currentLang]}`
                  }
                  error={searchData.error}
                >
                  {searchData.loading && (
                    <StoryListSkeleton count={ITEMS_PER_PAGE} />
                  )}
                  
                  {!searchData.loading && searchData.results.length > 0 && (
                    <>
                      <StoryList
                        stories={searchData.results}
                        showImages={true}
                        loading={false}
                      />
                      
                      {searchData.totalPages > 1 && (
                        <Pagination
                          currentPage={searchData.currentPage}
                          totalPages={searchData.totalPages}
                          loading={searchData.loading}
                          onPageChange={handlePageChange}
                        />
                      )}
                    </>
                  )}

                  {!searchData.loading && searchData.results.length === 0 && searchData.hasSearched && !searchData.error && (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">😔</div>
                      <h3 className="text-lg font-medium text-body-primary mb-2">
                        {TextConstants.common.search.no_results_simple[currentLang]}
                      </h3>
                      <p className="text-muted mb-6">
                        {TextConstants.common.search.try_different_keywords[currentLang]}
                      </p>
                      <div className="space-y-2 text-sm text-muted">
                        <p>💡 <strong>{TextConstants.common.search.suggestions_title[currentLang]}:</strong></p>
                        <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
                          <li>{TextConstants.common.search.suggestion_shorter_keywords[currentLang]}</li>
                          <li>{TextConstants.common.search.suggestion_search_by_author[currentLang]}</li>
                          <li>{TextConstants.common.search.suggestion_check_spelling[currentLang]}</li>
                          <li>{TextConstants.common.search.suggestion_use_synonyms[currentLang]}</li>
                        </ul>
                      </div>
                      
                      <div className="mt-8">
                        <Link 
                          href="/" 
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                        >
                          🏠 Về trang chủ
                        </Link>
                      </div>
                    </div>
                  )}
                </StorySection>
              )}

              {/* Welcome state - when no search has been performed */}
              {!searchData.hasSearched && !query && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h2 className="text-xl font-semibold text-body-primary mb-4">
                    {TextConstants.common.search.welcome_title[currentLang]}
                  </h2>
                  <p className="text-muted mb-8 max-w-md mx-auto">
                    {TextConstants.common.search.welcome_description[currentLang]}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm">
                    <div className="p-4 bg-surface rounded-lg border">
                      <div className="text-2xl mb-2">📖</div>
                      <h3 className="font-medium mb-1">{TextConstants.common.search.method_name[currentLang]}</h3>
                      <p className="text-muted">{TextConstants.common.search.method_name_desc[currentLang]}</p>
                    </div>
                    <div className="p-4 bg-surface rounded-lg border">
                      <div className="text-2xl mb-2">✍️</div>
                      <h3 className="font-medium mb-1">{TextConstants.common.search.method_author[currentLang]}</h3>
                      <p className="text-muted">{TextConstants.common.search.method_author_desc[currentLang]}</p>
                    </div>
                    <div className="p-4 bg-surface rounded-lg border">
                      <div className="text-2xl mb-2">🏷️</div>
                      <h3 className="font-medium mb-1">{TextConstants.common.search.method_keyword[currentLang]}</h3>
                      <p className="text-muted">{TextConstants.common.search.method_keyword_desc[currentLang]}</p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Link 
                      href="/" 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                    >
                      📚 {TextConstants.common.search.explore_stories[currentLang]}
                    </Link>
                  </div>
                </div>
              )}

              {/* Loading indicator for ongoing searches */}
              {searchData.loading && (
                <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">{TextConstants.common.search.loading_indicator[currentLang]}</span>
                  </div>
                </div>
              )}
            </ApiErrorBoundary>
          </div>
        </main>
        
        {/* FOOTER */}
        <FooterNav />
      </div>
    </>
  );
}