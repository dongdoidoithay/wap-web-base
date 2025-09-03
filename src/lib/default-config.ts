import { DomainConfig } from './domain-config';

/**
 * Create a default domain configuration
 * @returns A complete DomainConfig object with default values
 */
export function createDefaultConfig(): DomainConfig {
  return {
    domain: '',
    name: '',
    description: '',
    logo: '🏷️',
    theme: {
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
      gradientTo: '#059669'
    },
    seo: {
      title: '',
      description: '',
      keywords: [],
      ogImage: '/og.jpg',
      template: {
        detail: '%title% - %author% | %domain%',
        group: '%group% - %domain%',
        type: '%type% - %domain%'
      }
    },
    content: {
      categories: [],
      featuredArticles: []
    },
    social: {},
    // Initialize cateChip as empty array
    cateChip: []
  };
}