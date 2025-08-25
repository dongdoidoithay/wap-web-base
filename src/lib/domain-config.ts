export interface DomainConfig {
  domain: string;
  name: string;
  description: string;
  logo: string;
  theme: {
    // Primary colors
    primaryColor: string;     // Main brand color
    secondaryColor: string;   // Secondary brand color
    accentColor: string;      // Accent/highlight color
    
    // Background colors
    backgroundColor: string;  // Main background
    surfaceColor: string;     // Card/surface background
    
    // Text colors
    textPrimary: string;      // Primary text
    textSecondary: string;    // Secondary text
    textMuted: string;        // Muted/disabled text
    
    // State colors
    successColor: string;     // Success states
    warningColor: string;     // Warning states
    errorColor: string;       // Error states
    infoColor: string;        // Info states
    
    // Interactive colors
    linkColor: string;        // Links
    linkHoverColor: string;   // Link hover
    buttonColor: string;      // Button background
    buttonTextColor: string;  // Button text
    
    // Border colors
    borderColor: string;      // Default borders
    borderLightColor: string; // Light borders
    
    // Focus colors
    focusColor: string;       // Focus rings
    
    // Gradient colors (optional)
    gradientFrom?: string;    // Gradient start
    gradientTo?: string;      // Gradient end
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
    twitterHandle?: string;
    googleAnalyticsId?: string;
    // Thêm template SEO
    template: {
      detail: string;    // Template cho trang chi tiết
      group: string;     // Template cho trang nhóm
      type: string;      // Template cho trang loại
    };
  };
  content: {
    categories: string[];
    featuredArticles: number[];
  };
  social: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  // Thêm cấu hình cho multi-path và API
  paths: {
    vietnamese: string; // Ví dụ: 'doc-truyen'
    english: string;    // Ví dụ: 'read-manga'
    search: string;     // Ví dụ: 'tim-kiem'
  };
  languages: {
    default: 'vi' | 'en';
    supported: ('vi' | 'en')[];
  };
  // Cấu hình API endpoints
  api: {
    vietnamese: string; // Ví dụ: '/api/manga-vn'
    english: string;    // Ví dụ: '/api/manga-en'
    search: string;     // Ví dụ: '/api/search'
    auth: string;       // Ví dụ: '/api/auth'
  };
  // Cấu hình routes động
  routes: {
    [key: string]: {
      path: string;
      api: string;
      language: 'vi' | 'en';
      title: string;
      description: string;
    };
  };
}

// Cache để lưu cấu hình domains
let domainConfigsCache: Record<string, DomainConfig> | null = null;

// Function to migrate old theme configuration to new comprehensive structure
function migrateThemeConfig(theme: any) {
  if (!theme) {
    return {
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
    };
  }
  
  // Check if already has comprehensive structure
  if (theme.textPrimary && theme.successColor) {
    return theme;
  }
  
  // Migrate from old structure
  return {
    // Primary colors (preserve existing)
    primaryColor: theme.primaryColor || '#10B981',
    secondaryColor: theme.secondaryColor || '#059669',
    accentColor: theme.accentColor || '#34D399',
    
    // Background colors
    backgroundColor: theme.backgroundColor || '#F9FAFB',
    surfaceColor: theme.surfaceColor || '#FFFFFF',
    
    // Text colors
    textPrimary: theme.textPrimary || '#111827',
    textSecondary: theme.textSecondary || '#6B7280',
    textMuted: theme.textMuted || '#9CA3AF',
    
    // State colors (inherit from primary if not set)
    successColor: theme.successColor || theme.primaryColor || '#10B981',
    warningColor: theme.warningColor || '#F59E0B',
    errorColor: theme.errorColor || '#EF4444',
    infoColor: theme.infoColor || '#3B82F6',
    
    // Interactive colors (inherit from primary if not set)
    linkColor: theme.linkColor || theme.primaryColor || '#10B981',
    linkHoverColor: theme.linkHoverColor || theme.secondaryColor || '#059669',
    buttonColor: theme.buttonColor || theme.primaryColor || '#10B981',
    buttonTextColor: theme.buttonTextColor || '#FFFFFF',
    
    // Border colors
    borderColor: theme.borderColor || '#D1D5DB',
    borderLightColor: theme.borderLightColor || '#E5E7EB',
    
    // Focus colors (inherit from primary if not set)
    focusColor: theme.focusColor || theme.primaryColor || '#10B981',
    
    // Gradient colors (inherit from primary/secondary if not set)
    gradientFrom: theme.gradientFrom || theme.primaryColor || '#10B981',
    gradientTo: theme.gradientTo || theme.secondaryColor || '#059669'
  };
}

