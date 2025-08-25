import { getDomainConfigSync } from './domain-config';

export interface DomainRoute {
  domain: string;
  path: string;
  fullPath: string;
  config: any;
}

/**
 * Xử lý routing cho multi-domain
 */
export function parseDomainRoute(hostname: string, pathname: string): DomainRoute | null {
  const domain = hostname.replace(/:\d+$/, '').toLowerCase();
  const config = getDomainConfigSync(domain);
  
  if (!config) {
    return null;
  }

  return {
    domain,
    path: pathname,
    fullPath: `/${domain}${pathname}`,
    config
  };
}

/**
 * Tạo URL cho domain cụ thể
 */
export function createDomainUrl(domain: string, path: string = ''): string {
  return `/${domain}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Kiểm tra xem path có phải là domain route không
 */
export function isDomainRoute(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean);
  return segments.length > 0 && !pathname.startsWith('/api');
}

/**
 * Lấy domain từ path
 */
export function getDomainFromPath(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  return segments.length > 0 ? segments[0] : null;
}

/**
 * Lấy path tương đối (không bao gồm domain)
 */
export function getRelativePath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length <= 1) return '/';
  return `/${segments.slice(1).join('/')}`;
}

/**
 * Tạo breadcrumb cho domain route
 */
export function createDomainBreadcrumb(domain: string, path: string) {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs = [
    { name: 'Trang chủ', href: `/${domain}` }
  ];

  let currentPath = '';
  segments.forEach((segment, index) => {
    if (index === 0) return; // Bỏ qua domain segment
    
    currentPath += `/${segment}`;
    breadcrumbs.push({
      name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      href: `/${domain}${currentPath}`
    });
  });

  return breadcrumbs;
}

/**
 * Kiểm tra xem có phải là truyện tiếng Việt không
 */
export function isVietnameseStory(path: string): boolean {
  return path.includes('/doc-truyen/');
}

/**
 * Kiểm tra xem có phải là manga tiếng Anh không
 */
export function isEnglishManga(path: string): boolean {
  return path.includes('/read-manga/');
}

/**
 * Lấy ngôn ngữ dựa trên path
 */
export function getLanguageFromPath(path: string): 'vi' | 'en' {
  if (isVietnameseStory(path)) return 'vi';
  if (isEnglishManga(path)) return 'en';
  return 'vi'; // Default
}
