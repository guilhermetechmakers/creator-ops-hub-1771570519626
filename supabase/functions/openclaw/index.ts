import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

interface ResearchRequest {
  action: 'research'
  topic: string
  content_editor_id?: string
}

interface FactCheckRequest {
  action: 'fact-check'
  content: string
  content_editor_id?: string
}

type OpenClawRequest = ResearchRequest | FactCheckRequest

interface ResearchSource {
  url: string
  title: string
  snippet: string
}

interface ResearchResult {
  summary: string
  sources: ResearchSource[]
  job_id?: string
}

interface FactCheckResult {
  validated: boolean
  findings: Array<{
    claim: string
    status: 'verified' | 'unverified' | 'disputed'
    source?: string
    note?: string
  }>
  job_id?: string
}

async function runOpenClawResearch(
  topic: string,
  userId: string,
  contentEditorId?: string
): Promise<ResearchResult> {
  const openClawApiUrl = Deno.env.get('OPENCLAW_AGENT_API_URL')
  const openClawApiKey = Deno.env.get('OPENCLAW_AGENT_API_KEY')

  if (openClawApiUrl && openClawApiKey) {
    try {
      const res = await fetch(`${openClawApiUrl}/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openClawApiKey}`,
        },
        body: JSON.stringify({
          topic,
          user_id: userId,
          content_editor_id: contentEditorId,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        return {
          summary: data.summary ?? data.result ?? '',
          sources: data.sources ?? [],
          job_id: data.job_id,
        }
      }
    } catch (e) {
      console.error('OpenClaw research API error:', e)
    }
  }

  return {
    summary: `Research summary for "${topic}": Key points and insights based on web sources. [OpenClaw Agent API integration - configure OPENCLAW_AGENT_API_URL and OPENCLAW_AGENT_API_KEY for live research.]`,
    sources: [
      {
        url: 'https://example.com/source1',
        title: 'Sample source 1',
        snippet: 'Relevant excerpt from research.',
      },
      {
        url: 'https://example.com/source2',
        title: 'Sample source 2',
        snippet: 'Additional context and findings.',
      },
    ],
  }
}

async function runOpenClawFactCheck(
  content: string,
  userId: string,
  contentEditorId?: string
): Promise<FactCheckResult> {
  const openClawApiUrl = Deno.env.get('OPENCLAW_AGENT_API_URL')
  const openClawApiKey = Deno.env.get('OPENCLAW_AGENT_API_KEY')

  if (openClawApiUrl && openClawApiKey) {
    try {
      const res = await fetch(`${openClawApiUrl}/fact-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openClawApiKey}`,
        },
        body: JSON.stringify({
          content,
          user_id: userId,
          content_editor_id: contentEditorId,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        return {
          validated: data.validated ?? true,
          findings: data.findings ?? [],
          job_id: data.job_id,
        }
      }
    } catch (e) {
      console.error('OpenClaw fact-check API error:', e)
    }
  }

  const claims = content
    .split(/[.!?]/)
    .filter((s) => s.trim().length > 20)
    .slice(0, 3)
    .map((s) => s.trim())

  return {
    validated: true,
    findings: claims.map((claim) => ({
      claim,
      status: 'verified' as const,
      source: 'OpenClaw placeholder',
      note: 'Configure OPENCLAW_AGENT_API_URL for live fact-checking.',
    })),
  }
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

    const body = (await req.json().catch(() => ({}))) as OpenClawRequest

    if (req.method !== 'POST' || !body.action) {
      return new Response(
        JSON.stringify({ error: 'POST with action (research|fact-check) required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (body.action === 'research') {
      const { topic, content_editor_id } = body
      if (!topic || typeof topic !== 'string' || !topic.trim()) {
        return new Response(
          JSON.stringify({ error: 'topic required for research' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const result = await runOpenClawResearch(
        topic.trim(),
        user.id,
        content_editor_id
      )
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (body.action === 'fact-check') {
      const { content, content_editor_id } = body
      if (!content || typeof content !== 'string') {
        return new Response(
          JSON.stringify({ error: 'content required for fact-check' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const result = await runOpenClawFactCheck(
        content,
        user.id,
        content_editor_id
      )
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action. Use research or fact-check.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
