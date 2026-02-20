import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const FACEBOOK_APP_ID = Deno.env.get('FACEBOOK_APP_ID') ?? ''
const SITE_URL = Deno.env.get('SITE_URL') ?? 'http://localhost:5173'
const INSTAGRAM_REDIRECT_URI =
  Deno.env.get('INSTAGRAM_REDIRECT_URI') ??
  `${SITE_URL.replace(/\/$/, '')}/oauth/instagram/callback`

const INSTAGRAM_SCOPES = [
  'instagram_basic',
  'instagram_content_publish',
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
].join(',')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
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

    const token = authHeader.replace('Bearer ', '')
    const userRes = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/auth/v1/user`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const userData = await userRes.json()
    const user = userData.id ? userData : userData.user ?? null

    if (!user?.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const state = btoa(
      JSON.stringify({
        userId: user.id,
        redirect: `${SITE_URL}/dashboard/integrations`,
      })
    )
    const authUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth')
    authUrl.searchParams.set('client_id', FACEBOOK_APP_ID)
    authUrl.searchParams.set('redirect_uri', INSTAGRAM_REDIRECT_URI)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', INSTAGRAM_SCOPES)
    authUrl.searchParams.set('state', state)

    return new Response(
      JSON.stringify({ authUrl: authUrl.toString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
