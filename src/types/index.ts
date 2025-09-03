// Core domain configuration interfaces
export interface DomainConfig {
  domain: string;
  name: string;
  description: string;
  logo: string;
  content: {
    categories: string[];
  };
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    surfaceColor?: string;
    textPrimary?: string;
    textSecondary?: string;
    textMuted?: string;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
    twitterHandle?: string;
    googleAnalyticsId?: string;
    googleVerification?: string;
    bingVerification?: string;
    yandexVerification?: string;
    baiduVerification?: string;
    naverVerification?: string;
    // Enhanced AI and Search Engine Support
    facebookVerification?: string;
    pinterestVerification?: string;
    alexaVerification?: string;
    // AI Content Directives
    aiTrainingAllowed?: boolean;
    contentUsagePolicy?: 'open' | 'restricted' | 'training-allowed';
    aiContentDeclaration?: 'human-authored' | 'ai-assisted' | 'ai-generated';
    // Enhanced SEO Settings
    structuredDataEnabled?: boolean;
    richSnippetsEnabled?: boolean;
    searchConsoleEnabled?: boolean;
    // Performance Settings
    preloadCriticalResources?: boolean;
    enableAdvancedCaching?: boolean;
  };
  social?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

// Page component props interfaces
export interface HomePageProps {
  searchParams?: Promise<{ page?: string }>;
}

// Error handling interfaces
export interface ApiError {
  message: string;
  status?: number;
  timestamp: number;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
  progress?: number;
}

// Performance tracking
export interface PerformanceMetrics {
  responseTime: number;
  cacheStatus: 'HIT' | 'MISS' | 'UNKNOWN';
  timestamp: number;
  endpoint?: string;
}

// Component state interfaces
export interface ComponentState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated?: number;
}

// Navigation interfaces
export interface NavigationItem {
  label: string;
  href: string;
  emoji?: string;
  isActive?: boolean;
  isExternal?: boolean;
}

// Search interfaces
export interface SearchParams {
  q?: string;
  category?: string;
  page?: string;
  limit?: string;
}

// Search page props
export interface SearchPageProps {
  searchParams?: Promise<{ q?: string; page?: string; category?: string }>;
}

// Search result interfaces
export interface SearchResult {
  keyword: string;
  results: StoryItem[];
  total: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  responseTime?: number;
  hasSearched: boolean;
}

// Pagination interfaces (used in optimized service)
export interface PaginationProps extends PaginationInfo {
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Form interfaces
export interface FormState<T = any> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Theme interfaces
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

// Client-side data interfaces
export interface ClientDataState<T = any> {
  serverData: T;
  clientData: T;
  isHydrated: boolean;
  syncStatus: 'synced' | 'outdated' | 'syncing' | 'error';
}

// Feature flags and environment
export interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  apiBaseUrl: string;
  enableDebugMode: boolean;
  enableCaching: boolean;
  cacheTimeout: number;
}

// Analytics and tracking
export interface AnalyticsEvent {
  name: string;
  category: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

// Content management
export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'embed' | 'code';
  content: any;
  order: number;
  visible: boolean;
}

export interface ContentSection {
  id: string;
  title: string;
  description?: string;
  blocks: ContentBlock[];
  metadata?: Record<string, any>;
}

// Story interfaces
export interface StoryItem {
  idDoc: string;
  name: string;
  sortDesc?: string;
  image?: string;
  thumbnail?: string;
  url?: string;
  slug?: string;
  auth?: string;
  authName?: string;
  genres?: string;
  genresName?: string;
  status?: string;
  statusName?: string;
  views?: number;
  follows?: number;
  chapters?: number;
  lastChapter?: string;
  updatedAt?: string;
  createdAt?: string;
  date?: string;
}

export interface StoryDetail extends StoryItem {
  description?: string;
  content?: string;
  rating?: number;
  tags?: string[];
  chapterList?: Chapter[];
  relatedStories?: StoryItem[];
}

export interface Chapter {
  id: string;
  name: string;
  slug?: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
  views?: number;
  order?: number;
}

// Authentication interfaces
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  role?: 'user' | 'admin' | 'moderator';
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthFormState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

export interface PasswordResetToken {
  token: string;
  email: string;
  expiresAt: string;
  isUsed: boolean;
}

export interface EmailVerificationToken {
  token: string;
  email: string;
  expiresAt: string;
  isUsed: boolean;
}

// Reading History interfaces for local storage
export interface ReadingHistoryItem {
  idDoc: string;
  idDetail: string;
  storyName: string;
  chapterName: string;
  currentChapterIndex: number;
  totalChapters: number;
  lastReadAt: string;
  storyImage?: string;
  storyAuthor?: string;
  storyGenres?: string;
  chapterDate?: string;
  storyUrl: string;
  chapterUrl: string;
  type?: string; // Add type field for filtering by content type
  apiPath?: string; // Add apiPath field for filtering by API path
}

export interface ReadingHistoryState {
  items: ReadingHistoryItem[];
  loading: boolean;
  error: string | null;
}

export interface ReadingHistoryManager {
  getHistory: () => ReadingHistoryItem[];
  addOrUpdateHistory: (item: ReadingHistoryItem) => void;
  removeFromHistory: (idDoc: string) => void;
  clearHistory: () => void;
  getStoryHistory: (idDoc: string) => ReadingHistoryItem | null;
  getRecentStories: (limit?: number) => ReadingHistoryItem[];
  getHistoryByType: (type: string) => ReadingHistoryItem[]; // Add method to filter by type
  getHistoryByApiPath: (apiPath: string) => ReadingHistoryItem[]; // Add method to filter by API path
}
