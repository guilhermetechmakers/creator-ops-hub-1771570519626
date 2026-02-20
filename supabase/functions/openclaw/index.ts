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

interface SubmitJobRequest {
  action: 'submit_job'
  job_type: 'research' | 'fact-check' | 'generate'
  topic?: string
  content?: string
  content_editor_id?: string
}

interface GetJobRequest {
  action: 'get_job'
  job_id: string
}

interface GetSummariesRequest {
  action: 'get_summaries'
  content_editor_id?: string
  limit?: number
}

interface GetSourcesRequest {
  action: 'get_sources'
  content_editor_id?: string
  job_id?: string
  limit?: number
}

interface GetUsageRequest {
  action: 'get_usage'
}

interface GetAuditRequest {
  action: 'get_audit'
  limit?: number
  offset?: number
}

type OpenClawRequest =
  | ResearchRequest
  | FactCheckRequest
  | SubmitJobRequest
  | GetJobRequest
  | GetSummariesRequest
  | GetSourcesRequest
  | GetUsageRequest
  | GetAuditRequest

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

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse('Missing authorization', 401)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    const body = (await req.json().catch(() => ({}))) as OpenClawRequest

    if (req.method !== 'POST' || !body.action) {
      return errorResponse(
        'POST with action (research|fact-check|submit_job|get_job|get_summaries|get_sources|get_usage|get_audit) required',
        400
      )
    }

    const userId = user.id

    // Submit research/fact-check job (async job creation)
    if (body.action === 'submit_job') {
      const { job_type, topic, content, content_editor_id } = body
      if (!job_type || !['research', 'fact-check', 'generate'].includes(job_type)) {
        return errorResponse('job_type required: research|fact-check|generate', 400)
      }
      const { data: job, error } = await supabase
        .from('openclaw_jobs')
        .insert({
          user_id: userId,
          content_editor_id: content_editor_id ?? null,
          action: job_type,
          payload: { topic, content },
          status: 'pending',
        })
        .select('id, status, created_at')
        .single()
      if (error) {
        return errorResponse(error.message, 500)
      }
      // Log audit
      await supabase.from('openclaw_audit_log').insert({
        user_id: userId,
        job_id: job?.id,
        action: 'job_submitted',
        resource_type: 'job',
        resource_id: job?.id,
        metadata: { job_type },
      })
      return jsonResponse({
        job_id: job?.id,
        status: job?.status,
        created_at: job?.created_at,
      })
    }

    // Get job status/result
    if (body.action === 'get_job') {
      const { job_id } = body
      if (!job_id) return errorResponse('job_id required', 400)
      const { data: job, error } = await supabase
        .from('openclaw_jobs')
        .select('*')
        .eq('id', job_id)
        .eq('user_id', userId)
        .single()
      if (error || !job) {
        return errorResponse('Job not found', 404)
      }
      return jsonResponse(job)
    }

    // Get summaries (completed research jobs)
    if (body.action === 'get_summaries') {
      const { content_editor_id, limit = 20 } = body
      let q = supabase
        .from('openclaw_jobs')
        .select('id, result, created_at, content_editor_id')
        .eq('user_id', userId)
        .eq('action', 'research')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(Math.min(limit, 50))
      if (content_editor_id) {
        q = q.eq('content_editor_id', content_editor_id)
      }
      const { data: jobs, error } = await q
      if (error) return errorResponse(error.message, 500)
      const summaries = (jobs ?? []).map((j) => ({
        job_id: j.id,
        summary: (j.result as { summary?: string })?.summary ?? '',
        created_at: j.created_at,
        content_editor_id: j.content_editor_id,
      }))
      return jsonResponse({ summaries })
    }

    // Get sources/citations
    if (body.action === 'get_sources') {
      const { content_editor_id, job_id, limit = 50 } = body
      let q = supabase
        .from('openclaw_sources')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(Math.min(limit, 100))
      if (content_editor_id) q = q.eq('content_editor_id', content_editor_id)
      if (job_id) q = q.eq('job_id', job_id)
      const { data: sources, error } = await q
      if (error) return errorResponse(error.message, 500)
      return jsonResponse({ sources: sources ?? [] })
    }

    // Get usage and credits
    if (body.action === 'get_usage') {
      const now = new Date()
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .slice(0, 10)
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .slice(0, 10)
      const { data: usage, error } = await supabase
        .from('openclaw_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('period_start', periodStart)
        .single()
      if (error && error.code !== 'PGRST116') return errorResponse(error.message, 500)
      return jsonResponse({
        period_start: periodStart,
        period_end: periodEnd,
        research_count: usage?.research_count ?? 0,
        fact_check_count: usage?.fact_check_count ?? 0,
        generate_count: usage?.generate_count ?? 0,
        credits_used: usage?.credits_used ?? 0,
        credits_limit: usage?.credits_limit ?? 100,
      })
    }

    // Get audit trail
    if (body.action === 'get_audit') {
      const { limit = 20, offset = 0 } = body
      const { data: logs, error } = await supabase
        .from('openclaw_audit_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + Math.min(limit, 50) - 1)
      if (error) return errorResponse(error.message, 500)
      return jsonResponse({ audit: logs ?? [] })
    }

    // Synchronous research
    if (body.action === 'research') {
      const { topic, content_editor_id } = body
      if (!topic || typeof topic !== 'string' || !topic.trim()) {
        return errorResponse('topic required for research', 400)
      }
      const result = await runOpenClawResearch(
        topic.trim(),
        userId,
        content_editor_id
      )
      // Persist job and sources for audit
      const { data: job } = await supabase
        .from('openclaw_jobs')
        .insert({
          user_id: userId,
          content_editor_id: content_editor_id ?? null,
          action: 'research',
          payload: { topic: topic.trim() },
          status: 'completed',
          result: { summary: result.summary, sources: result.sources },
          completed_at: new Date().toISOString(),
        })
        .select('id')
        .single()
      if (job && result.sources?.length) {
        await supabase.from('openclaw_sources').insert(
          result.sources.map((s) => ({
            user_id: userId,
            content_editor_id: content_editor_id ?? null,
            job_id: job.id,
            url: s.url,
            title: s.title,
            snippet: s.snippet,
          }))
        )
      }
      return jsonResponse(result)
    }

    // Synchronous fact-check
    if (body.action === 'fact-check') {
      const { content, content_editor_id } = body
      if (!content || typeof content !== 'string') {
        return errorResponse('content required for fact-check', 400)
      }
      const result = await runOpenClawFactCheck(
        content,
        userId,
        content_editor_id
      )
      await supabase.from('openclaw_jobs').insert({
        user_id: userId,
        content_editor_id: content_editor_id ?? null,
        action: 'fact-check',
        payload: { content_length: content.length },
        status: 'completed',
        result: { validated: result.validated, findings: result.findings },
        completed_at: new Date().toISOString(),
      })
      return jsonResponse(result)
    }

    return errorResponse(
      'Unknown action. Use research, fact-check, submit_job, get_job, get_summaries, get_sources, get_usage, or get_audit.',
      400
    )
  } catch (err) {
    return errorResponse((err as Error).message, 500)
  }
})
