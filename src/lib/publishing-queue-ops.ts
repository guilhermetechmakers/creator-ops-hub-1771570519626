import { supabase } from '@/lib/supabase'

async function invokeAction(
  action: string,
  body: Record<string, unknown>
): Promise<{ success?: boolean; error?: string }> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    throw new Error('Not authenticated')
  }
  const { data, error } = await supabase.functions.invoke('publishing-queue-ops', {
    body: { action, ...body },
    headers: { Authorization: `Bearer ${session.access_token}` },
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data ?? {}
}

export async function retryJob(jobId: string): Promise<void> {
  await invokeAction('retry', { jobId })
}

export async function bulkRetryJobs(jobIds: string[]): Promise<{ retried: number }> {
  const result = await invokeAction('bulk-retry', { jobIds })
  return { retried: (result as { retried?: number }).retried ?? 0 }
}

export async function manualPublishJob(jobId: string): Promise<void> {
  await invokeAction('manual-publish', { jobId })
}
