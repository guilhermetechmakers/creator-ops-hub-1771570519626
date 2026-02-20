# Performance & Caching Strategy

This document describes the comprehensive caching strategy for Creator Ops Hub, covering CDN, in-memory cache, query/result caching, invalidation rules, TTL policies, and observability.

## Overview

The caching strategy improves UI responsiveness, reduces redundant OpenClaw/AI research calls, and optimizes search/indexing operations across the File Library, Content Studio, and Research Hub.

## Cache Layers

### 1. CDN Cache

- **Location**: Edge (via Cache-Control headers)
- **Headers**: `max-age`, `stale-while-revalidate`, `Cache-Tag`
- **Dashboard**: `max-age=60`, `stale-while-revalidate=120`
- **Search**: `max-age=60`, `stale-while-revalidate=120`
- **Purge**: Use Cache-Tag headers when CDN supports tag-based invalidation

### 2. In-Memory Cache (Edge Functions)

- **Location**: Supabase Edge Functions (`dashboard-cached`, `global-search`)
- **Storage**: `Map<string, CacheEntry>` per function instance
- **TTL**: Dashboard 60s, Search 120s
- **GC**: Expired entries evicted on each request via `runCacheGC()`
- **Bypass**: Send `x-cache-bypass: true` header to force fresh fetch

### 3. Query/Result Cache (React Query)

- **Location**: Client-side
- **Dashboard**: `staleTime: 60s`, `gcTime: 5min`
- **Search**: Results cached per query key
- **Invalidation**: Automatic on mutations via `invalidateDashboardRelatedCaches()`

## TTL Policies

| Resource        | Stale (s) | GC (s) | In-Memory (s) | CDN max-age |
|----------------|-----------|--------|---------------|-------------|
| Dashboard      | 60        | 300    | 60            | 60          |
| File Library   | 30        | -      | -             | -           |
| Content Studio | 30        | -      | -             | -           |
| Research       | 60        | -      | -             | -           |
| Search         | 120       | -      | 120           | 60          |

## Cache Invalidation Rules

| Trigger                         | Invalidates                                      |
|---------------------------------|--------------------------------------------------|
| content_editor CRUD             | dashboard, content-studio, search                |
| file_library CRUD               | dashboard, file-library, search                   |
| research CRUD                   | dashboard, research, search                      |
| publishing_queue_logs CRUD      | dashboard                                        |
| google_integrations change     | dashboard (calendar, gmail)                       |

### Client-Side Invalidation

Call `invalidateDashboardRelatedCaches(queryClient, { bypassEdgeCache: true })` after mutations. When the dashboard is visible, this triggers a fresh fetch with `x-cache-bypass` to invalidate the Edge Function cache.

### Server-Side Invalidation

The `cache-invalidate` Edge Function acknowledges invalidation requests. Use it from database triggers or other Edge Functions for observability. In-memory cache cannot be invalidated cross-instance; clients should use `x-cache-bypass` on next request.

## Observability

### Headers (from Edge Functions)

- `x-cache-status`: `HIT` or `MISS`
- `x-request-id`: Unique request trace ID
- `x-response-time-ms`: Response time in milliseconds
- `x-cache-hit-at`: ISO timestamp when cache was populated (HIT only)
- `x-cache-expires-at`: ISO timestamp when cache expires (HIT only)

### Client-Side Metrics

- `logCacheMetrics()` / `collectCacheMetrics()`: Log and collect trace events
- `getCacheTraceEvents()`: Retrieve recent events for debugging
- Dashboard displays cache status badge (Cached/Fresh) with response time

### Trace Events

Recent cache events (up to 100) are stored in memory for debugging. In production, these can be sent to an APM service.

## File Structure

```
src/
  lib/
    cache-config.ts      # TTL, tags, query keys, invalidation scopes
    cache-invalidate.ts  # Client-side invalidation helpers
    cache-observability.ts # Metrics, traces, logging
  api/
    dashboard-cached.ts  # Dashboard fetch with cache bypass option
  hooks/
    use-dashboard-data.ts # React Query + cache observability

supabase/functions/
  dashboard-cached/      # Dashboard aggregation + in-memory cache
  global-search/         # Search + in-memory cache
  cache-invalidate/     # Invalidation acknowledgment
```

## Usage

### Fetching with Cache Bypass

```ts
import { fetchDashboardCached } from '@/api/dashboard-cached'

// Normal fetch (uses cache)
const data = await fetchDashboardCached()

// Bypass cache (fresh data)
const fresh = await fetchDashboardCached({ bypassCache: true })
```

### Invalidating After Mutations

```ts
import { useQueryClient } from '@tanstack/react-query'
import { invalidateDashboardRelatedCaches } from '@/lib/cache-invalidate'

const queryClient = useQueryClient()
// After create/update/delete in content, files, or research:
invalidateDashboardRelatedCaches(queryClient, { bypassEdgeCache: true })
```

### Observing Cache Metrics

```ts
import { getCacheTraceEvents } from '@/lib/cache-observability'

const events = getCacheTraceEvents()
// Send to APM or display in debug panel
```