// Hàm để đọc cấu hình từ file JSON
async function loadDomainConfigs(): Promise<Record<string, DomainConfig>> {
  if (domainConfigsCache) {
    return domainConfigsCache;
  }

  try {
    // Server & Edge: cần URL tuyệt đối cho fetch
    if (typeof window === 'undefined') {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
        || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || 3000}`);
      const response = await fetch(`${baseUrl}/domains-config.json`, { cache: 'no-store' } as RequestInit);
      if (!response.ok) {
        throw new Error('Failed to load domain configs');
      }
      const configs = (await response.json()) as Record<string, DomainConfig>;
      
      // Apply theme migration to all configs
      Object.keys(configs).forEach(domain => {
        configs[domain].theme = migrateThemeConfig(configs[domain].theme);
      });
      
      domainConfigsCache = configs;
      return configs;
    }

    // Client: fetch từ public
    const response = await fetch('/domains-config.json', { cache: 'no-store' } as RequestInit);
    if (!response.ok) {
      throw new Error('Failed to load domain configs');
    }
    const configs = (await response.json()) as Record<string, DomainConfig>;
    
    // Apply theme migration to all configs
    Object.keys(configs).forEach(domain => {
      configs[domain].theme = migrateThemeConfig(configs[domain].theme);
    });
    
    domainConfigsCache = configs;
    return configs;
  } catch (error) {
    console.error('Error loading domain configs:', error);
    // Fallback config nếu không thể đọc file
    const fallbackConfig = {
      'example.com': {
        domain: 'example.com',
        name: 'WAP Content Hub',
        description: 'A lean Next.js + TailwindCSS template optimized for Core Web Vitals, schema, and content hubs.',
        logo: '🏷️',
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
          title: 'WAP Content Hub — Fast, Mobile-First, SEO Ready',
          description: 'A lean Next.js + TailwindCSS template optimized for Core Web Vitals, schema, and content hubs.',
          keywords: ['Next.js', 'SEO', 'Web Performance', 'Core Web Vitals'],
          ogImage: '/og.jpg',
          googleAnalyticsId: 'GA_MEASUREMENT_ID',
          template: {
            detail: '%title% - %author% | %domain%',
            group: '%group% - %domain%',
            type: '%type% - %domain%',
          },
        },
        content: {
          categories: ['Tin mới', 'Hướng dẫn', 'Đánh giá', 'Mẹo vặt', 'Phỏng vấn'],
          featuredArticles: [1, 2, 3],
        },
        social: {
          facebook: 'https://facebook.com/example',
          twitter: 'https://twitter.com/example',
        },
        paths: {
          vietnamese: 'doc-truyen',
          english: 'read-manga',
          search: 'tim-kiem',
        },
        languages: {
          default: 'vi' as const,
          supported: ['vi', 'en'] as const,
        },
        api: {
          vietnamese: '/api/manga-vn',
          english: '/api/manga-en',
          search: '/api/search',
          auth: '/api/auth',
        },
        routes: {
          'doc-truyen': {
            path: 'doc-truyen',
            api: '/api/manga-vn',
            language: 'vi',
            title: 'Đọc Truyện',
            description: 'Truyện tiếng Việt đa dạng thể loại',
          },
          'read-manga': {
            path: 'read-manga',
            api: '/api/manga-en',
            language: 'en',
            title: 'Read Manga',
            description: 'Manga tiếng Anh chất lượng cao',
          },
          'tim-kiem': {
            path: 'tim-kiem',
            api: '/api/search',
            language: 'vi',
            title: 'Tìm kiếm',
            description: 'Tìm kiếm truyện và manga',
          },
        },
      },
    } as Record<string, DomainConfig>;
    domainConfigsCache = fallbackConfig;
    return fallbackConfig;
  }
}

export async function refreshDomainConfigsCache(): Promise<void> {
  domainConfigsCache = null;
  await loadDomainConfigs();
}

// Hàm để force refresh cache và trả về config mới
export async function forceRefreshDomainConfigs(): Promise<Record<string, DomainConfig>> {
  domainConfigsCache = null;
  return await loadDomainConfigs();
}

// Hàm để lấy cấu hình domain (async)
export async function getDomainConfig(hostname: string): Promise<DomainConfig> {
  const domainConfigs = await loadDomainConfigs();
  
  // Remove port and protocol
  const domain = hostname.replace(/:\d+$/, '').toLowerCase();
  
  // Try exact match first
  if (domainConfigs[domain]) {
    return domainConfigs[domain];
  }
  
  // Try subdomain matching
  const subdomain = domain.split('.')[0];
  const mainDomain = domain.split('.').slice(-2).join('.');
  
  if (domainConfigs[mainDomain]) {
    return {
      ...domainConfigs[mainDomain],
      domain: domain,
      name: `${domainConfigs[mainDomain].name} - ${subdomain}`,
    };
  }
  
  // Return default config
  return domainConfigs['example.com'];
}

// Hàm để lấy cấu hình domain (sync - cho middleware và layout)
export function getDomainConfigSync(hostname: string): DomainConfig {
  // Sử dụng cache nếu có, nếu không thì dùng fallback
  if (domainConfigsCache) {
    const domain = hostname.replace(/:\d+$/, '').toLowerCase();
    
    if (domainConfigsCache[domain]) {
      const config = { ...domainConfigsCache[domain] };
      config.theme = migrateThemeConfig(config.theme);
      return config;
    }
    
    const subdomain = domain.split('.')[0];
    const mainDomain = domain.split('.').slice(-2).join('.');
    
    if (domainConfigsCache[mainDomain]) {
      const config = {
        ...domainConfigsCache[mainDomain],
        domain: domain,
        name: `${domainConfigsCache[mainDomain].name} - ${subdomain}`,
      };
      config.theme = migrateThemeConfig(config.theme);
      return config;
    }
    
    const defaultConfig = domainConfigsCache['example.com'];
    if (defaultConfig) {
      const config = { ...defaultConfig };
      config.theme = migrateThemeConfig(config.theme);
      return config;
    }
  }
  
  // Fallback config nếu chưa có cache
  return {
    domain: 'example.com',
    name: 'WAP Content Hub',
    description: 'A lean Next.js + TailwindCSS template optimized for Core Web Vitals, schema, and content hubs.',
    logo: '🏷️',
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
      title: 'WAP Content Hub — Fast, Mobile-First, SEO Ready',
      description: 'A lean Next.js + TailwindCSS template optimized for Core Web Vitals, schema, and content hubs.',
      keywords: ['Next.js', 'SEO', 'Web Performance', 'Core Web Vitals'],
      ogImage: '/og.jpg',
      googleAnalyticsId: 'GA_MEASUREMENT_ID',
      template: {
        detail: '%title% - %author% | %domain%',
        group: '%group% - %domain%',
        type: '%type% - %domain%',
      },
    },
    content: {
      categories: ['Tin mới', 'Hướng dẫn', 'Đánh giá', 'Mẹo vặt', 'Phỏng vấn'],
      featuredArticles: [1, 2, 3],
    },
    social: {
      facebook: 'https://facebook.com/example',
      twitter: 'https://twitter.com/example',
    },
    paths: {
      vietnamese: 'doc-truyen',
      english: 'read-manga',
      search: 'tim-kiem',
    },
    languages: {
      default: 'vi' as const,
      supported: ['vi', 'en'] as const,
    },
    api: {
      vietnamese: '/api/manga-vn',
      english: '/api/manga-en',
      search: '/api/search',
      auth: '/api/auth',
    },
    routes: {
      'doc-truyen': {
        path: 'doc-truyen',
        api: '/api/manga-vn',
        language: 'vi',
        title: 'Đọc Truyện',
        description: 'Truyện tiếng Việt đa dạng thể loại',
      },
      'read-manga': {
        path: 'read-manga',
        api: '/api/manga-en',
        language: 'en',
        title: 'Read Manga',
        description: 'Manga tiếng Anh chất lượng cao',
      },
      'tim-kiem': {
        path: 'tim-kiem',
        api: '/api/search',
        language: 'vi',
        title: 'Tìm kiếm',
        description: 'Tìm kiếm truyện và manga',
      },
    },
  };
}

// Hàm để lấy tất cả domains (async)
export async function getAllDomains(): Promise<string[]> {
  const domainConfigs = await loadDomainConfigs();
  return Object.keys(domainConfigs);
}

// Hàm để lấy tất cả domains (sync)
export function getAllDomainsSync(): string[] {
  if (domainConfigsCache) {
    return Object.keys(domainConfigsCache);
  }
  return ['example.com'];
}

// Hàm để cập nhật cấu hình domain
export async function updateDomainConfig(domain: string, config: DomainConfig): Promise<boolean> {
  try {
    const domainConfigs = await loadDomainConfigs();
    domainConfigs[domain] = config;
    
    // Gửi cập nhật đến API để lưu vào file
    const response = await fetch('/api/domains/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain, config }),
    });
    
    if (response.ok) {
      // Cập nhật cache
      domainConfigsCache = domainConfigs;
      // Force refresh cache để đảm bảo dữ liệu mới nhất
      await refreshDomainConfigsCache();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating domain config:', error);
    return false;
  }
}

// Hàm để xóa domain
export async function deleteDomain(domain: string): Promise<boolean> {
  try {
    const domainConfigs = await loadDomainConfigs();
    delete domainConfigs[domain];
    
    const response = await fetch('/api/domains/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain }),
    });
    
    if (response.ok) {
      domainConfigsCache = domainConfigs;
      // Force refresh cache để đảm bảo dữ liệu mới nhất
      await refreshDomainConfigsCache();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting domain:', error);
    return false;
  }
}

// Hàm để thêm domain mới
export async function addDomain(domain: string, config: DomainConfig): Promise<boolean> {
  try {
    const domainConfigs = await loadDomainConfigs();
    domainConfigs[domain] = config;
    
    const response = await fetch('/api/domains/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain, config }),
    });
    
    if (response.ok) {
      domainConfigsCache = domainConfigs;
      // Force refresh cache để đảm bảo dữ liệu mới nhất
      await refreshDomainConfigsCache();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding domain:', error);
    return false;
  }
} 