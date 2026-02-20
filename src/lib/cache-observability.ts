import type { CacheObservabilityMeta } from '@/types/dashboard'

/**
 * Log cache metrics for observability (dev/debug).
 * In production, these could be sent to an analytics/APM service.
 */
export function logCacheMetrics(
  source: string,
  meta: CacheObservabilityMeta | undefined
): void {
  if (!meta || import.meta.env.PROD) return
  // eslint-disable-next-line no-console
  console.debug(`[Cache] ${source}`, {
    status: meta.cacheStatus,
    requestId: meta.requestId,
    responseTimeMs: meta.responseTimeMs,
    ...(meta.cacheHitAt && { cacheHitAt: meta.cacheHitAt }),
    ...(meta.cacheExpiresAt && { cacheExpiresAt: meta.cacheExpiresAt }),
  })
}

/**
 * Extract cache metadata from dashboard payload for display or logging.
 */
export function getCacheMeta(
  payload: { _meta?: CacheObservabilityMeta } | null | undefined
): CacheObservabilityMeta | undefined {
  return payload?._meta
}
