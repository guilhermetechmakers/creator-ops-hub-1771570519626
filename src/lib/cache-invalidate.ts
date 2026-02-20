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
 * Invalidates all caches that depend on content/research/files changes.
 * Use after content_editor, file_library, research, or publishing_queue mutations.
 */
export function invalidateDashboardRelatedCaches(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardCached })
  queryClient.invalidateQueries({ predicate: (q) => (q.queryKey[0] as string) === 'file-library' })
  queryClient.invalidateQueries({ predicate: (q) => (q.queryKey[0] as string) === 'content-studio' })
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.research })
  queryClient.invalidateQueries({ predicate: (q) => (q.queryKey[0] as string) === 'search' })
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
