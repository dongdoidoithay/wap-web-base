'use client';

import { useState, useEffect } from 'react';

interface SimpleCacheDebugProps {
  hostname: string;
  config: any;
}

export function SimpleCacheDebug({ hostname, config }: SimpleCacheDebugProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  // Chỉ hiển thị sau khi component đã mount
  if (!mounted) {
    return null;
  }

  // Chỉ hiển thị trong development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700"
      >
        🐛 Cache Debug
      </button>
      
      {showDebug && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Cache Debug Info</h3>
            <button
              onClick={() => setShowDebug(false)}
              className="text-gray-400 hover:text-gray-600"
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
              <strong>Status:</strong> Ready
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={forceRefresh}
              disabled={isRefreshing}
              className="w-full bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700 disabled:opacity-50"
            >
              {isRefreshing ? 'Đang refresh...' : 'Force Refresh Cache'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
