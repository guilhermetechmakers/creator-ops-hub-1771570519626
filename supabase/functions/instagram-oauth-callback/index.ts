import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

const GRAPH_API_VERSION = 'v21.0'

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

    const { code, state } = await req.json()
    if (!code || !state) {
      return new Response(
        JSON.stringify({ error: 'Missing code or state' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let parsedState: { userId: string; redirect: string }
    try {
      parsedState = JSON.parse(atob(state))
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid state' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser()
    if (!user || user.id !== parsedState.userId) {
      return new Response(
        JSON.stringify({ error: 'User mismatch' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const FACEBOOK_APP_ID = Deno.env.get('FACEBOOK_APP_ID')
    const FACEBOOK_APP_SECRET = Deno.env.get('FACEBOOK_APP_SECRET')
    const SITE_URL = Deno.env.get('SITE_URL') ?? 'http://localhost:5173'
    const INSTAGRAM_REDIRECT_URI =
      Deno.env.get('INSTAGRAM_REDIRECT_URI') ??
      `${SITE_URL.replace(/\/$/, '')}/oauth/instagram/callback`

    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET || !INSTAGRAM_REDIRECT_URI) {
      return new Response(
        JSON.stringify({ error: 'Instagram OAuth not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const tokenUrl = new URL(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/oauth/access_token`
    )
    tokenUrl.searchParams.set('client_id', FACEBOOK_APP_ID)
    tokenUrl.searchParams.set('client_secret', FACEBOOK_APP_SECRET)
    tokenUrl.searchParams.set('redirect_uri', INSTAGRAM_REDIRECT_URI)
    tokenUrl.searchParams.set('code', code)

    const shortTokenRes = await fetch(tokenUrl.toString())
    if (!shortTokenRes.ok) {
      const err = await shortTokenRes.text()
      return new Response(
        JSON.stringify({ error: 'Token exchange failed', details: err }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const shortTokens = await shortTokenRes.json()
    const shortAccessToken = shortTokens.access_token

    const longTokenRes = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/oauth/access_token?grant_type=fb_exchange_token&client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&fb_exchange_token=${shortAccessToken}`
    )
    if (!longTokenRes.ok) {
      const err = await longTokenRes.text()
      return new Response(
        JSON.stringify({ error: 'Long-lived token exchange failed', details: err }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const longTokens = await longTokenRes.json()
    const longAccessToken = longTokens.access_token
    const expiresIn = longTokens.expires_in ?? 5184000
    const expiresAt = new Date(
      Date.now() + expiresIn * 1000
    ).toISOString()

    const pagesRes = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/me/accounts?access_token=${longAccessToken}&fields=id,name,instagram_business_account`
    )
    const pagesData = await pagesRes.json()
    const pages = pagesData.data ?? []
    const pageWithIg = pages.find(
      (p: { instagram_business_account?: { id: string; username?: string } }) =>
        p.instagram_business_account
    )

    let instagramUserId: string | null = null
    let instagramBusinessAccountId: string | null = null
    let facebookPageId: string | null = null
    let instagramUsername: string | null = null

    if (pageWithIg?.instagram_business_account) {
      const igAccount = pageWithIg.instagram_business_account
      instagramBusinessAccountId = igAccount.id
      instagramUsername = igAccount.username ?? null
      facebookPageId = pageWithIg.id

      const pageTokenRes = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageWithIg.id}?fields=access_token&access_token=${longAccessToken}`
      )
      const pageTokenData = await pageTokenRes.json()
      const pageAccessToken = pageTokenData.access_token ?? longAccessToken

      const igUserRes = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${igAccount.id}?fields=id,username&access_token=${pageAccessToken}`
      )
      const igUserData = await igUserRes.json()
      instagramUserId = igUserData.id ?? igAccount.id
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error } = await supabase.from('instagram_integrations').upsert(
      {
        user_id: parsedState.userId,
        access_token: longAccessToken,
        refresh_token: null,
        expires_at: expiresAt,
        instagram_user_id: instagramUserId,
        instagram_business_account_id: instagramBusinessAccountId,
        facebook_page_id: facebookPageId,
        instagram_username: instagramUsername,
        scopes: 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,pages_manage_posts',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        redirect: parsedState.redirect,
        hasInstagramAccount: !!instagramBusinessAccountId,
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
