'use client';

import { useEffect } from 'react';
import { useActiveApiPath } from '../hooks/use-active-api-path';
import { updateApiConfigWithActivePath } from '../services/story-api.service';

/**
 * Provider component to update the API configuration based on the active API path
 * This component should be placed at the root of the application to ensure
 * the API configuration is updated whenever the active API path changes
 */
export function ApiConfigProvider({ children }: { children: React.ReactNode }) {
  const activeApiPath = useActiveApiPath();
  
  useEffect(() => {
    // Update the API configuration with the active API path
    updateApiConfigWithActivePath(activeApiPath);
    console.log('[ApiConfigProvider] API configuration updated with active path:', activeApiPath);
  }, [activeApiPath]);
  
  return <>{children}</>;
}