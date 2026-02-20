import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

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

export function useDashboardData() {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [gmailThreads, setGmailThreads] = useState<GmailThread[]>([])
  const [googleConnected, setGoogleConnected] = useState(false)
  const [loadingCalendar, setLoadingCalendar] = useState(false)
  const [loadingGmail, setLoadingGmail] = useState(false)

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

  useEffect(() => {
    fetchCalendar()
    fetchGmail()
  }, [fetchCalendar, fetchGmail])

  return {
    calendarEvents,
    gmailThreads,
    googleConnected,
    loadingCalendar,
    loadingGmail,
    refetch: () => {
      fetchCalendar()
      fetchGmail()
    },
  }
}
