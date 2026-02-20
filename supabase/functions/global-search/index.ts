import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cache-bypass',
}

/** Search result cache TTL (seconds) - matches CACHE_TTL.SEARCH */
const SEARCH_CACHE_TTL = 120
const memoryCache = new Map<string, { data: SearchResult[]; expiresAt: number; cachedAt: string }>()

interface SearchParams {
  query?: string
  types?: ('library' | 'content' | 'research')[]
  tags?: string[]
  limit?: number
}

interface SearchResult {
  id: string
  type: 'library' | 'content' | 'research'
  title: string
  description?: string
  metadata?: Record<string, unknown>
  updated_at?: string
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

    const body = (await req.json().catch(() => ({}))) as SearchParams
    const query = (body.query ?? '').trim()
    const types = body.types ?? ['library', 'content', 'research']
    const tags = body.tags ?? []
    const limit = Math.min(body.limit ?? 20, 50)
    const cacheBypass = req.headers.get('x-cache-bypass') === 'true'

    const cacheKey = `${user.id}:${query}:${types.join(',')}:${limit}`
    if (!cacheBypass) {
      const cached = memoryCache.get(cacheKey)
      if (cached && cached.expiresAt > Date.now()) {
        const responseTime = Math.round(performance.now() - startTime)
        return new Response(JSON.stringify({ results: cached.data }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
            'X-Cache-Status': 'HIT',
            'X-Request-Id': requestId,
            'X-Response-Time-Ms': String(responseTime),
            ...(cached.cachedAt ? { 'X-Cache-Hit-At': cached.cachedAt, 'X-Cache-Expires-At': new Date(cached.expiresAt).toISOString() } : {}),
          },
        })
      }
    }

    const results: SearchResult[] = []

    const searchPattern = query ? `%${query}%` : null

    if (types.includes('library')) {
      let q = supabase
        .from('file_library')
        .select('id, title, description, file_type, tags, updated_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (searchPattern) {
        q = q.or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`)
      }

      const { data: libraryData } = await q
      if (libraryData) {
        results.push(
          ...libraryData.map((r) => ({
            id: r.id,
            type: 'library' as const,
            title: r.title ?? '',
            description: r.description ?? undefined,
            metadata: { file_type: r.file_type },
            updated_at: r.updated_at,
          }))
        )
      }
    }

    if (types.includes('content')) {
      let q = supabase
        .from('content_editor')
        .select('id, title, description, status, channel, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (searchPattern) {
        q = q.or(`title.ilike.${searchPattern},description.ilike.${searchPattern},content_body.ilike.${searchPattern}`)
      }

      const { data: contentData } = await q
      if (contentData) {
        results.push(
          ...contentData.map((r) => ({
            id: r.id,
            type: 'content' as const,
            title: r.title ?? '',
            description: r.description ?? undefined,
            metadata: { status: r.status, channel: r.channel },
            updated_at: r.updated_at,
          }))
        )
      }
    }

    if (types.includes('research')) {
      try {
        const { data: researchData } = await supabase
          .from('research')
          .select('id, title, description, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(limit)

        if (researchData && Array.isArray(researchData)) {
          results.push(
            ...researchData.map((r) => ({
              id: r.id,
              type: 'research' as const,
              title: r.title ?? '',
              description: r.description ?? undefined,
              updated_at: r.updated_at,
            }))
          )
        }
      } catch {
        // research table may not exist yet
      }
    }

    const sorted = results
      .sort((a, b) => {
        const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0
        const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0
        return bTime - aTime
      })
      .slice(0, limit)

    const cachedAt = new Date().toISOString()
    const expiresAt = Date.now() + SEARCH_CACHE_TTL * 1000
    memoryCache.set(cacheKey, { data: sorted, expiresAt, cachedAt })

    const responseTime = Math.round(performance.now() - startTime)
    return new Response(
      JSON.stringify({ results: sorted }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
          'X-Cache-Status': 'MISS',
          'X-Request-Id': requestId,
          'X-Response-Time-Ms': String(responseTime),
          'X-Cache-Expires-At': new Date(expiresAt).toISOString(),
        },
      }
    )
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
