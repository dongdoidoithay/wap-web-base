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

export const domainConfigs: Record<string, DomainConfig> = {
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
  'techblog.com': {
    domain: 'techblog.com',
    name: 'Tech Blog Hub',
    description: 'Cập nhật tin tức công nghệ mới nhất, hướng dẫn lập trình và đánh giá sản phẩm.',
    logo: '💻',
    theme: {
      primaryColor: '#10B981',
      secondaryColor: '#059669',
    },
    seo: {
      title: 'Tech Blog Hub - Tin tức công nghệ và hướng dẫn lập trình',
      description: 'Cập nhật tin tức công nghệ mới nhất, hướng dẫn lập trình và đánh giá sản phẩm.',
      keywords: ['Công nghệ', 'Lập trình', 'Tin tức', 'Đánh giá', 'Hướng dẫn'],
      ogImage: '/tech-og.jpg',
      googleAnalyticsId: 'GA_TECH_ID',
    },
    content: {
      categories: ['Tin tức', 'Lập trình', 'Đánh giá', 'Tutorial', 'AI/ML'],
      featuredArticles: [1, 2, 3],
    },
    social: {
      facebook: 'https://facebook.com/techblog',
      twitter: 'https://twitter.com/techblog',
      youtube: 'https://youtube.com/techblog',
    },
  },
  'lifestyle.com': {
    domain: 'lifestyle.com',
    name: 'Lifestyle Magazine',
    description: 'Chia sẻ về cuộc sống, sức khỏe, du lịch và những điều thú vị trong cuộc sống.',
    logo: '🌟',
    theme: {
      primaryColor: '#10B981',
      secondaryColor: '#059669',
    },
    seo: {
      title: 'Lifestyle Magazine - Chia sẻ cuộc sống đẹp',
      description: 'Chia sẻ về cuộc sống, sức khỏe, du lịch và những điều thú vị trong cuộc sống.',
      keywords: ['Lifestyle', 'Sức khỏe', 'Du lịch', 'Ẩm thực', 'Thời trang'],
      ogImage: '/lifestyle-og.jpg',
      googleAnalyticsId: 'GA_LIFESTYLE_ID',
    },
    content: {
      categories: ['Sức khỏe', 'Du lịch', 'Ẩm thực', 'Thời trang', 'Làm đẹp'],
      featuredArticles: [1, 2, 3],
    },
    social: {
      instagram: 'https://instagram.com/lifestyle',
      facebook: 'https://facebook.com/lifestyle',
    },
  },
};

export function getDomainConfig(hostname: string): DomainConfig {
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

export function getAllDomains(): string[] {
  return Object.keys(domainConfigs);
} 