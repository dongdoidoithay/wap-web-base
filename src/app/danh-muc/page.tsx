'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { SEOHead } from '@/components/seo-head';
import { useDomain } from '@/hooks/use-domain';
import { PageLoadingState, ErrorState } from '@/components/ui/loading-states';
import { Header, FooterNav, StorySection } from '@/components/ui';
import { fetchAllGenres } from '@/services/story-api.service';
import { useLanguage } from '@/contexts/language-context';
import { TextConstants } from '@/lib/text-constants';

// Genre interface
interface Genre {
  id: string;
  name: string
}

/**
 * Category Page Component
 * Features:
 * 1. Fetches all genres from /api/novel-vn/AllGenres
 * 2. Displays genres in a grid layout
 * 3. Links each genre to /truyen-danh-muc page
 * 4. Responsive design
 * 5. Loading and error states
 */
export default function CategoryPage() {
  const { currentLang } = useLanguage();
  
  // ========================
  // 1. DOMAIN CONFIGURATION
  // ========================
  const domainConfig = useDomain();
  const isConfigLoading = !domainConfig;
  
  // ========================
  // 2. STATE MANAGEMENT
  // ========================
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  
  // Abort controller for cancelling requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // ========================
  // 3. DATA FETCHING
  // ========================
  
  const fetchGenres = useCallback(async () => {
    // Cancel any existing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    console.log('🔍 Fetching all genres');
    
    // Set loading state
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchAllGenres();
      console.log('✅ Genres loaded:', result);
      if (result.success) {
        setGenres(result.data || []);
        setResponseTime(result.responseTime || null);
        console.log(`✅ Genres loaded: ${result.data?.length || 0} genres found`);
      } else {
        throw new Error(result.message || 'Failed to fetch genres');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Genres fetch error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // ========================
  // 4. EFFECTS
  // ========================
  
  // Fetch data on component mount
  useEffect(() => {
    fetchGenres();
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchGenres]);

  // ========================
  // 5. EVENT HANDLERS
  // ========================
  
  const handleRefresh = useCallback(() => {
    fetchGenres();
  }, [fetchGenres]);

  // ========================
  // 6. SEO DATA
  // ========================
  
  const seoData = React.useMemo(() => {
    if (!domainConfig) {
      return {
        title: `${TextConstants.category.title[currentLang]}...`,
        description: TextConstants.common.loading[currentLang],
        canonical: ''
      };
    }
    
    const title = `${TextConstants.category.title[currentLang]} - ${domainConfig.name}`;
    const description = TextConstants.category.description[currentLang].replace('{domainName}', domainConfig.name);
    const canonical = `https://${domainConfig.domain}/danh-muc`;
    
    return { title, description, canonical };
  }, [domainConfig, currentLang]);

  // ========================
  // 7. LOADING STATE
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
      
      <div className="min-h-dvh bg-background text-body-primary">
        {/* HEADER */}
        <Header config={domainConfig} />
        
        <main>
          <div className="container mx-auto px-4 py-6 max-w-4xl pb-24">
            {/* PAGE HEADER */}
            <div className="mx-auto max-w-screen-sm px-3 pt-6 pb-4">
              <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                  {TextConstants.category.title[currentLang]}
                </h1>
                <p className="text-muted">
                  {genres.length > 0 ? (
                    <>{TextConstants.common.view_all[currentLang]} <strong>{genres.length}</strong> {TextConstants.common.categories[currentLang]}{responseTime && <span className="text-xs"> ({responseTime}ms)</span>}
                  </>
                  ) : loading ? (
                    TextConstants.category.loading[currentLang]
                  ) : error ? (
                    `${TextConstants.common.error_occurred[currentLang]}: ${error}`
                  ) : (
                    TextConstants.category.no_categories[currentLang]
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
              <span className="text-body-primary font-medium">{TextConstants.category.breadcrumb[currentLang]}</span>
            </nav>

            {/* GENRES CONTENT */}
            <div className="px-3">
              <StorySection
                title={TextConstants.category.all_categories[currentLang]}
                error={error || undefined}
                actions={
                  <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {TextConstants.category.refresh[currentLang]}
                  </button>
                }
              >
                {loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <div 
                        key={index} 
                        className="bg-card border rounded-lg p-4 animate-pulse"
                      >
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <ErrorState 
                    title={TextConstants.category.error_loading[currentLang]}
                    message={error}
                    onRetry={handleRefresh}
                  />
                ) : genres.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {genres.map((genre) => (
                      <Link
                        key={genre.id}
                        href={`/truyen-danh-muc?id=${genre.id}&name=${encodeURIComponent(genre.name)}`}
                        className="bg-card border rounded-lg p-4 hover:bg-primary/10 hover:border-primary transition-all duration-200 group"
                      >
                        <div className="flex flex-col">
                          <h3 className="font-medium text-body-primary group-hover:text-primary truncate">
                            {genre.name}
                          </h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">😔</div>
                    <h3 className="text-lg font-medium text-body-primary mb-2">
                      {TextConstants.category.no_categories[currentLang]}
                    </h3>
                    <p className="text-muted mb-6">
                      {error ? `${TextConstants.common.error_occurred[currentLang]}: ${error}` : TextConstants.category.empty_list[currentLang]}
                    </p>
                    
                    <button
                      onClick={handleRefresh}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      {TextConstants.category.try_again[currentLang]}
                    </button>
                  </div>
                )}
              </StorySection>
            </div>
          </div>
        </main>
        
        {/* FOOTER */}
        <FooterNav />
      </div>

      {/* Loading indicator for ongoing fetches */}
      {loading && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">{TextConstants.category.loading[currentLang]}</span>
          </div>
        </div>
      )}
    </>
  );
}