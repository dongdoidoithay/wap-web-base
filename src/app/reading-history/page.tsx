'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SEOHead } from '@/components/seo-head';
import { useDomain } from '@/hooks/use-domain';
import { Header, FooterNav } from '@/components/ui';
import { useReadingHistory } from '@/lib/reading-history';
import { ReadingHistoryItem } from '@/types';
import { useLanguage } from '@/contexts/language-context';
import { TextConstants } from '@/lib/text-constants';

interface ReadingHistoryPageState {
  searchQuery: string;
  sortBy: 'recent' | 'name' | 'progress';
  showDeleteConfirm: string | null;
  selectedItems: Set<string>;
  bulkDeleteMode: boolean;
}

export default function ReadingHistoryPage() {
  // ========================
  // 1. HOOKS AND STATE
  // ========================
  const { currentLang } = useLanguage();
  const domainConfig = useDomain();
  const { 
    history, 
    loading, 
    removeFromHistory, 
    clearHistory, 
    refreshHistory 
  } = useReadingHistory();

  const [pageState, setPageState] = useState<ReadingHistoryPageState>({
    searchQuery: '',
    sortBy: 'recent',
    showDeleteConfirm: null,
    selectedItems: new Set(),
    bulkDeleteMode: false
  });

  // ========================
  // 2. COMPUTED VALUES
  // ========================
  const filteredAndSortedHistory = React.useMemo(() => {
    let filtered = history;

    // Apply search filter
    if (pageState.searchQuery) {
      const query = pageState.searchQuery.toLowerCase();
      filtered = history.filter(
        item =>
          item.storyName.toLowerCase().includes(query) ||
          item.chapterName.toLowerCase().includes(query) ||
          (item.storyAuthor && item.storyAuthor.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    switch (pageState.sortBy) {
      case 'recent':
        return filtered.sort((a, b) => 
          new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime()
        );
      case 'name':
        return filtered.sort((a, b) => 
          a.storyName.localeCompare(b.storyName, 'vi')
        );
      case 'progress':
        return filtered.sort((a, b) => {
          const progressA = (a.currentChapterIndex + 1) / a.totalChapters;
          const progressB = (b.currentChapterIndex + 1) / b.totalChapters;
          return progressB - progressA;
        });
      default:
        return filtered;
    }
  }, [history, pageState.searchQuery, pageState.sortBy]);

  // ========================
  // 3. EVENT HANDLERS
  // ========================
  const handleDeleteStory = (idDoc: string) => {
    setPageState(prev => ({ ...prev, showDeleteConfirm: idDoc }));
  };

  const confirmDelete = () => {
    if (pageState.showDeleteConfirm) {
      removeFromHistory(pageState.showDeleteConfirm);
      setPageState(prev => ({
        ...prev,
        showDeleteConfirm: null,
        selectedItems: new Set([...prev.selectedItems].filter(id => id !== pageState.showDeleteConfirm))
      }));
    }
  };

  const cancelDelete = () => {
    setPageState(prev => ({ ...prev, showDeleteConfirm: null }));
  };

  const toggleBulkMode = () => {
    setPageState(prev => ({
      ...prev,
      bulkDeleteMode: !prev.bulkDeleteMode,
      selectedItems: new Set()
    }));
  };

  const toggleSelectItem = (idDoc: string) => {
    setPageState(prev => {
      const newSelected = new Set(prev.selectedItems);
      if (newSelected.has(idDoc)) {
        newSelected.delete(idDoc);
      } else {
        newSelected.add(idDoc);
      }
      return { ...prev, selectedItems: newSelected };
    });
  };

  const selectAll = () => {
    setPageState(prev => ({
      ...prev,
      selectedItems: new Set(filteredAndSortedHistory.map(item => item.idDoc))
    }));
  };

  const deselectAll = () => {
    setPageState(prev => ({ ...prev, selectedItems: new Set() }));
  };

  const bulkDelete = () => {
    pageState.selectedItems.forEach(idDoc => {
      removeFromHistory(idDoc);
    });
    setPageState(prev => ({
      ...prev,
      selectedItems: new Set(),
      bulkDeleteMode: false
    }));
  };

  const clearAllHistory = () => {
    if (window.confirm(TextConstants.readingHistory.confirm_clear[currentLang])) {
      clearHistory();
      setPageState(prev => ({
        ...prev,
        selectedItems: new Set(),
        bulkDeleteMode: false
      }));
    }
  };

  // ========================
  // 4. LOADING STATE
  // ========================
  if (!domainConfig) {
    return (
      <div className="min-h-dvh bg-background text-body-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted">{TextConstants.common.loading[currentLang]}</div>
        </div>
      </div>
    );
  }

  // ========================
  // 5. RENDER
  // ========================
  return (
    <>
      <SEOHead
        title={`${TextConstants.readingHistory.title[currentLang]} | ${domainConfig.name}`}
        description={TextConstants.readingHistory.description[currentLang]}
        canonical={`https://${domainConfig.domain}/reading-history`}
      />

      <div className="min-h-dvh bg-background text-body-primary">
        {/* HEADER */}
        <Header config={domainConfig} />

        <main className="container mx-auto px-4 py-6 max-w-6xl pb-24">
          {/* BREADCRUMB */}
          <nav className="flex items-center space-x-2 text-sm text-muted mb-6">
            <Link href="/" className="hover:text-primary transition-colors">
              {TextConstants.common.home[currentLang]}
            </Link>
            <span>›</span>
            <span className="text-body-primary font-medium">{TextConstants.common.history[currentLang]}</span>
          </nav>

          {/* PAGE HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                {TextConstants.readingHistory.title[currentLang]}
              </h1>
              <p className="text-muted">
                {history.length === 0
                  ? TextConstants.readingHistory.empty_history[currentLang]
                  : `${history.length} ${TextConstants.story.chapters[currentLang]}`}
              </p>
            </div>
            
            {history.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={toggleBulkMode}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    pageState.bulkDeleteMode
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                  }`}
                >
                  {pageState.bulkDeleteMode ? TextConstants.readingHistory.cancel[currentLang] : TextConstants.common.view_all[currentLang]}
                </button>
                <button
                  onClick={clearAllHistory}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  {TextConstants.readingHistory.clear_history[currentLang]}
                </button>
              </div>
            )}
          </div>

          {history.length > 0 && (
            <>
              {/* SEARCH AND FILTER */}
              <div className="bg-card border rounded-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder={`${TextConstants.common.search[currentLang]} ${TextConstants.common.search.placeholder[currentLang]}`}
                      value={pageState.searchQuery}
                      onChange={(e) =>
                        setPageState(prev => ({ ...prev, searchQuery: e.target.value }))
                      }
                      className="w-full px-4 py-2 border rounded-lg bg-background text-body-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  {/* Sort */}
                  <select
                    value={pageState.sortBy}
                    onChange={(e) =>
                      setPageState(prev => ({
                        ...prev,
                        sortBy: e.target.value as 'recent' | 'name' | 'progress'
                      }))
                    }
                    className="px-4 py-2 border rounded-lg bg-background text-body-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="recent">{TextConstants.home.latest_stories[currentLang]}</option>
                    <option value="name">{TextConstants.common.search[currentLang]}</option>
                    <option value="progress">{TextConstants.readingHistory.progress[currentLang]}</option>
                  </select>
                </div>

                {/* Bulk Actions */}
                {pageState.bulkDeleteMode && (
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                    <div className="flex gap-2">
                      <button
                        onClick={selectAll}
                        className="text-sm text-primary hover:underline"
                      >
                        {TextConstants.common.view_all[currentLang]}
                      </button>
                      <button
                        onClick={deselectAll}
                        className="text-sm text-muted hover:underline"
                      >
                        {TextConstants.readingHistory.cancel[currentLang]}
                      </button>
                    </div>
                    
                    {pageState.selectedItems.size > 0 && (
                      <button
                        onClick={bulkDelete}
                        className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        {TextConstants.readingHistory.clear_history[currentLang]} {pageState.selectedItems.size} {TextConstants.story.chapters[currentLang]}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* READING HISTORY LIST */}
              {filteredAndSortedHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-primary mb-2">
                    {TextConstants.common.search.no_results[currentLang]}
                  </h3>
                  <p className="text-muted">
                    {TextConstants.common.search.try_different_keywords[currentLang]}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAndSortedHistory.map((story) => {
                    const progress = ((story.currentChapterIndex + 1) / story.totalChapters) * 100;
                    const isSelected = pageState.selectedItems.has(story.idDoc);
                    
                    return (
                      <div
                        key={story.idDoc}
                        className={`bg-card border rounded-lg overflow-hidden hover:border-primary/50 transition-all ${
                          isSelected ? 'ring-2 ring-primary/50' : ''
                        }`}
                      >
                        {/* Story Image and Selection */}
                        <div className="relative">
                          {story.storyImage ? (
                            <img
                              src={story.storyImage}
                              alt={story.storyName}
                              className="w-full h-32 object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-32 bg-muted flex items-center justify-center">
                              <span className="text-4xl">📖</span>
                            </div>
                          )}
                          
                          {/* Progress Bar */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50">
                            <div 
                              className="h-1 bg-primary transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          
                          {/* Selection Checkbox */}
                          {pageState.bulkDeleteMode && (
                            <div className="absolute top-2 right-2">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectItem(story.idDoc)}
                                  className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  isSelected 
                                    ? 'bg-primary border-primary text-white' 
                                    : 'bg-white border-gray-300'
                                }`}>
                                  {isSelected && <span className="text-xs">✓</span>}
                                </div>
                              </label>
                            </div>
                          )}
                        </div>

                        {/* Story Info */}
                        <div className="p-4">
                          <h3 className="font-bold text-body-primary mb-2 line-clamp-2">
                            {story.storyName}
                          </h3>
                          
                          <p className="text-sm text-muted mb-2 line-clamp-1">
                            {story.chapterName}
                          </p>
                          
                          <div className="text-xs text-muted mb-3 space-y-1">
                            <div>{TextConstants.story.chapters[currentLang]} {story.currentChapterIndex + 1} / {story.totalChapters}</div>
                            <div>{TextConstants.readingHistory.progress[currentLang]}: {progress.toFixed(1)}%</div>
                            <div>{TextConstants.readingHistory.last_read[currentLang]}: {new Date(story.lastReadAt).toLocaleDateString('vi-VN')}</div>
                            {story.storyAuthor && <div>{TextConstants.story.author[currentLang]}: {story.storyAuthor}</div>}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Link
                              href={story.chapterUrl}
                              className="flex-1 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-center"
                            >
                              {TextConstants.readingHistory.continue_reading[currentLang]}
                            </Link>
                            <Link
                              href={story.storyUrl}
                              className="px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                              title={TextConstants.readingHistory.story_info[currentLang]}
                            >
                              📖
                            </Link>
                            <button
                              onClick={() => handleDeleteStory(story.idDoc)}
                              className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              title={TextConstants.readingHistory.remove_from_history[currentLang]}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* EMPTY STATE */}
          {history.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-primary mb-2">
                {TextConstants.readingHistory.empty_history_title[currentLang]}
              </h3>
              <p className="text-muted mb-6">
                {TextConstants.readingHistory.empty_history[currentLang]}
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                {TextConstants.readingHistory.explore_stories[currentLang]}
              </Link>
            </div>
          )}
        </main>

        {/* FOOTER */}
        <FooterNav />
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {pageState.showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-primary mb-4">
              {TextConstants.readingHistory.confirm[currentLang]}
            </h3>
            <p className="text-muted mb-6">
              {TextConstants.readingHistory.remove_confirm[currentLang]}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                {TextConstants.readingHistory.cancel[currentLang]}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                {TextConstants.readingHistory.confirm[currentLang]}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Add Tailwind CSS classes for line clamping
// You might want to add these to your global CSS if not already present
/*
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
*/