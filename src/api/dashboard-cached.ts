import { supabase } from '@/lib/supabase'
import type { DashboardCachedPayload } from '@/types/dashboard'

/**
 * Fetches dashboard data from the cached Edge Function.
 * Uses CDN + in-memory cache on server; client benefits from Cache-Control headers.
 */
export async function fetchDashboardCached(options?: {
  bypassCache?: boolean
}): Promise<DashboardCachedPayload> {
  const { data: session } = await supabase.auth.getSession()
  if (!session?.session?.access_token) {
    throw new Error('Not authenticated')
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${session.session.access_token}`,
  }
  if (options?.bypassCache) {
    headers['x-cache-bypass'] = 'true'
  }

  const { data, error } = await supabase.functions.invoke('dashboard-cached', {
    headers,
  })

  if (error) {
    throw new Error(error.message ?? 'Failed to fetch dashboard')
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Invalid dashboard response')
  }

  if ('error' in data && data.error) {
    throw new Error(String(data.error))
  }

  return data as DashboardCachedPayload
}
