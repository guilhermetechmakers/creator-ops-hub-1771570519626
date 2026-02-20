import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { ResearchSummary } from '@/types/dashboard'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''

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

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export function useDashboardData() {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [gmailThreads, setGmailThreads] = useState<GmailThread[]>([])
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [recentAssets, setRecentAssets] = useState<RecentAsset[]>([])
  const [researchSummaries, setResearchSummaries] = useState<ResearchSummary[]>([])
  const [googleConnected, setGoogleConnected] = useState(false)
  const [loadingCalendar, setLoadingCalendar] = useState(false)
  const [loadingGmail, setLoadingGmail] = useState(false)
  const [loadingScheduled, setLoadingScheduled] = useState(false)
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [loadingResearch, setLoadingResearch] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  const fetchScheduledPosts = useCallback(async () => {
    setLoadingScheduled(true)
    try {
      const now = new Date().toISOString()
      const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

      const [contentRes, queueRes] = await Promise.all([
        supabase
          .from('content_editor')
          .select('id, title, due_date, channel, status')
          .in('status', ['scheduled', 'review'])
          .gte('due_date', now)
          .lte('due_date', weekFromNow)
          .order('due_date', { ascending: true })
          .limit(5),
        supabase
          .from('publishing_queue_logs')
          .select('id, title, scheduled_time, platform, status')
          .eq('status', 'queued')
          .gte('scheduled_time', now)
          .order('scheduled_time', { ascending: true })
          .limit(5),
      ])

      const posts: ScheduledPost[] = []
      if (contentRes.data) {
        posts.push(
          ...contentRes.data.map((r) => ({
            id: r.id,
            title: r.title ?? '',
            dueDate: r.due_date,
            channel: r.channel,
            status: r.status ?? '',
          }))
        )
      }
      if (queueRes.data) {
        posts.push(
          ...queueRes.data.map((r) => ({
            id: r.id,
            title: r.title ?? '',
            scheduledTime: r.scheduled_time,
            platform: r.platform,
            status: r.status ?? '',
          }))
        )
      }
      posts.sort((a, b) => {
        const aTime = (a.scheduledTime ?? a.dueDate) ?? ''
        const bTime = (b.scheduledTime ?? b.dueDate) ?? ''
        return aTime.localeCompare(bTime)
      })
      setScheduledPosts(posts.slice(0, 8))
    } catch (e) {
      setScheduledPosts([])
      setHasError(true)
      setErrorMessage((e as Error).message || 'Failed to load scheduled posts')
    } finally {
      setLoadingScheduled(false)
    }
  }, [])

  const fetchRecentAssets = useCallback(async () => {
    setLoadingAssets(true)
    try {
      const { data } = await supabase
        .from('file_library')
        .select('id, title, file_type, updated_at')
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(6)

      setRecentAssets(
        (data ?? []).map((r) => ({
          id: r.id,
          title: r.title ?? '',
          file_type: r.file_type,
          updated_at: r.updated_at ?? '',
        }))
      )
    } catch (e) {
      setRecentAssets([])
      setHasError(true)
      setErrorMessage((prev) => prev || (e as Error).message || 'Failed to load assets')
    } finally {
      setLoadingAssets(false)
    }
  }, [])

  const fetchCalendar = useCallback(async () => {
    if (!SUPABASE_URL) return
    setLoadingCalendar(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setLoadingCalendar(false)
        return
      }
      const { data } = await supabase.functions.invoke('get-calendar-events', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (data?.events) {
        setCalendarEvents(data.events)
      }
      if (data?.connected !== undefined) {
        setGoogleConnected(data.connected)
      }
    } catch {
      // Silent fail for optional integration
    } finally {
      setLoadingCalendar(false)
    }
  }, [])

  const fetchGmail = useCallback(async () => {
    if (!SUPABASE_URL) return
    setLoadingGmail(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setLoadingGmail(false)
        return
      }
      const { data } = await supabase.functions.invoke('get-gmail-threads', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (data?.threads) {
        setGmailThreads(data.threads)
      }
      if (data?.connected !== undefined) {
        setGoogleConnected((prev) => prev || data.connected)
      }
    } catch {
      // Silent fail
    } finally {
      setLoadingGmail(false)
    }
  }, [])

  const fetchResearchSummaries = useCallback(async () => {
    setLoadingResearch(true)
    try {
      const { data } = await supabase
        .from('research')
        .select('id, title, updated_at')
        .order('updated_at', { ascending: false })
        .limit(5)

      if (data && Array.isArray(data)) {
        setResearchSummaries(
          data.map((r) => ({
            id: r.id,
            title: r.title ?? 'Untitled',
            time: formatTimeAgo(r.updated_at ?? new Date().toISOString()),
            score: 85,
          }))
        )
      } else {
        setResearchSummaries([])
      }
    } catch (e) {
      setResearchSummaries([])
      setHasError(true)
      setErrorMessage((prev) => prev || (e as Error).message || 'Failed to load research')
    } finally {
      setLoadingResearch(false)
    }
  }, [])

  const refetch = useCallback(() => {
    setHasError(false)
    setErrorMessage(undefined)
    fetchCalendar()
    fetchGmail()
    fetchScheduledPosts()
    fetchRecentAssets()
    fetchResearchSummaries()
  }, [fetchCalendar, fetchGmail, fetchScheduledPosts, fetchRecentAssets, fetchResearchSummaries])

  useEffect(() => {
    refetch()
  }, [refetch])

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
    hasError,
    errorMessage,
    refetch,
  }
}
