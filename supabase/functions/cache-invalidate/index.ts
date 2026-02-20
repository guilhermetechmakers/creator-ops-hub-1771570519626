import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Cache invalidation Edge Function.
 * Called when data changes (content, research, files) to invalidate dashboard cache.
 * Uses service role - typically invoked from database triggers or other edge functions.
 *
 * Invalidation rules:
 * - content_editor CRUD -> invalidate dashboard for user
 * - file_library CRUD -> invalidate dashboard for user
 * - research CRUD -> invalidate dashboard for user
 * - publishing_queue_logs CRUD -> invalidate dashboard for user
 *
 * For in-memory cache: Edge Functions are stateless, so we return success.
 * Client should pass x-cache-bypass on next request to force fresh fetch.
 * CDN cache: Use Cache-Tag headers if supported, or short TTL.
 */
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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

    const validScopes = ['dashboard', 'file-library', 'content-studio', 'research', 'search'] as const
    const scope = (body.scope as string) ?? 'dashboard'
    const userId = (body.user_id as string) ?? user.id

    if (!validScopes.includes(scope as (typeof validScopes)[number])) {
      return new Response(
        JSON.stringify({ error: 'Unknown scope', valid_scopes: validScopes }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // In-memory cache lives in dashboard-cached and global-search - we cannot invalidate cross-instance.
    // Return success; client should use x-cache-bypass: true on next request when it knows data changed.
    // For DB triggers, log invalidation event for observability.
    const message = scope === 'dashboard'
      ? 'Invalidation acknowledged. Use x-cache-bypass on next dashboard-cached request for fresh data.'
      : `Invalidation acknowledged for ${scope}. Client should invalidate React Query cache and refetch.`

    return new Response(
      JSON.stringify({
        success: true,
        scope,
        user_id: userId,
        message,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
