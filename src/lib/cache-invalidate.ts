import type { QueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from './cache-config'
import { fetchDashboardCached } from '@/api/dashboard-cached'

/**
 * Invalidates dashboard cache after mutations (content, files, research).
 * Call after create/update/delete in Content Studio, File Library, Research Hub.
 */
export function invalidateDashboardCache(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardCached })
}

/**
 * Invalidates all caches that depend on content/research/files changes.
 * Use after content_editor, file_library, research, or publishing_queue mutations.
 *
 * When options.bypassEdgeCache is true and the dashboard is currently visible,
 * triggers a fresh fetch with x-cache-bypass to invalidate the Edge Function
 * in-memory cache, ensuring the next view shows up-to-date data.
 */
export function invalidateDashboardRelatedCaches(
  queryClient: QueryClient,
  options?: { bypassEdgeCache?: boolean }
): void {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardCached })
  queryClient.invalidateQueries({ predicate: (q) => (q.queryKey[0] as string) === 'file-library' })
  queryClient.invalidateQueries({ predicate: (q) => (q.queryKey[0] as string) === 'content-studio' })
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.research })
  queryClient.invalidateQueries({ predicate: (q) => (q.queryKey[0] as string) === 'search' })

  if (options?.bypassEdgeCache) {
    const query = queryClient.getQueryCache().find({ queryKey: QUERY_KEYS.dashboardCached })
    if (query && query.getObserversCount() > 0) {
      void queryClient.fetchQuery({
        queryKey: QUERY_KEYS.dashboardCached,
        queryFn: () => fetchDashboardCached({ bypassCache: true }),
      })
    }
  }
}

/**
 * Invalidates file library cache.
 */
export function invalidateFileLibraryCache(
  queryClient: QueryClient,
  folderId?: string
): void {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fileLibrary(folderId) })
}

/**
 * Invalidates content studio cache.
 */
export function invalidateContentStudioCache(
  queryClient: QueryClient,
  filters?: string
): void {
  queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.contentStudio(filters),
  })
}

/**
 * Invalidates research cache.
 */
export function invalidateResearchCache(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.research })
}
