import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const body = req.method !== 'GET' ? await req.json().catch(() => ({})) : {}
    const action = body.action as string

    if (req.method === 'POST' && action === 'retry') {
      const { jobId } = body
      if (!jobId || typeof jobId !== 'string') {
        return new Response(
          JSON.stringify({ error: 'jobId required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const { data: job, error: fetchErr } = await supabase
        .from('publishing_queue_logs')
        .select('*')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single()
      if (fetchErr || !job) {
        return new Response(
          JSON.stringify({ error: 'Job not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      if (job.status !== 'failed' && job.status !== 'cancelled') {
        return new Response(
          JSON.stringify({ error: 'Job is not in a retriable state' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const { error: updateErr } = await supabase
        .from('publishing_queue_logs')
        .update({
          status: 'queued',
          error_logs: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId)
        .eq('user_id', user.id)
      if (updateErr) {
        return new Response(
          JSON.stringify({ error: updateErr.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST' && action === 'bulk-retry') {
      const { jobIds } = body
      if (!Array.isArray(jobIds) || jobIds.length === 0) {
        return new Response(
          JSON.stringify({ error: 'jobIds array required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const { data: jobs, error: fetchErr } = await supabase
        .from('publishing_queue_logs')
        .select('id, status')
        .eq('user_id', user.id)
        .in('id', jobIds)
      if (fetchErr) {
        return new Response(
          JSON.stringify({ error: fetchErr.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const retriable = (jobs ?? []).filter(
        (j: { status: string }) => j.status === 'failed' || j.status === 'cancelled'
      )
      if (retriable.length === 0) {
        return new Response(
          JSON.stringify({ success: true, retried: 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const { error: updateErr } = await supabase
        .from('publishing_queue_logs')
        .update({
          status: 'queued',
          error_logs: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .in('id', retriable.map((j: { id: string }) => j.id))
      if (updateErr) {
        return new Response(
          JSON.stringify({ error: updateErr.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      return new Response(
        JSON.stringify({ success: true, retried: retriable.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST' && action === 'schedule') {
      const { title, description, platform, scheduledTime, payload } = body
      if (!title || typeof title !== 'string') {
        return new Response(
          JSON.stringify({ error: 'title required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const { data: job, error: insertErr } = await supabase
        .from('publishing_queue_logs')
        .insert({
          user_id: user.id,
          title: String(title),
          description: description ?? null,
          platform: platform ?? 'instagram',
          scheduled_time: scheduledTime ?? null,
          payload: payload ?? {},
          status: 'queued',
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()
      if (insertErr) {
        return new Response(
          JSON.stringify({ error: insertErr.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      return new Response(
        JSON.stringify({ success: true, job }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST' && action === 'manual-publish') {
      const { jobId } = body
      if (!jobId || typeof jobId !== 'string') {
        return new Response(
          JSON.stringify({ error: 'jobId required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const { data: job, error: fetchErr } = await supabase
        .from('publishing_queue_logs')
        .select('*')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single()
      if (fetchErr || !job) {
        return new Response(
          JSON.stringify({ error: 'Job not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      if (job.status !== 'queued' && job.status !== 'failed') {
        return new Response(
          JSON.stringify({ error: 'Job cannot be manually published in current state' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const { error: updateErr } = await supabase
        .from('publishing_queue_logs')
        .update({
          status: 'processing',
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId)
        .eq('user_id', user.id)
      if (updateErr) {
        return new Response(
          JSON.stringify({ error: updateErr.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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
