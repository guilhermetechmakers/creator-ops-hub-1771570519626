import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function refreshTokenIfNeeded(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data: integration } = await supabase
    .from('google_integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'google')
    .single()

  if (!integration?.refresh_token) return null

  const expiresAt = integration.expires_at ? new Date(integration.expires_at).getTime() : 0
  const now = Date.now()
  if (expiresAt > now + 60000) return integration.access_token

  const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')
  const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return integration.access_token

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

  if (!tokenRes.ok) return integration.access_token
  const tokens = await tokenRes.json()

  await supabase
    .from('google_integrations')
    .update({
      access_token: tokens.access_token,
      expires_at: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('provider', 'google')

  return tokens.access_token
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

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const accessToken = await refreshTokenIfNeeded(adminClient, user.id)
    if (!accessToken) {
      return new Response(
        JSON.stringify({ threads: [], connected: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const res = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/threads?maxResults=10&q=is:starred OR is:important',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (!res.ok) {
      return new Response(
        JSON.stringify({ threads: [], connected: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await res.json()
    const threads = (data.threads ?? []).slice(0, 5)

    const threadDetails = await Promise.all(
      threads.map(async (t: { id: string }) => {
        const tr = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${t.id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (!tr.ok) return null
        const td = await tr.json()
        const snippet = td.messages?.[0]?.snippet ?? 'No preview'
        return { id: t.id, snippet: snippet.substring(0, 120) }
      })
    )

    return new Response(
      JSON.stringify({ threads: threadDetails.filter(Boolean), connected: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
