'use client';

import { useEffect, useState, useCallback } from 'react';
import { DomainConfig, getDomainConfig, getDomainConfigSync, refreshDomainConfigsCache } from '../lib/domain-config';

export function useDomain(): DomainConfig & { refreshConfig: () => Promise<void> } | null {
  const [config, setConfig] = useState<DomainConfig | null>(null);
  const [mounted, setMounted] = useState(false);

  const loadConfig = useCallback(async () => {
    if (mounted) {
      const hostname = window.location.hostname;
      
      try {
        // Refresh cache trước khi load config mới
        await refreshDomainConfigsCache();
        const domainConfig = getDomainConfigSync(hostname);
        setConfig(domainConfig);
      } catch (error) {
        console.error('Error loading domain config:', error);
        // Fallback to sync version
        const domainConfig = getDomainConfigSync(hostname);
        setConfig(domainConfig);
      }
    }
  }, [mounted]);

  const refreshConfig = useCallback(async () => {
    await loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Trả về null cho đến khi component mount để tránh hydration mismatch
  if (!mounted || !config) {
    return null;
  }

  return {
    ...config,
    refreshConfig
  };
}

export function useDomainServer(headers: Headers): DomainConfig {
  const hostname = headers.get('host') || '';
  return getDomainConfigSync(hostname);
} 