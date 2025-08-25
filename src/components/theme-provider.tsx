'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useDomain } from '../hooks/use-domain';

interface ThemeContextType {
  // Primary colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  
  // Background colors
  backgroundColor: string;
  surfaceColor: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // State colors
  successColor: string;
  warningColor: string;
  errorColor: string;
  infoColor: string;
  
  // Interactive colors
  linkColor: string;
  linkHoverColor: string;
  buttonColor: string;
  buttonTextColor: string;
  
  // Border colors
  borderColor: string;
  borderLightColor: string;
  
  // Focus colors
  focusColor: string;
  
  // Gradient colors
  gradientFrom?: string;
  gradientTo?: string;
}

const ThemeContext = createContext<ThemeContextType>({
  // Primary colors
  primaryColor: '#10B981',
  secondaryColor: '#059669',
  accentColor: '#34D399',
  
  // Background colors
  backgroundColor: '#F9FAFB',
  surfaceColor: '#FFFFFF',
  
  // Text colors
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  
  // State colors
  successColor: '#10B981',
  warningColor: '#F59E0B',
  errorColor: '#EF4444',
  infoColor: '#3B82F6',
  
  // Interactive colors
  linkColor: '#10B981',
  linkHoverColor: '#059669',
  buttonColor: '#10B981',
  buttonTextColor: '#FFFFFF',
  
  // Border colors
  borderColor: '#D1D5DB',
  borderLightColor: '#E5E7EB',
  
  // Focus colors
  focusColor: '#10B981',
  
  // Gradient colors
  gradientFrom: '#10B981',
  gradientTo: '#059669',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const domainData = useDomain();
  const [mounted, setMounted] = useState(false);

  // Tách config và refreshConfig
  const config = domainData ? { 
    domain: domainData.domain,
    name: domainData.name,
    description: domainData.description,
    logo: domainData.logo,
    theme: domainData.theme,
    seo: domainData.seo,
    content: domainData.content,
    social: domainData.social,
    paths: domainData.paths,
    languages: domainData.languages,
    api: domainData.api,
    routes: domainData.routes
  } : null;
  const refreshConfig = domainData?.refreshConfig;

  // Đảm bảo component chỉ render sau khi mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Chỉ cập nhật theme khi có config mới và đã mount
  useEffect(() => {
    if (config && mounted) {
      // Force cập nhật CSS custom properties
      const root = document.documentElement;
      
      // Remove all existing theme properties
      const themeProperties = [
        '--primary', '--primary-dark', '--primary-light',
        '--secondary', '--accent',
        '--background', '--surface',
        '--text-primary', '--text-secondary', '--text-muted',
        '--success', '--warning', '--error', '--info',
        '--link', '--link-hover', '--button', '--button-text',
        '--border', '--border-light',
        '--focus',
        '--gradient-from', '--gradient-to'
      ];
      
      themeProperties.forEach(prop => {
        root.style.removeProperty(prop);
      });
      
      // Add new values with delay for better performance
      setTimeout(() => {
        // Primary colors
        root.style.setProperty('--primary', config.theme.primaryColor);
        root.style.setProperty('--primary-dark', config.theme.secondaryColor);
        root.style.setProperty('--primary-light', config.theme.accentColor);
        root.style.setProperty('--secondary', config.theme.secondaryColor);
        root.style.setProperty('--accent', config.theme.accentColor);
        
        // Background colors
        root.style.setProperty('--background', config.theme.backgroundColor);
        root.style.setProperty('--surface', config.theme.surfaceColor);
        
        // Text colors
        root.style.setProperty('--text-primary', config.theme.textPrimary);
        root.style.setProperty('--text-secondary', config.theme.textSecondary);
        root.style.setProperty('--text-muted', config.theme.textMuted);
        
        // State colors
        root.style.setProperty('--success', config.theme.successColor);
        root.style.setProperty('--warning', config.theme.warningColor);
        root.style.setProperty('--error', config.theme.errorColor);
        root.style.setProperty('--info', config.theme.infoColor);
        
        // Interactive colors
        root.style.setProperty('--link', config.theme.linkColor);
        root.style.setProperty('--link-hover', config.theme.linkHoverColor);
        root.style.setProperty('--button', config.theme.buttonColor);
        root.style.setProperty('--button-text', config.theme.buttonTextColor);
        
        // Border colors
        root.style.setProperty('--border', config.theme.borderColor);
        root.style.setProperty('--border-light', config.theme.borderLightColor);
        
        // Focus colors
        root.style.setProperty('--focus', config.theme.focusColor);
        
        // Gradient colors
        if (config.theme.gradientFrom) {
          root.style.setProperty('--gradient-from', config.theme.gradientFrom);
        }
        if (config.theme.gradientTo) {
          root.style.setProperty('--gradient-to', config.theme.gradientTo);
        }
        
        // Force repaint
        document.body.style.display = 'none';
        document.body.offsetHeight; // trigger reflow
        document.body.style.display = '';
      }, 10);
    }
  }, [config, mounted]);

  // Expose refresh function through window object for admin page
  useEffect(() => {
    if (refreshConfig && mounted) {
      (window as any).refreshTheme = refreshConfig;
    }
  }, [refreshConfig, mounted]);

  return (
    <ThemeContext.Provider value={{
      // Primary colors
      primaryColor: config?.theme.primaryColor || '#10B981',
      secondaryColor: config?.theme.secondaryColor || '#059669',
      accentColor: config?.theme.accentColor || '#34D399',
      
      // Background colors
      backgroundColor: config?.theme.backgroundColor || '#F9FAFB',
      surfaceColor: config?.theme.surfaceColor || '#FFFFFF',
      
      // Text colors
      textPrimary: config?.theme.textPrimary || '#111827',
      textSecondary: config?.theme.textSecondary || '#6B7280',
      textMuted: config?.theme.textMuted || '#9CA3AF',
      
      // State colors
      successColor: config?.theme.successColor || '#10B981',
      warningColor: config?.theme.warningColor || '#F59E0B',
      errorColor: config?.theme.errorColor || '#EF4444',
      infoColor: config?.theme.infoColor || '#3B82F6',
      
      // Interactive colors
      linkColor: config?.theme.linkColor || '#10B981',
      linkHoverColor: config?.theme.linkHoverColor || '#059669',
      buttonColor: config?.theme.buttonColor || '#10B981',
      buttonTextColor: config?.theme.buttonTextColor || '#FFFFFF',
      
      // Border colors
      borderColor: config?.theme.borderColor || '#D1D5DB',
      borderLightColor: config?.theme.borderLightColor || '#E5E7EB',
      
      // Focus colors
      focusColor: config?.theme.focusColor || '#10B981',
      
      // Gradient colors
      gradientFrom: config?.theme.gradientFrom || '#10B981',
      gradientTo: config?.theme.gradientTo || '#059669',
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
} 