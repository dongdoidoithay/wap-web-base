'use client';

import React from 'react';
import { ReadingHistoryItem, ReadingHistoryManager } from '@/types';

const READING_HISTORY_KEY = 'wap-reading-history';
const MAX_HISTORY_ITEMS = 50; // Limit to prevent localStorage from growing too large

/**
 * Reading History Manager - Handles all local storage operations for reading history
 * Features:
 * - Add/Update reading progress for stories
 * - Remove stories from history
 * - Get recent stories with limit
 * - Get specific story reading progress
 * - Clear all history
 */
class ReadingHistoryManagerClass implements ReadingHistoryManager {
  /**
   * Get all reading history items from localStorage
   */
  getHistory(): ReadingHistoryItem[] {
    try {
      if (typeof window === 'undefined') return [];
      
      const historyData = localStorage.getItem(READING_HISTORY_KEY);
      if (!historyData) return [];
      
      const items: ReadingHistoryItem[] = JSON.parse(historyData);
      
      // Sort by lastReadAt (newest first) and ensure data integrity
      return items
        .filter(item => item.idDoc && item.idDetail && item.storyName)
        .sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime());
    } catch (error) {
      console.error('Error reading history from localStorage:', error);
      return [];
    }
  }

  /**
   * Add or update reading history item
   */
  addOrUpdateHistory(newItem: ReadingHistoryItem): void {
    try {
      if (typeof window === 'undefined') return;

      const currentHistory = this.getHistory();
      
      // Find existing item for the same story
      const existingIndex = currentHistory.findIndex(item => item.idDoc === newItem.idDoc);
      
      if (existingIndex !== -1) {
        // Update existing item
        currentHistory[existingIndex] = {
          ...currentHistory[existingIndex],
          ...newItem,
          lastReadAt: new Date().toISOString()
        };
      } else {
        // Add new item to beginning of array
        currentHistory.unshift({
          ...newItem,
          lastReadAt: new Date().toISOString()
        });
      }
      
      // Keep only the most recent items to prevent localStorage overflow
      const limitedHistory = currentHistory.slice(0, MAX_HISTORY_ITEMS);
      
      localStorage.setItem(READING_HISTORY_KEY, JSON.stringify(limitedHistory));
      
      console.log('✅ Reading history updated:', newItem.storyName, '-', newItem.chapterName);
    } catch (error) {
      console.error('Error saving reading history:', error);
    }
  }

  /**
   * Remove a story from reading history
   */
  removeFromHistory(idDoc: string): void {
    try {
      if (typeof window === 'undefined') return;

      const currentHistory = this.getHistory();
      const filteredHistory = currentHistory.filter(item => item.idDoc !== idDoc);
      
      localStorage.setItem(READING_HISTORY_KEY, JSON.stringify(filteredHistory));
      
      console.log('🗑️ Removed from reading history:', idDoc);
    } catch (error) {
      console.error('Error removing from reading history:', error);
    }
  }

  /**
   * Clear all reading history
   */
  clearHistory(): void {
    try {
      if (typeof window === 'undefined') return;
      
      localStorage.removeItem(READING_HISTORY_KEY);
      
      console.log('🗑️ All reading history cleared');
    } catch (error) {
      console.error('Error clearing reading history:', error);
    }
  }

  /**
   * Get reading history for a specific story
   */
  getStoryHistory(idDoc: string): ReadingHistoryItem | null {
    try {
      const history = this.getHistory();
      return history.find(item => item.idDoc === idDoc) || null;
    } catch (error) {
      console.error('Error getting story history:', error);
      return null;
    }
  }

  /**
   * Get recent stories with optional limit
   */
  getRecentStories(limit: number = 3): ReadingHistoryItem[] {
    try {
      const history = this.getHistory();
      return history.slice(0, limit);
    } catch (error) {
      console.error('Error getting recent stories:', error);
      return [];
    }
  }

  /**
   * Get total count of stories in history
   */
  getHistoryCount(): number {
    try {
      return this.getHistory().length;
    } catch (error) {
      console.error('Error getting history count:', error);
      return 0;
    }
  }

  /**
   * Export reading history as JSON string (for backup purposes)
   */
  exportHistory(): string {
    try {
      const history = this.getHistory();
      return JSON.stringify(history, null, 2);
    } catch (error) {
      console.error('Error exporting history:', error);
      return '[]';
    }
  }

  /**
   * Import reading history from JSON string (for restore purposes)
   */
  importHistory(jsonData: string): boolean {
    try {
      if (typeof window === 'undefined') return false;

      const importedHistory: ReadingHistoryItem[] = JSON.parse(jsonData);
      
      // Validate imported data
      const validItems = importedHistory.filter(item => 
        item.idDoc && 
        item.idDetail && 
        item.storyName && 
        item.chapterName
      );
      
      // Merge with existing history (avoiding duplicates)
      const currentHistory = this.getHistory();
      const mergedHistory: ReadingHistoryItem[] = [...validItems];
      
      currentHistory.forEach(currentItem => {
        const exists = validItems.some(imported => imported.idDoc === currentItem.idDoc);
        if (!exists) {
          mergedHistory.push(currentItem);
        }
      });
      
      // Sort and limit
      mergedHistory.sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime());
      const limitedHistory = mergedHistory.slice(0, MAX_HISTORY_ITEMS);
      
      localStorage.setItem(READING_HISTORY_KEY, JSON.stringify(limitedHistory));
      
      console.log('✅ Reading history imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing history:', error);
      return false;
    }
  }
}

