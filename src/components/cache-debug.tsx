'use client';

import { useState, useEffect } from 'react';

interface CacheDebugProps {
  hostname: string;
  config: any;
}

export function CacheDebug({ hostname, config }: CacheDebugProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Sử dụng useEffect để tránh hydration mismatch
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
    
    // Cập nhật thời gian mỗi giây
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const forceRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/domains/force-refresh', { 
        method: 'POST',
        cache: 'no-store'
      });
      
      if (response.ok) {
        // Force reload trang để áp dụng cấu hình mới
        window.location.reload();
      } else {
        alert('Có lỗi xảy ra khi force refresh cache!');
      }
    } catch (error) {
      console.error('Error force refreshing cache:', error);
      alert('Có lỗi xảy ra khi force refresh cache!');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Chỉ hiển thị trong development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-info text-white px-3 py-2 rounded-md text-sm hover:bg-info/90 transition-colors"
      >
        🐛 Cache Debug
      </button>
      
      {showDebug && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-surface border border-light rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-body-primary">Cache Debug Info</h3>
            <button
              onClick={() => setShowDebug(false)}
              className="text-muted hover:text-body-secondary transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2 text-xs">
            <div>
              <strong>Hostname:</strong> {hostname}
            </div>
            <div>
              <strong>Domain:</strong> {config.domain}
            </div>
            <div>
              <strong>Name:</strong> {config.name}
            </div>
            <div>
              <strong>Cache Time:</strong> {currentTime || 'Loading...'}
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-light">
            <button
              onClick={forceRefresh}
              disabled={isRefreshing}
              className="w-full bg-error text-white px-3 py-2 rounded-md text-sm hover:bg-error/90 disabled:opacity-50 transition-colors"
            >
              {isRefreshing ? 'Đang refresh...' : 'Force Refresh Cache'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
