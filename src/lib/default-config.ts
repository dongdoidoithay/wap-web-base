import { DomainConfig } from './domain-config';

export function getDefaultDomainConfig(): DomainConfig {
  return {
    domain: 'default.com',
    name: 'Default Domain',
    description: 'Default domain configuration',
    logo: '/logo.png',
    theme: {
      // Primary colors
      primaryColor: '#10B981',      // emerald-500
      secondaryColor: '#059669',    // emerald-600
      accentColor: '#34D399',       // emerald-400
      
      // Background colors
      backgroundColor: '#F9FAFB',   // gray-50
      surfaceColor: '#FFFFFF',      // white
      
      // Text colors
      textPrimary: '#111827',       // gray-900
      textSecondary: '#6B7280',     // gray-500
      textMuted: '#9CA3AF',         // gray-400
      
      // State colors
      successColor: '#10B981',      // emerald-500
      warningColor: '#F59E0B',      // amber-500
      errorColor: '#EF4444',        // red-500
      infoColor: '#3B82F6',         // blue-500
      
      // Interactive colors
      linkColor: '#10B981',         // emerald-500
      linkHoverColor: '#059669',    // emerald-600
      buttonColor: '#10B981',       // emerald-500
      buttonTextColor: '#FFFFFF',   // white
      
      // Border colors
      borderColor: '#D1D5DB',       // gray-300
      borderLightColor: '#E5E7EB',  // gray-200
      
      // Focus colors
      focusColor: '#10B981',        // emerald-500
      
      // Gradient colors
      gradientFrom: '#10B981',      // emerald-500
      gradientTo: '#059669',        // emerald-600
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
    // Initialize cateChip as empty array with lang property support
    cateChip: []
  };
}