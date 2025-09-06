'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/language-context';
import { TextConstants } from '@/lib/text-constants';

// Import the quick search service
import { fetchQuickSearch, type QuickSearchResult } from '@/services/quick-search.service';

// Types
interface QuickSearchResponse {
  data: QuickSearchResult[];
  success: boolean;
  message?: string;
  responseTime?: number;
}

// Quick Search Configuration
const QUICK_SEARCH_CONFIG = {
  DEBOUNCE_DELAY: 300,
  MAX_RESULTS: 8,
  MIN_QUERY_LENGTH: 2
};

export function SearchBar() {
  const router = useRouter();
  const { currentLang } = useLanguage();
  const [query, setQuery] = useState('');
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [quickSearchResults, setQuickSearchResults] = useState<QuickSearchResult[]>([]);
  const [isQuickSearchLoading, setIsQuickSearchLoading] = useState(false);
  const [quickSearchError, setQuickSearchError] = useState<string | null>(null);
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debounced quick search function
  const performQuickSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < QUICK_SEARCH_CONFIG.MIN_QUERY_LENGTH) {
      setQuickSearchResults([]);
      setIsQuickSearchOpen(false);
      return;
    }
    
    setIsQuickSearchLoading(true);
    setQuickSearchError(null);
    
    try {
      const result = await fetchQuickSearch(searchQuery, QUICK_SEARCH_CONFIG.MAX_RESULTS);
      
      if (result.success) {
        setQuickSearchResults(result.data);
        setIsQuickSearchOpen(result.data.length > 0);
      } else {
        setQuickSearchError(result.message || 'Search failed');
        setQuickSearchResults([]);
        setIsQuickSearchOpen(false);
      }
    } catch (error) {
      setQuickSearchError('Network error occurred');
      setQuickSearchResults([]);
      setIsQuickSearchOpen(false);
    } finally {
      setIsQuickSearchLoading(false);
    }
  }, []);
  
  // Handle input change with debouncing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    if (value.trim().length >= QUICK_SEARCH_CONFIG.MIN_QUERY_LENGTH) {
      debounceTimeoutRef.current = setTimeout(() => {
        performQuickSearch(value);
      }, QUICK_SEARCH_CONFIG.DEBOUNCE_DELAY);
    } else {
      setIsQuickSearchOpen(false);
      setQuickSearchResults([]);
    }
  }, [performQuickSearch]);
  
  // Handle form submission (full search)
  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsQuickSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }, [query, router]);
  
  // Handle quick search result click
  const handleResultClick = useCallback((result: QuickSearchResult) => {
    setIsQuickSearchOpen(false);
    setQuery(result.name);
     const type= localStorage.getItem('selectedChipId');
    // Navigate to story detail page
    if (result.idDoc) {
      router.push(`/${result.idDoc}?type=${type}`);
    }
  }, [router]);
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsQuickSearchOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsQuickSearchOpen(false);
      searchInputRef.current?.blur();
    }
  }, []);

  return (
    <div className="mx-auto max-w-screen-sm px-3 pt-3" ref={searchContainerRef}>
      <form
        onSubmit={handleFormSubmit}
        className="relative"
        role="search"
        aria-label={TextConstants.common.search[currentLang]}
      >
        <label htmlFor="q" className="sr-only">
          {TextConstants.common.search[currentLang]}
        </label>
        <div className="flex items-center gap-2 rounded-2xl border border-light bg-surface px-3 py-2 shadow-sm">
          <input
            ref={searchInputRef}
            id="q"
            name="q"
            type="search"
            placeholder={TextConstants.common.search[currentLang] === 'Search' ? 
              TextConstants.common.search.placeholder.en : 
              TextConstants.common.search.placeholder.vi}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent outline-none placeholder:text-muted text-sm text-body-primary"
            autoComplete="off"
            minLength={2}
          />
          
          {/* Loading indicator */}
          {isQuickSearchLoading && (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin" />
            </div>
          )}
          
          <button
            type="submit"
            className="rounded-xl px-3 py-1.5 text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-colors"
          >
            {TextConstants.common.search[currentLang] === 'Search' ? 
              TextConstants.common.search.button.en : 
              TextConstants.common.search.button.vi}
          </button>
        </div>
        
        {/* Quick Search Dropdown */}
        {isQuickSearchOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-light rounded-2xl shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="p-2">
              {quickSearchResults.length > 0 ? (
                <>
                  <div className="px-3 py-2 text-xs text-muted border-b border-light">
                    {TextConstants.common.search[currentLang] === 'Search' ? 
                      TextConstants.common.search.quick_results.en.replace('{count}', quickSearchResults.length.toString()) : 
                      TextConstants.common.search.quick_results.vi.replace('{count}', quickSearchResults.length.toString())}
                  </div>
                  <div className="space-y-1 mt-2">
                    {quickSearchResults.map((result, index) => (
                      <button
                        key={result.idDoc || index}
                        onClick={() => handleResultClick(result)}
                        className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          {/* Story thumbnail */}
                          <div className="flex-shrink-0 w-12 h-16 bg-muted rounded overflow-hidden">
                            {result.image || result.thumbnail ? (
                              <img
                                src={result.image || result.thumbnail}
                                alt={result.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted">
                                📖
                              </div>
                            )}
                          </div>
                          
                          {/* Story info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-body-primary group-hover:text-primary transition-colors line-clamp-1">
                              {result.name}
                            </h4>
                            
                            {result.authName && (
                              <p className="text-xs text-muted mt-1">
                                ✍️ {result.authName}
                              </p>
                            )}
                            
                            {result.sortDesc && (
                              <p className="text-xs text-muted mt-1 line-clamp-2">
                                {result.sortDesc}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                              {result.chapters && (
                                <span>📚 {result.chapters} {TextConstants.story.chapters[currentLang]}</span>
                              )}
                              {result.views && (
                                <span>👁️ {result.views.toLocaleString()} {TextConstants.story.views[currentLang]}</span>
                              )}
                              {result.status && (
                                <span className="px-2 py-0.5 bg-muted rounded text-xs">
                                  {result.status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* View all results link */}
                  <div className="mt-2 pt-2 border-t border-light">
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}`}
                      onClick={() => setIsQuickSearchOpen(false)}
                      className="block w-full text-center py-2 text-sm text-primary hover:text-primary-dark transition-colors"
                    >
                      {TextConstants.common.search[currentLang] === 'Search' ? 
                        TextConstants.common.search.view_all_results.en.replace('{query}', query) : 
                        TextConstants.common.search.view_all_results.vi.replace('{query}', query)}
                    </Link>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-muted">
                  {quickSearchError ? (
                    <>
                      <div className="text-red-500 mb-2">
                        {TextConstants.common.search[currentLang] === 'Search' ? 
                          TextConstants.common.search.search_error.en : 
                          TextConstants.common.search.search_error.vi}
                      </div>
                      <div className="text-xs">{quickSearchError}</div>
                    </>
                  ) : (
                    <>
                      <div className="mb-2">😔 
                        {TextConstants.common.search[currentLang] === 'Search' ? 
                          TextConstants.common.search.no_results.en : 
                          TextConstants.common.search.no_results.vi}
                      </div>
                      <div className="text-xs">
                        {TextConstants.common.search[currentLang] === 'Search' ? 
                          TextConstants.common.search.try_different_keywords.en : 
                          TextConstants.common.search.try_different_keywords.vi}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}