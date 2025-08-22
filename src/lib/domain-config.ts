export interface DomainConfig {
  domain: string;
  name: string;
  description: string;
  logo: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
    twitterHandle?: string;
    googleAnalyticsId?: string;
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
}

// Cache để lưu cấu hình domains
let domainConfigsCache: Record<string, DomainConfig> | null = null;

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
      domainConfigsCache = configs;
      return configs;
    }

    // Client: fetch từ public
    const response = await fetch('/domains-config.json', { cache: 'no-store' } as RequestInit);
    if (!response.ok) {
      throw new Error('Failed to load domain configs');
    }
    const configs = (await response.json()) as Record<string, DomainConfig>;
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
          primaryColor: '#10B981',
          secondaryColor: '#059669',
        },
        seo: {
          title: 'WAP Content Hub — Fast, Mobile-First, SEO Ready',
          description: 'A lean Next.js + TailwindCSS template optimized for Core Web Vitals, schema, and content hubs.',
          keywords: ['Next.js', 'SEO', 'Web Performance', 'Core Web Vitals'],
          ogImage: '/og.jpg',
          googleAnalyticsId: 'GA_MEASUREMENT_ID',
        },
        content: {
          categories: ['Tin mới', 'Hướng dẫn', 'Đánh giá', 'Mẹo vặt', 'Phỏng vấn'],
          featuredArticles: [1, 2, 3],
        },
        social: {
          facebook: 'https://facebook.com/example',
          twitter: 'https://twitter.com/example',
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
      return domainConfigsCache[domain];
    }
    
    const subdomain = domain.split('.')[0];
    const mainDomain = domain.split('.').slice(-2).join('.');
    
    if (domainConfigsCache[mainDomain]) {
      return {
        ...domainConfigsCache[mainDomain],
        domain: domain,
        name: `${domainConfigsCache[mainDomain].name} - ${subdomain}`,
      };
    }
    
    return domainConfigsCache['example.com'];
  }
  
  // Fallback config nếu chưa có cache
  return {
    domain: 'example.com',
    name: 'WAP Content Hub',
    description: 'A lean Next.js + TailwindCSS template optimized for Core Web Vitals, schema, and content hubs.',
    logo: '🏷️',
    theme: {
      primaryColor: '#10B981',
      secondaryColor: '#059669',
    },
    seo: {
      title: 'WAP Content Hub — Fast, Mobile-First, SEO Ready',
      description: 'A lean Next.js + TailwindCSS template optimized for Core Web Vitals, schema, and content hubs.',
      keywords: ['Next.js', 'SEO', 'Web Performance', 'Core Web Vitals'],
      ogImage: '/og.jpg',
      googleAnalyticsId: 'GA_MEASUREMENT_ID',
    },
    content: {
      categories: ['Tin mới', 'Hướng dẫn', 'Đánh giá', 'Mẹo vặt', 'Phỏng vấn'],
      featuredArticles: [1, 2, 3],
    },
    social: {
      facebook: 'https://facebook.com/example',
      twitter: 'https://twitter.com/example',
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
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding domain:', error);
    return false;
  }
} 