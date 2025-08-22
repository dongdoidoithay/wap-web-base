'use client';

import { useEffect, useState } from 'react';
import { DomainConfig, getDomainConfig, getDomainConfigSync } from '../lib/domain-config';

export function useDomain(): DomainConfig | null {
  const [config, setConfig] = useState<DomainConfig | null>(null);

  useEffect(() => {
    const hostname = window.location.hostname;
    
    // Sử dụng sync version cho client-side
    const domainConfig = getDomainConfigSync(hostname);
    setConfig(domainConfig);
  }, []);

  return config;
}

export function useDomainServer(headers: Headers): DomainConfig {
  const hostname = headers.get('host') || '';
  return getDomainConfigSync(hostname);
} 