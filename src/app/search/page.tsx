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
  // 1. DOMAIN CONFIGURATION
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
      ? `Tìm kiếm "${query}" - ${domainConfig.name}`
      : `Tìm kiếm truyện - ${domainConfig.name}`;
    
    const description = hasQuery
      ? `Kết quả tìm kiếm cho "${query}" trên ${domainConfig.name}. Tìm thấy ${searchData.total} truyện.`
      : `Tìm kiếm truyện trên ${domainConfig.name}. Khám phá hàng ngàn tác phẩm hay.`;
    
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
          <div className="text-muted">Đang tải cấu hình...</div>
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
                  🔍 Tìm kiếm truyện
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-light bg-surface px-3 py-2 shadow-sm">
                  <input
                    id="search-input"
                    type="search"
                    placeholder="Nhập tên truyện, tác giả..."
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
                    {searchData.loading ? 'Đang tìm...' : 'Tìm kiếm'}
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
                      🔄 Đang tìm kiếm "{searchData.keyword}"...
                    </p>
                  ) : searchData.error ? (
                    <p className="text-red-500">
                      ❌ Lỗi tìm kiếm: {searchData.error}
                    </p>
                  ) : (
                    <p className="text-muted">
                      {searchData.total > 0 ? (
                        <>
                          ✅ Tìm thấy <strong>{searchData.total}</strong> kết quả cho "<strong>{searchData.keyword}</strong>"
                          {searchData.responseTime && (
                            <span className="text-xs"> ({searchData.responseTime}ms)</span>
                          )}
                        </>
                      ) : (
                        <>
                          😔 Không tìm thấy kết quả cho "<strong>{searchData.keyword}</strong>"
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
                      ? `📚 Kết quả tìm kiếm: "${searchData.keyword}"` 
                      : "📚 Kết quả tìm kiếm"
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
                        Không tìm thấy kết quả
                      </h3>
                      <p className="text-muted mb-6">
                        Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả
                      </p>
                      <div className="space-y-2 text-sm text-muted">
                        <p>💡 <strong>Gợi ý:</strong></p>
                        <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
                          <li>Sử dụng từ khóa ngắn gọn hơn</li>
                          <li>Thử tìm kiếm theo tên tác giả</li>
                          <li>Kiểm tra lại chính tả</li>
                          <li>Sử dụng từ đồng nghĩa</li>
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
                    Tìm kiếm truyện yêu thích
                  </h2>
                  <p className="text-muted mb-8 max-w-md mx-auto">
                    Nhập tên truyện, tác giả hoặc từ khóa để tìm kiếm trong kho tàng truyện của chúng tôi
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm">
                    <div className="p-4 bg-surface rounded-lg border">
                      <div className="text-2xl mb-2">📖</div>
                      <h3 className="font-medium mb-1">Tìm theo tên</h3>
                      <p className="text-muted">Nhập tên truyện bạn muốn đọc</p>
                    </div>
                    <div className="p-4 bg-surface rounded-lg border">
                      <div className="text-2xl mb-2">✍️</div>
                      <h3 className="font-medium mb-1">Tìm theo tác giả</h3>
                      <p className="text-muted">Khám phá tác phẩm của tác giả yêu thích</p>
                    </div>
                    <div className="p-4 bg-surface rounded-lg border">
                      <div className="text-2xl mb-2">🏷️</div>
                      <h3 className="font-medium mb-1">Tìm theo từ khóa</h3>
                      <p className="text-muted">Sử dụng từ khóa mô tả nội dung</p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Link 
                      href="/" 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                    >
                      📚 Khám phá truyện hot
                    </Link>
                  </div>
                </div>
              )}

              {/* Loading indicator for ongoing searches */}
              {searchData.loading && (
                <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Đang tìm kiếm...</span>
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