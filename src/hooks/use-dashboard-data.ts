import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchDashboardCached } from '@/api/dashboard-cached'
import { QUERY_KEYS, CACHE_TTL } from '@/lib/cache-config'
import type { ResearchSummary } from '@/types/dashboard'

export interface CalendarEvent {
  id: string
  summary: string
  start: string
  end: string
}

export interface GmailThread {
  id: string
  snippet: string
}

export interface ScheduledPost {
  id: string
  title: string
  scheduledTime?: string
  dueDate?: string
  platform?: string
  channel?: string
  status: string
}

export interface RecentAsset {
  id: string
  title: string
  file_type?: string
  updated_at: string
}

export function useDashboardData() {
  const queryClient = useQueryClient()
  const {
    data,
    isLoading,
    isError,
    error,
    refetch: baseRefetch,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.dashboardCached,
    queryFn: () => fetchDashboardCached(),
    staleTime: CACHE_TTL.DASHBOARD_STALE * 1000,
    gcTime: CACHE_TTL.DASHBOARD_GC * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const refetch = useCallback(
    (bypassCache?: boolean) => {
      if (bypassCache) {
        return queryClient.fetchQuery({
          queryKey: QUERY_KEYS.dashboardCached,
          queryFn: () => fetchDashboardCached({ bypassCache: true }),
        })
      }
      return baseRefetch()
    },
    [queryClient, baseRefetch]
  )

  const calendarEvents = data?.calendarEvents ?? []
  const gmailThreads = data?.gmailThreads ?? []
  const scheduledPosts = data?.scheduledPosts ?? []
  const recentAssets = data?.recentAssets ?? []
  const researchSummaries: ResearchSummary[] = data?.researchSummaries ?? []
  const googleConnected = data?.googleConnected ?? false

  const loadingCalendar = isLoading
  const loadingGmail = isLoading
  const loadingScheduled = isLoading
  const loadingAssets = isLoading
  const loadingResearch = isLoading

  return {
    calendarEvents,
    gmailThreads,
    scheduledPosts,
    recentAssets,
    researchSummaries,
    googleConnected,
    loadingCalendar,
    loadingGmail,
    loadingScheduled,
    loadingAssets,
    loadingResearch,
    hasError: isError,
    errorMessage: error instanceof Error ? error.message : undefined,
    refetch,
    isRefetching: isFetching,
  }
}
