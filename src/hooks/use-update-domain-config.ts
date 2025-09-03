'use client';

import { useCallback } from 'react';
import { DomainConfig } from '@/lib/domain-config';

/**
 * Hook to update domain configuration
 * This hook provides a function to update the cateChip active-default state
 */
export function useUpdateDomainConfig() {
  const updateDomainConfig = useCallback(async (domain: string, updatedConfig: DomainConfig) => {
    try {
      const response = await fetch('/api/domains/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain, config: updatedConfig }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update domain config: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, message: result.message };
    } catch (error) {
      console.error('Error updating domain config:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, []);

  return { updateDomainConfig };
}