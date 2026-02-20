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

async function invokeOpenClaw<T extends ResearchResult | FactCheckResult>(
  body: Record<string, unknown>
): Promise<T> {
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
