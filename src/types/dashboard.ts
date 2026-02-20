export interface Dashboard {
  id: string
  user_id: string
  title: string
  description?: string
  status: string
  created_at: string
  updated_at: string
}

export interface ResearchSummary {
  id: string
  title: string
  time: string
  score: number
}

/** Cache observability metadata from Edge Function responses */
export interface CacheObservabilityMeta {
  cacheStatus: 'HIT' | 'MISS'
  requestId: string
  responseTimeMs: number
  cacheHitAt?: string
  cacheExpiresAt?: string
}

/** Payload from dashboard-cached Edge Function */
export interface DashboardCachedPayload {
  calendarEvents: Array<{ id: string; summary: string; start: string; end: string }>
  gmailThreads: Array<{ id: string; snippet: string }>
  scheduledPosts: Array<{
    id: string
    title: string
    scheduledTime?: string
    dueDate?: string
    platform?: string
    channel?: string
    status: string
  }>
  recentAssets: Array<{ id: string; title: string; file_type?: string; updated_at: string }>
  researchSummaries: ResearchSummary[]
  googleConnected: boolean
  cachedAt: string
  /** Observability metadata (metrics, traces) - present when available */
  _meta?: CacheObservabilityMeta
}
