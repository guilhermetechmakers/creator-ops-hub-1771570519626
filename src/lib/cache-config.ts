/**
 * Cache configuration for Performance & Caching strategy.
 * TTL values in seconds.
 */
export const CACHE_TTL = {
  /** Dashboard aggregated data - 60s stale, 5min cache */
  DASHBOARD_STALE: 60,
  DASHBOARD_GC: 5 * 60,
  /** File library list - 30s */
  FILE_LIBRARY: 30,
  /** Content studio list - 30s */
  CONTENT_STUDIO: 30,
  /** Research hub - 60s (OpenClaw calls are expensive) */
  RESEARCH: 60,
  /** Global search - 2min */
  SEARCH: 120,
} as const

export const QUERY_KEYS = {
  dashboard: ['dashboard'] as const,
  dashboardCached: ['dashboard', 'cached'] as const,
  fileLibrary: (folderId?: string) => ['file-library', folderId] as const,
  contentStudio: (filters?: string) => ['content-studio', filters] as const,
  research: ['research'] as const,
  search: (q: string, types?: string) => ['search', q, types] as const,
  orderTransactionHistory: (params?: { page?: number; limit?: number; sortBy?: string; sortOrder?: string; status?: string }) =>
    ['order-transaction-history', params] as const,
} as const
