import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cache-bypass',
}

/** TTL in seconds for dashboard cache (in-memory) */
const DASHBOARD_CACHE_TTL = 60
/** CDN cache max-age (seconds) - allows CDN to cache response */
const CDN_CACHE_MAX_AGE = 60
/** Stale-while-revalidate - serve stale up to 120s while revalidating */
const CDN_STALE_WHILE_REVALIDATE = 120

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const memoryCache = new Map<string, CacheEntry<DashboardPayload>>()

interface DashboardPayload {
  calendarEvents: CalendarEvent[]
  gmailThreads: GmailThread[]
  scheduledPosts: ScheduledPost[]
  recentAssets: RecentAsset[]
  researchSummaries: ResearchSummary[]
  googleConnected: boolean
  cachedAt: string
}

interface CalendarEvent {
  id: string
  summary: string
  start: string
  end: string
}

interface GmailThread {
  id: string
  snippet: string
}

interface ScheduledPost {
  id: string
  title: string
  scheduledTime?: string
  dueDate?: string
  platform?: string
  channel?: string
  status: string
}

interface RecentAsset {
  id: string
  title: string
  file_type?: string
  updated_at: string
}

interface ResearchSummary {
  id: string
  title: string
  time: string
  score: number
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

async function fetchCalendarEvents(
  supabase: ReturnType<typeof createClient>,
  adminClient: ReturnType<typeof createClient>,
  userId: string
): Promise<{ events: CalendarEvent[]; connected: boolean }> {
  try {
    const { data: integration } = await adminClient
      .from('google_integrations')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single()

    if (!integration?.access_token) {
      return { events: [], connected: false }
    }

    const expiresAt = integration.expires_at ? new Date(integration.expires_at).getTime() : 0
    const now = Date.now()
    let accessToken = integration.access_token

    if (expiresAt < now + 60000 && integration.refresh_token) {
      const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')
      const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')
      if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            refresh_token: integration.refresh_token,
            grant_type: 'refresh_token',
          }),
        })
        if (tokenRes.ok) {
          const tokens = await tokenRes.json()
          accessToken = tokens.access_token
        }
      }
    }

    const timeMin = new Date().toISOString()
    const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&` +
        `singleEvents=true&orderBy=startTime&maxResults=10`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (!res.ok) return { events: [], connected: true }
    const data = await res.json()
    const events: CalendarEvent[] = (data.items ?? []).map(
      (e: { id: string; summary?: string; start?: { dateTime?: string; date?: string }; end?: { dateTime?: string; date?: string } }) => ({
        id: e.id,
        summary: e.summary ?? 'No title',
        start: e.start?.dateTime ?? e.start?.date ?? '',
        end: e.end?.dateTime ?? e.end?.date ?? '',
      })
    )
    return { events, connected: true }
  } catch {
    return { events: [], connected: false }
  }
}

async function fetchGmailThreads(
  adminClient: ReturnType<typeof createClient>,
  userId: string
): Promise<{ threads: GmailThread[]; connected: boolean }> {
  try {
    const { data: integration } = await adminClient
      .from('google_integrations')
      .select('access_token')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single()

    if (!integration?.access_token) {
      return { threads: [], connected: false }
    }

    const res = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/threads?q=is:starred&maxResults=5',
      { headers: { Authorization: `Bearer ${integration.access_token}` } }
    )

    if (!res.ok) return { threads: [], connected: true }
    const data = await res.json()
    const threads: GmailThread[] = (data.threads ?? []).slice(0, 5).map(
      (t: { id: string }) => ({ id: t.id, snippet: '' })
    )
    return { threads, connected: true }
  } catch {
    return { threads: [], connected: false }
  }
}

async function buildDashboardPayload(
  supabase: ReturnType<typeof createClient>,
  adminClient: ReturnType<typeof createClient>,
  userId: string
): Promise<DashboardPayload> {
  const now = new Date().toISOString()
  const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const [calendarRes, gmailRes, contentRes, queueRes, assetsRes, researchRes] = await Promise.all([
    fetchCalendarEvents(supabase, adminClient, userId),
    fetchGmailThreads(adminClient, userId),
    supabase
      .from('content_editor')
      .select('id, title, due_date, channel, status')
      .eq('user_id', userId)
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
    supabase
      .from('file_library')
      .select('id, title, file_type, updated_at')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(6),
    supabase
      .from('research')
      .select('id, title, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5),
  ])

  const scheduledPosts: ScheduledPost[] = []
  if (contentRes.data) {
    scheduledPosts.push(
      ...contentRes.data.map((r: { id: string; title: string | null; due_date: string | null; channel: string | null; status: string | null }) => ({
        id: r.id,
        title: r.title ?? '',
        dueDate: r.due_date ?? undefined,
        channel: r.channel ?? undefined,
        status: r.status ?? '',
      }))
    )
  }
  if (queueRes.data) {
    scheduledPosts.push(
      ...queueRes.data.map((r: { id: string; title: string | null; scheduled_time: string | null; platform: string | null; status: string | null }) => ({
        id: r.id,
        title: r.title ?? '',
        scheduledTime: r.scheduled_time ?? undefined,
        platform: r.platform ?? undefined,
        status: r.status ?? '',
      }))
    )
  }
  scheduledPosts.sort((a, b) => {
    const aTime = (a.scheduledTime ?? a.dueDate) ?? ''
    const bTime = (b.scheduledTime ?? b.dueDate) ?? ''
    return aTime.localeCompare(bTime)
  })

  const recentAssets: RecentAsset[] = (assetsRes.data ?? []).map(
    (r: { id: string; title: string | null; file_type: string | null; updated_at: string | null }) => ({
      id: r.id,
      title: r.title ?? '',
      file_type: r.file_type ?? undefined,
      updated_at: r.updated_at ?? '',
    })
  )

  const researchSummaries: ResearchSummary[] = (researchRes.data ?? []).map(
    (r: { id: string; title: string | null; updated_at: string | null }) => ({
      id: r.id,
      title: r.title ?? 'Untitled',
      time: formatTimeAgo(r.updated_at ?? new Date().toISOString()),
      score: 85,
    })
  )

  const googleConnected = calendarRes.connected || gmailRes.connected

  return {
    calendarEvents: calendarRes.events,
    gmailThreads: gmailRes.threads,
    scheduledPosts: scheduledPosts.slice(0, 8),
    recentAssets,
    researchSummaries,
    googleConnected,
    cachedAt: new Date().toISOString(),
  }
}

serve(async (req) => {
  const startTime = performance.now()
  const requestId = crypto.randomUUID()

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const cacheBypass = req.headers.get('x-cache-bypass') === 'true'

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const cacheKey = `dashboard:${user.id}`
    let payload: DashboardPayload | undefined
    let cacheStatus = 'MISS'

    if (!cacheBypass) {
      const cached = memoryCache.get(cacheKey)
      if (cached && cached.expiresAt > Date.now()) {
        payload = cached.data
        cacheStatus = 'HIT'
      }
    }

    if (payload === undefined) {
      const adminClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      payload = await buildDashboardPayload(supabase, adminClient, user.id)
      memoryCache.set(cacheKey, {
        data: payload,
        expiresAt: Date.now() + DASHBOARD_CACHE_TTL * 1000,
      })
    }

    const responseTime = Math.round(performance.now() - startTime)
    const cacheControl = `public, max-age=${CDN_CACHE_MAX_AGE}, stale-while-revalidate=${CDN_STALE_WHILE_REVALIDATE}`

    const obsHeaders: Record<string, string> = {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': cacheControl,
      'X-Cache-Status': cacheStatus,
      'X-Request-Id': requestId,
      'X-Response-Time-Ms': String(responseTime),
    }
    if (cacheStatus === 'HIT' && payload?.cachedAt) {
      const cached = memoryCache.get(cacheKey)
      if (cached) {
        obsHeaders['X-Cache-Hit-At'] = payload.cachedAt
        obsHeaders['X-Cache-Expires-At'] = new Date(cached.expiresAt).toISOString()
      }
    }

    return new Response(JSON.stringify(payload), { headers: obsHeaders })
  } catch (err) {
    const responseTime = Math.round(performance.now() - startTime)
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Request-Id': requestId,
          'X-Response-Time-Ms': String(responseTime),
        },
      }
    )
  }
})
