import { supabase } from '@/lib/supabase'
import type { GlobalSearchResult, GlobalSearchParams } from '@/types/search'

export interface GlobalSearchResponse {
  results: GlobalSearchResult[]
}

/**
 * Fetches global search results from the cached Edge Function.
 * Results are cached in-memory on the Edge Function (TTL: 120s).
 */
export async function fetchGlobalSearch(
  params: GlobalSearchParams,
  options?: { bypassCache?: boolean }
): Promise<GlobalSearchResponse> {
  const { data: session } = await supabase.auth.getSession()
  if (!session?.session?.access_token) {
    return { results: [] }
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${session.session.access_token}`,
  }
  if (options?.bypassCache) {
    headers['x-cache-bypass'] = 'true'
  }

  const { data, error } = await supabase.functions.invoke('global-search', {
    body: params,
    headers,
  })

  if (error) {
    throw new Error(error.message ?? 'Search failed')
  }

  return {
    results: data?.results ?? [],
  }
}
