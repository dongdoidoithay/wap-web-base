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
  // Since we removed the routes field, return empty array
  return [];
}

/**
 * Lấy route theo key
 */
export function getRouteByKey(config: DomainConfig, key: string): DynamicRoute | null {
  // Since we removed the routes field, return null
  return null;
}

/**
 * Lấy route theo path
 */
export function getRouteByPath(config: DomainConfig, path: string): DynamicRoute | null {
  // Since we removed the routes field, return null
  return null;
}

/**
 * Lấy API endpoint theo ngôn ngữ
 */
export function getApiByLanguage(config: DomainConfig, language: 'vi' | 'en'): string {
  // Since we removed the api field, return a default path based on language
  return language === 'vi' ? '/api/novel-vn' : '/api/manga-en';
}

/**
 * Lấy tất cả API endpoints
 */
export function getAllApiEndpoints(config: DomainConfig): ApiEndpoint[] {
  // Return empty array since we're removing the API endpoints display
  return [];
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
  // Since we removed the routes field, return empty array
  return [];
}

/**
 * Tạo navigation menu từ routes
 */
export function createNavigationMenu(config: DomainConfig, domain: string) {
  // Since we removed the routes field, return empty array
  return [];
}