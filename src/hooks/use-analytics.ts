import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { AnalyticsData, AnalyticsFilters } from '@/types/analytics'

function getDefaultDateRange(): { dateFrom: string; dateTo: string } {
  const now = new Date()
  const dateTo = now.toISOString().slice(0, 10)
  const dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  return { dateFrom, dateTo }
}

export function useAnalytics(initialFilters?: AnalyticsFilters) {
  const { dateFrom, dateTo } = getDefaultDateRange()
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateFrom: initialFilters?.dateFrom ?? dateFrom,
    dateTo: initialFilters?.dateTo ?? dateTo,
    channel: initialFilters?.channel ?? 'all',
  })
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async (): Promise<{ success: boolean }> => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setData(null)
        setIsLoading(false)
        return { success: false }
      }
      const { data: result, error: fnError } = await supabase.functions.invoke('get-analytics', {
        body: filters,
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (fnError) {
        setError(fnError.message ?? 'Failed to load analytics')
        setData(null)
        return { success: false }
      }
      if (result?.error) {
        setError(result.error)
        setData(null)
        return { success: false }
      }
      setData({
        overview: result.overview ?? {
          impressions: 0,
          engagement: 0,
          topPostsCount: 0,
          followerGrowth: 0,
        },
        chartData: result.chartData ?? [],
        topPosts: result.topPosts ?? [],
      })
      return { success: true }
    } catch (err) {
      setError((err as Error).message ?? 'An error occurred')
      setData(null)
      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }, [filters.dateFrom, filters.dateTo, filters.channel])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const updateFilters = useCallback((newFilters: Partial<AnalyticsFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  return {
    data,
    filters,
    updateFilters,
    isLoading,
    error,
    refetch: fetchAnalytics,
  }
}
