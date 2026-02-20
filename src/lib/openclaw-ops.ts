import { supabase } from '@/lib/supabase'

export interface ResearchSource {
  url: string
  title: string
  snippet: string
}

export interface ResearchResult {
  summary: string
  sources: ResearchSource[]
  job_id?: string
}

export interface FactCheckFinding {
  claim: string
  status: 'verified' | 'unverified' | 'disputed'
  source?: string
  note?: string
}

export interface FactCheckResult {
  validated: boolean
  findings: FactCheckFinding[]
  job_id?: string
}

export interface OpenClawJob {
  id: string
  user_id: string
  content_editor_id?: string
  action: 'research' | 'fact-check' | 'generate'
  payload?: Record<string, unknown>
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: Record<string, unknown>
  error?: string
  credits_used?: number
  created_at: string
  completed_at?: string
}

export interface OpenClawSummary {
  job_id: string
  summary: string
  created_at: string
  content_editor_id?: string
}

export interface OpenClawSource {
  id: string
  url: string
  title?: string
  snippet?: string
  content_editor_id?: string
  job_id?: string
  created_at: string
}

export interface OpenClawUsage {
  period_start: string
  period_end: string
  research_count: number
  fact_check_count: number
  generate_count: number
  credits_used: number
  credits_limit: number
}

export interface OpenClawAuditEntry {
  id: string
  action: string
  resource_type?: string
  resource_id?: string
  metadata?: Record<string, unknown>
  created_at: string
}

async function invokeOpenClaw<T>(body: Record<string, unknown>): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    throw new Error('Not authenticated')
  }
  const { data, error } = await supabase.functions.invoke('openclaw', {
    body,
    headers: { Authorization: `Bearer ${session.access_token}` },
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error as string)
  return data as T
}

export async function researchTopic(
  topic: string,
  contentEditorId?: string
): Promise<ResearchResult> {
  return invokeOpenClaw<ResearchResult>({
    action: 'research',
    topic: topic.trim(),
    content_editor_id: contentEditorId,
  })
}

export async function factCheckContent(
  content: string,
  contentEditorId?: string
): Promise<FactCheckResult> {
  return invokeOpenClaw<FactCheckResult>({
    action: 'fact-check',
    content,
    content_editor_id: contentEditorId,
  })
}

/** Submit an async research/fact-check/generate job */
export async function submitOpenClawJob(params: {
  job_type: 'research' | 'fact-check' | 'generate'
  topic?: string
  content?: string
  content_editor_id?: string
}): Promise<{ job_id: string; status: string; created_at: string }> {
  return invokeOpenClaw({
    action: 'submit_job',
    job_type: params.job_type,
    topic: params.topic,
    content: params.content,
    content_editor_id: params.content_editor_id,
  })
}

/** Retrieve job status and result */
export async function getOpenClawJob(
  jobId: string
): Promise<OpenClawJob> {
  return invokeOpenClaw<OpenClawJob>({
    action: 'get_job',
    job_id: jobId,
  })
}

/** Retrieve summaries from completed research jobs */
export async function getOpenClawSummaries(params?: {
  content_editor_id?: string
  limit?: number
}): Promise<{ summaries: OpenClawSummary[] }> {
  return invokeOpenClaw({
    action: 'get_summaries',
    content_editor_id: params?.content_editor_id,
    limit: params?.limit ?? 20,
  })
}

/** Retrieve sources and citations */
export async function getOpenClawSources(params?: {
  content_editor_id?: string
  job_id?: string
  limit?: number
}): Promise<{ sources: OpenClawSource[] }> {
  return invokeOpenClaw({
    action: 'get_sources',
    content_editor_id: params?.content_editor_id,
    job_id: params?.job_id,
    limit: params?.limit ?? 50,
  })
}

/** Get usage and credits */
export async function getOpenClawUsage(): Promise<OpenClawUsage> {
  return invokeOpenClaw({
    action: 'get_usage',
  })
}

/** Get audit trail */
export async function getOpenClawAudit(params?: {
  limit?: number
  offset?: number
}): Promise<{ audit: OpenClawAuditEntry[] }> {
  return invokeOpenClaw({
    action: 'get_audit',
    limit: params?.limit ?? 20,
    offset: params?.offset ?? 0,
  })
}
