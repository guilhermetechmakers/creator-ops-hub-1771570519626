import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type {
  PublishingQueueLog,
  PublishingQueueFilters,
} from '@/types/publishing-queue'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''

export function usePublishingQueue(filters: PublishingQueueFilters) {
  const [jobs, setJobs] = useState<PublishingQueueLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJobs = useCallback(async () => {
    if (!SUPABASE_URL) {
      setJobs([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setJobs([])
        setLoading(false)
        return
      }
      let query = supabase
        .from('publishing_queue_logs')
        .select('*')
        .order('scheduled_time', { ascending: false, nullsFirst: false })
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      if (filters.platform && filters.platform !== 'all') {
        query = query.eq('platform', filters.platform)
      }
      if (filters.dateFrom) {
        query = query.gte('scheduled_time', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('scheduled_time', filters.dateTo + 'T23:59:59.999Z')
      }
      const { data, error: err } = await query
      if (err) throw err
      setJobs((data ?? []) as PublishingQueueLog[])
    } catch (err) {
      setError((err as Error).message)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [
    filters.status,
    filters.platform,
    filters.dateFrom,
    filters.dateTo,
  ])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  return { jobs, loading, error, refetch: fetchJobs }
}
