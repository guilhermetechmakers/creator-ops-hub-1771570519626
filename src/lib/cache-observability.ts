import type { CacheObservabilityMeta } from '@/types/dashboard'

/** Max number of trace events to keep in memory for observability */
const MAX_TRACE_EVENTS = 100

export interface CacheTraceEvent {
  source: string
  cacheStatus: 'HIT' | 'MISS'
  requestId: string
  responseTimeMs: number
  timestamp: number
  cacheHitAt?: string
  cacheExpiresAt?: string
}

const traceEvents: CacheTraceEvent[] = []

/**
 * Collect cache metrics for observability.
 * Stores recent events for debugging; in production can be sent to APM.
 */
export function collectCacheMetrics(
  source: string,
  meta: CacheObservabilityMeta | undefined
): void {
  if (!meta) return

  const event: CacheTraceEvent = {
    source,
    cacheStatus: meta.cacheStatus,
    requestId: meta.requestId,
    responseTimeMs: meta.responseTimeMs,
    timestamp: Date.now(),
    ...(meta.cacheHitAt && { cacheHitAt: meta.cacheHitAt }),
    ...(meta.cacheExpiresAt && { cacheExpiresAt: meta.cacheExpiresAt }),
  }

  traceEvents.push(event)
  if (traceEvents.length > MAX_TRACE_EVENTS) {
    traceEvents.shift()
  }

  if (!import.meta.env.PROD) {
    // eslint-disable-next-line no-console
    console.debug(`[Cache] ${source}`, {
      status: meta.cacheStatus,
      requestId: meta.requestId,
      responseTimeMs: meta.responseTimeMs,
      ...(meta.cacheHitAt && { cacheHitAt: meta.cacheHitAt }),
      ...(meta.cacheExpiresAt && { cacheExpiresAt: meta.cacheExpiresAt }),
    })
  }
}

/**
 * Get recent cache trace events for observability/debugging.
 */
export function getCacheTraceEvents(): readonly CacheTraceEvent[] {
  return traceEvents
}

/**
 * Log cache metrics for observability (dev/debug).
 * In production, these could be sent to an analytics/APM service.
 */
export function logCacheMetrics(
  source: string,
  meta: CacheObservabilityMeta | undefined
): void {
  collectCacheMetrics(source, meta)
}

/**
 * Extract cache metadata from dashboard payload for display or logging.
 */
export function getCacheMeta(
  payload: { _meta?: CacheObservabilityMeta } | null | undefined
): CacheObservabilityMeta | undefined {
  return payload?._meta
}
