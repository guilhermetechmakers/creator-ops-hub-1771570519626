import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRecord {
  id: string
  user_id: string
  type: string
  channel: string
  title: string
  body: string | null
  metadata: Record<string, unknown>
  read_at: string | null
  delivery_retries: number
  status: string
  created_at: string
  updated_at: string
}

interface ListParams {
  limit?: number
  offset?: number
  unread_only?: boolean
  type?: string
}

interface MarkReadParams {
  ids?: string[]
  all?: boolean
}

serve(async (req) => {
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

    const contentType = req.headers.get('content-type') ?? ''
    const body = (req.method === 'POST' && contentType.includes('application/json'))
      ? (await req.json().catch(() => ({}))) as Record<string, unknown>
      : {}

    const url = new URL(req.url)
    const action = (body.action as string) ?? url.searchParams.get('action') ?? 'list'

    if (action === 'get-preferences') {
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      const defaults = {
        email_comments: true,
        email_mentions: true,
        email_publish_status: true,
        in_app_comments: true,
        in_app_mentions: true,
        email_new_content: true,
        email_review_actions: true,
        email_failed_publish: true,
        email_system_alerts: true,
        push_enabled: false,
      }

      return new Response(
        JSON.stringify({ preferences: prefs ?? defaults }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET' || action === 'list') {
      const limit = Math.min(
        parseInt((body.limit as string) ?? url.searchParams.get('limit') ?? '20', 10),
        50
      )
      const offset = parseInt((body.offset as string) ?? url.searchParams.get('offset') ?? '0', 10)
      const unreadOnly = (body.unread_only as boolean) ?? url.searchParams.get('unread_only') === 'true'
      const typeFilter = (body.type as string) ?? url.searchParams.get('type') ?? undefined

      if (action === 'list' || action === '') {
        let q = supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (unreadOnly) {
          q = q.is('read_at', null)
        }
        if (typeFilter) {
          q = q.eq('type', typeFilter)
        }

        const { data, error } = await q

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .is('read_at', null)

        return new Response(
          JSON.stringify({
            notifications: (data ?? []) as NotificationRecord[],
            unread_count: count ?? 0,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

    }

    if (req.method === 'POST' && action !== 'list') {
      if (action === 'mark-read') {
        const { ids, all } = body as MarkReadParams
        const now = new Date().toISOString()

        if (all) {
          const { error } = await supabase
            .from('notifications')
            .update({ read_at: now, updated_at: now })
            .eq('user_id', user.id)
            .is('read_at', null)

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        } else if (ids && Array.isArray(ids) && ids.length > 0) {
          const { error } = await supabase
            .from('notifications')
            .update({ read_at: now, updated_at: now })
            .eq('user_id', user.id)
            .in('id', ids)

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (action === 'preferences') {
        const prefs = body as Record<string, boolean | undefined>
        const payload: Record<string, unknown> = {
          user_id: user.id,
          updated_at: new Date().toISOString(),
        }

        const keys = [
          'email_comments', 'email_mentions', 'email_publish_status',
          'in_app_comments', 'in_app_mentions',
          'email_new_content', 'email_review_actions', 'email_failed_publish',
          'email_system_alerts', 'push_enabled',
        ]
        for (const k of keys) {
          if (typeof prefs[k] === 'boolean') payload[k] = prefs[k]
        }

        const { data: existing } = await supabase
          .from('user_preferences')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (existing) {
          const { data, error } = await supabase
            .from('user_preferences')
            .update(payload)
            .eq('user_id', user.id)
            .select()
            .single()

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          return new Response(
            JSON.stringify({ preferences: data }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data, error } = await supabase
          .from('user_preferences')
          .insert(payload)
          .select()
          .single()

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        return new Response(
          JSON.stringify({ preferences: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
