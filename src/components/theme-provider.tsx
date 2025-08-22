'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useDomain } from '../hooks/use-domain';

interface ThemeContextType {
  primaryColor: string;
  secondaryColor: string;
}

const ThemeContext = createContext<ThemeContextType>({
  primaryColor: '#10B981',
  secondaryColor: '#059669',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const config = useDomain();
  const [theme, setTheme] = useState({
    primaryColor: '#10B981',
    secondaryColor: '#059669',
  });

  useEffect(() => {
    if (config) {
      setTheme({
        primaryColor: config.theme.primaryColor,
        secondaryColor: config.theme.secondaryColor,
      });

      // Apply CSS custom properties
      document.documentElement.style.setProperty('--primary', config.theme.primaryColor);
      document.documentElement.style.setProperty('--primary-dark', config.theme.secondaryColor);
      document.documentElement.style.setProperty('--primary-light', config.theme.primaryColor);
    }
  }, [config]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
} 