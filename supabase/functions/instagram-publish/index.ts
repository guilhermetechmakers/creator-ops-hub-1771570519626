import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

const GRAPH_API_VERSION = 'v21.0'
const GRAPH_HOST = 'https://graph.instagram.com'

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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json().catch(() => ({}))
    const {
      content_body,
      thumbnail_url,
      hashtags = [],
      cta,
    } = body as {
      content_body?: string
      thumbnail_url?: string
      hashtags?: string[]
      cta?: string
    }

    if (!content_body || typeof content_body !== 'string') {
      return new Response(
        JSON.stringify({ error: 'content_body required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: integration } = await supabase
      .from('instagram_integrations')
      .select('access_token, instagram_business_account_id')
      .eq('user_id', user.id)
      .single()

    if (!integration?.access_token || !integration?.instagram_business_account_id) {
      return new Response(
        JSON.stringify({ error: 'Instagram not connected. Connect your account in Integrations.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const igId = integration.instagram_business_account_id
    const accessToken = integration.access_token

    let caption = content_body.trim()
    if (hashtags.length > 0) {
      caption += '\n\n' + hashtags.map((h: string) => `#${h.replace(/^#/, '')}`).join(' ')
    }
    if (cta) {
      caption += '\n\n' + cta
    }
    if (caption.length > 2200) {
      caption = caption.slice(0, 2197) + '...'
    }

    const imageUrl = thumbnail_url?.trim()
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'thumbnail_url required for Instagram image posts. Image must be publicly accessible.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const createRes = await fetch(
      `${GRAPH_HOST}/${GRAPH_API_VERSION}/${igId}/media?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: caption,
        }),
      }
    )

    const createData = await createRes.json().catch(() => ({}))
    if (createData.error) {
      return new Response(
        JSON.stringify({
          error: createData.error.message ?? 'Failed to create media container',
          code: createData.error.code,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const containerId = createData.id
    if (!containerId) {
      return new Response(
        JSON.stringify({ error: 'No container ID returned from Instagram' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const publishRes = await fetch(
      `${GRAPH_HOST}/${GRAPH_API_VERSION}/${igId}/media_publish?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerId,
        }),
      }
    )

    const publishData = await publishRes.json().catch(() => ({}))
    if (publishData.error) {
      return new Response(
        JSON.stringify({
          error: publishData.error.message ?? 'Failed to publish to Instagram',
          code: publishData.error.code,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        mediaId: publishData.id,
        message: 'Published to Instagram successfully',
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
