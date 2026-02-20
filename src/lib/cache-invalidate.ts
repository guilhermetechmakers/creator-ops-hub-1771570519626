import type { QueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from './cache-config'

/**
 * Invalidates dashboard cache after mutations (content, files, research).
 * Call after create/update/delete in Content Studio, File Library, Research Hub.
 */
export function invalidateDashboardCache(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardCached })
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
