import { DomainConfig } from './domain-config';

export interface DynamicRoute {
  key: string;
  path: string;
  api: string;
  language: 'vi' | 'en';
  title: string;
  description: string;
}

export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  language: 'vi' | 'en';
}

/**
 * Lấy tất cả routes từ domain config
 */
export function getDomainRoutes(config: DomainConfig): DynamicRoute[] {
  return Object.entries(config.routes).map(([key, route]) => ({
    key,
    ...route,
  }));
}

/**
 * Lấy route theo key
 */
export function getRouteByKey(config: DomainConfig, key: string): DynamicRoute | null {
  const route = config.routes[key];
  if (!route) return null;
  
  return {
    key,
    ...route,
  };
}

/**
 * Lấy route theo path
 */
export function getRouteByPath(config: DomainConfig, path: string): DynamicRoute | null {
  const route = Object.entries(config.routes).find(([_, routeConfig]) => 
    routeConfig.path === path
  );
  
  if (!route) return null;
  
  return {
    key: route[0],
    ...route[1],
  };
}

/**
 * Lấy API endpoint theo ngôn ngữ
 */
export function getApiByLanguage(config: DomainConfig, language: 'vi' | 'en'): string {
  return language === 'vi' ? config.api.vietnamese : config.api.english;
}

/**
 * Lấy tất cả API endpoints
 */
export function getAllApiEndpoints(config: DomainConfig): ApiEndpoint[] {
  const endpoints: ApiEndpoint[] = [];
  
  // API tiếng Việt
  endpoints.push({
    path: `${config.api.vietnamese}/manga`,
    method: 'GET',
    description: 'Lấy danh sách manga tiếng Việt',
    language: 'vi',
  });
  
  endpoints.push({
    path: `${config.api.vietnamese}/manga/[id]`,
    method: 'GET',
    description: 'Lấy chi tiết manga tiếng Việt',
    language: 'vi',
  });
  
  endpoints.push({
    path: `${config.api.vietnamese}/manga/[id]/chapters`,
    method: 'GET',
    description: 'Lấy danh sách chương manga tiếng Việt',
    language: 'vi',
  });
  
  // API tiếng Anh
  endpoints.push({
    path: `${config.api.english}/manga`,
    method: 'GET',
    description: 'Get English manga list',
    language: 'en',
  });
  
  endpoints.push({
    path: `${config.api.english}/manga/[id]`,
    method: 'GET',
    description: 'Get English manga details',
    language: 'en',
  });
  
  endpoints.push({
    path: `${config.api.english}/manga/[id]/chapters`,
    method: 'GET',
    description: 'Get English manga chapters',
    language: 'en',
  });
  
  // API chung
  endpoints.push({
    path: config.api.search,
    method: 'GET',
    description: 'Tìm kiếm manga/truyện',
    language: 'vi',
  });
  
  endpoints.push({
    path: config.api.auth,
    method: 'POST',
    description: 'Xác thực người dùng',
    language: 'vi',
  });
  
  return endpoints;
}

/**
 * Tạo URL cho route cụ thể
 */
export function createRouteUrl(domain: string, routeKey: string, params?: Record<string, string>): string {
  const baseUrl = `/${domain}/${routeKey}`;
  
  if (!params) return baseUrl;
  
  const queryString = new URLSearchParams(params).toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Tạo API URL
 */
export function createApiUrl(apiBase: string, endpoint: string, params?: Record<string, string>): string {
  let url = `${apiBase}${endpoint}`;
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`[${key}]`, value);
    });
  }
  
  return url;
}

/**
 * Kiểm tra xem route có phải là ngôn ngữ cụ thể không
 */
export function isRouteLanguage(route: DynamicRoute, language: 'vi' | 'en'): boolean {
  return route.language === language;
}

/**
 * Lấy routes theo ngôn ngữ
 */
export function getRoutesByLanguage(config: DomainConfig, language: 'vi' | 'en'): DynamicRoute[] {
  return getDomainRoutes(config).filter(route => 
    isRouteLanguage(route, language)
  );
}

/**
 * Tạo navigation menu từ routes
 */
export function createNavigationMenu(config: DomainConfig, domain: string) {
  const routes = getDomainRoutes(config);
  
  return routes.map(route => ({
    key: route.key,
    href: `/${domain}/${route.path}`,
    title: route.title,
    description: route.description,
    language: route.language,
  }));
}
