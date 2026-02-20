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

    const { data: integration } = await supabase
      .from('instagram_integrations')
      .select('access_token, instagram_business_account_id')
      .eq('user_id', user.id)
      .single()

    if (!integration?.access_token || !integration?.instagram_business_account_id) {
      return new Response(
        JSON.stringify({ error: 'Instagram not connected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const igId = integration.instagram_business_account_id
    const accessToken = integration.access_token

    const url = new URL(req.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '25', 10) || 25, 50)

    const mediaRes = await fetch(
      `${GRAPH_HOST}/${GRAPH_API_VERSION}/${igId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${encodeURIComponent(accessToken)}`
    )

    const mediaData = await mediaRes.json().catch(() => ({}))
    if (mediaData.error) {
      return new Response(
        JSON.stringify({
          error: mediaData.error.message ?? 'Failed to fetch Instagram media',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const mediaList = mediaData.data ?? []
    const insightsRes = await fetch(
      `${GRAPH_HOST}/${GRAPH_API_VERSION}/${igId}?fields=followers_count&access_token=${encodeURIComponent(accessToken)}`
    )
    const insightsData = await insightsRes.json().catch(() => ({}))
    const followersCount = insightsData.followers_count ?? 0

    const posts = mediaList.map((m: { id: string; caption?: string; like_count?: number; comments_count?: number; permalink?: string; timestamp?: string }) => ({
      id: m.id,
      caption: m.caption ?? '',
      likes: m.like_count ?? 0,
      comments: m.comments_count ?? 0,
      engagement: (m.like_count ?? 0) + (m.comments_count ?? 0),
      permalink: m.permalink,
      timestamp: m.timestamp,
    }))

    let totalImpressions = 0
    let totalEngagement = 0
    for (const p of posts) {
      totalEngagement += p.engagement
    }

    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const now = new Date().toISOString()
    await serviceSupabase.from('analytics_metrics').insert([
      {
        user_id: user.id,
        channel: 'instagram',
        metric_type: 'engagement',
        metric_value: totalEngagement,
        metadata: { source: 'instagram_graph_api' },
        recorded_at: now,
      },
      {
        user_id: user.id,
        channel: 'instagram',
        metric_type: 'followers',
        metric_value: followersCount,
        metadata: { source: 'instagram_graph_api' },
        recorded_at: now,
      },
    ]).catch(() => {})

    for (const p of posts.slice(0, 10)) {
      await serviceSupabase.from('analytics_content').insert({
        user_id: user.id,
        title: (p.caption ?? '').slice(0, 200) || 'Instagram post',
        channel: 'instagram',
        impressions: 0,
        engagement: p.engagement,
        engagement_rate: followersCount > 0 ? (p.engagement / followersCount) * 100 : 0,
        recorded_at: p.timestamp ?? now,
      }).catch(() => {})
    }

    return new Response(
      JSON.stringify({
        posts,
        totalEngagement,
        followersCount,
        overview: {
          impressions: totalImpressions,
          engagement: totalEngagement,
          followers: followersCount,
        },
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
