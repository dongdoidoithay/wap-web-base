'use client';

import { useMemo } from 'react';
import { useDomain } from './use-domain';

/**
 * Hook to get the active API path from the domain configuration
 * Uses the cateChip's active-default field to determine which API path to use
 * 
 * @returns The active API path or fallback path if none is found
 */
export function useActiveApiPath(): string {
  const domainConfig = useDomain();
  
  return useMemo(() => {
    // Check localStorage first for user-selected API path
    if (typeof window !== 'undefined') {
      const savedApiPath = localStorage.getItem('selectedApiPath');
      if (savedApiPath) {
        return savedApiPath;
      }
    }
    
    // If no domain config is available, return the default API path
    if (!domainConfig) {
      return '/api/novel-vn';
    }
    
    // If no cateChip is available, return the default API path
    if (!domainConfig.cateChip || domainConfig.cateChip.length === 0) {
      return '/api/novel-vn';
    }
    
    // Find the cateChip with active-default set to true
    const activeCateChip = domainConfig.cateChip.find(chip => chip['active-default']);
    
    // If found, return its API path
    if (activeCateChip) {
      return activeCateChip['api-path'];
    }
    
    // Fallback to the first cateChip's API path if none is marked as active-default
    return domainConfig.cateChip[0]['api-path'] || '/api/novel-vn';
  }, [domainConfig]);
}