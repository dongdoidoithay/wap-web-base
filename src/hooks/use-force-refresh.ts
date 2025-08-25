import { useState, useCallback } from 'react';

export function useForceRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const forceRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/domains/force-refresh', { 
        method: 'POST',
        cache: 'no-store'
      });
      
      if (response.ok) {
        // Force reload trang để áp dụng cấu hình mới
        window.location.reload();
        return true;
      } else {
        console.error('Failed to force refresh cache');
        return false;
      }
    } catch (error) {
      console.error('Error force refreshing cache:', error);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return {
    forceRefresh,
    isRefreshing
  };
}
