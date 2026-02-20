/**
 * Cache configuration for Performance & Caching strategy.
 * TTL values in seconds.
 *
 * Cache invalidation rules:
 * - content_editor CRUD -> invalidate dashboard, content-studio
 * - file_library CRUD -> invalidate dashboard, file-library
 * - research CRUD -> invalidate dashboard, research
 * - publishing_queue_logs CRUD -> invalidate dashboard
 * - google_integrations change -> invalidate dashboard (calendar, gmail)
 *
 * CDN: Use Cache-Tag headers for purging; max-age + stale-while-revalidate for freshness.
 * In-memory: Edge Function Map with TTL; periodic GC evicts expired entries.
 * Query/result: React Query staleTime + gcTime; Edge Function memory cache.
 */
export const CACHE_TTL = {
  /** Dashboard aggregated data - 60s stale, 5min GC */
  DASHBOARD_STALE: 60,
  DASHBOARD_GC: 5 * 60,
  /** Dashboard in-memory TTL (Edge Function) - 60s */
  DASHBOARD_MEMORY: 60,
  /** CDN max-age for dashboard response - 60s */
  DASHBOARD_CDN_MAX_AGE: 60,
  /** CDN stale-while-revalidate - 120s */
  DASHBOARD_CDN_SWR: 120,
  /** File library list - 30s */
  FILE_LIBRARY: 30,
  /** Content studio list - 30s */
  CONTENT_STUDIO: 30,
  /** Research hub - 60s (OpenClaw calls are expensive) */
  RESEARCH: 60,
  /** Global search - 2min */
  SEARCH: 120,
  /** Search in-memory TTL (Edge Function) */
  SEARCH_MEMORY: 120,
} as const

/** CDN cache tags for purge-by-tag invalidation (when CDN supports it) */
export const CACHE_TAGS = {
  DASHBOARD: 'dashboard',
  DASHBOARD_USER: (userId: string) => `dashboard:${userId}`,
  FILE_LIBRARY: 'file-library',
  CONTENT_STUDIO: 'content-studio',
  RESEARCH: 'research',
  SEARCH: 'search',
} as const

/** Memory cache GC interval (ms) - evict expired entries periodically */
export const CACHE_GC_INTERVAL_MS = 60_000

export const QUERY_KEYS = {
  dashboard: ['dashboard'] as const,
  dashboardCached: ['dashboard', 'cached'] as const,
  fileLibrary: (folderId?: string) => ['file-library', folderId] as const,
  contentStudio: (filters?: string) => ['content-studio', filters] as const,
  research: ['research'] as const,
  search: (q: string, types?: string) => ['search', q, types] as const,
  orderTransactionHistory: (params?: { page?: number; limit?: number; sortBy?: string; sortOrder?: string; status?: string; search?: string }) =>
    ['order-transaction-history', params] as const,
} as const

/** Scopes for cache invalidation - used by cache-invalidate Edge Function */
export const CACHE_INVALIDATION_SCOPES = [
  'dashboard',
  'file-library',
  'content-studio',
  'research',
  'search',
] as const

export type CacheInvalidationScope = (typeof CACHE_INVALIDATION_SCOPES)[number]

/** Observability header keys returned by Edge Functions */
export const CACHE_OBSERVABILITY_HEADERS = {
  CACHE_STATUS: 'x-cache-status',
  REQUEST_ID: 'x-request-id',
  RESPONSE_TIME_MS: 'x-response-time-ms',
  CACHE_HIT_AT: 'x-cache-hit-at',
  CACHE_EXPIRES_AT: 'x-cache-expires-at',
} as const