// Create singleton instance
export const readingHistoryManager = new ReadingHistoryManagerClass();

/**
 * Utility function to create a reading history item
 */
export function createReadingHistoryItem({
  idDoc,
  idDetail,
  storyName,
  chapterName,
  currentChapterIndex = 0,
  totalChapters = 1,
  storyImage = '',
  storyAuthor = '',
  storyGenres = '',
  chapterDate = ''
}: {
  idDoc: string;
  idDetail: string;
  storyName: string;
  chapterName: string;
  currentChapterIndex?: number;
  totalChapters?: number;
  storyImage?: string;
  storyAuthor?: string;
  storyGenres?: string;
  chapterDate?: string;
}): ReadingHistoryItem {
  return {
    idDoc,
    idDetail,
    storyName,
    chapterName,
    currentChapterIndex,
    totalChapters,
    lastReadAt: new Date().toISOString(),
    storyImage,
    storyAuthor,
    storyGenres,
    chapterDate,
    storyUrl: `/${idDoc}`,
    chapterUrl: `/${idDoc}/${idDetail}`
  };
}

/**
 * Hook for reading history management (client-side only)
 */
export function useReadingHistory() {
  const [history, setHistory] = React.useState<ReadingHistoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Load initial history
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialHistory = readingHistoryManager.getHistory();
      setHistory(initialHistory);
      setLoading(false);
    }
  }, []);

  const addToHistory = React.useCallback((item: ReadingHistoryItem) => {
    readingHistoryManager.addOrUpdateHistory(item);
    setHistory(readingHistoryManager.getHistory());
  }, []);

  const removeFromHistory = React.useCallback((idDoc: string) => {
    readingHistoryManager.removeFromHistory(idDoc);
    setHistory(readingHistoryManager.getHistory());
  }, []);

  const clearHistory = React.useCallback(() => {
    readingHistoryManager.clearHistory();
    setHistory([]);
  }, []);

  const refreshHistory = React.useCallback(() => {
    setHistory(readingHistoryManager.getHistory());
  }, []);

  const getRecentStories = React.useCallback((limit?: number) => {
    return readingHistoryManager.getRecentStories(limit);
  }, []);

  const getStoryHistory = React.useCallback((idDoc: string) => {
    return readingHistoryManager.getStoryHistory(idDoc);
  }, []);

  const getHistoryCount = React.useCallback(() => {
    return readingHistoryManager.getHistoryCount();
  }, []);

  return {
    history,
    loading,
    addToHistory,
    removeFromHistory,
    clearHistory,
    refreshHistory,
    getRecentStories,
    getStoryHistory,
    getHistoryCount
  };
}