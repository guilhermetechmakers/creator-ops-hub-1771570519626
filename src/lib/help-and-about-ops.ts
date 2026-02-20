import { supabase } from '@/lib/supabase'
import type { HelpAndAbout } from '@/types/help-and-about'

async function invokeAction<T>(
  action: string,
  body: Record<string, unknown> = {}
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    throw new Error('Not authenticated')
  }
  const { data, error } = await supabase.functions.invoke('help-and-about', {
    body: { action, ...body },
    headers: { Authorization: `Bearer ${session.access_token}` },
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data as T
}

export async function submitSupportTicket(
  title: string,
  description?: string
): Promise<HelpAndAbout> {
  const result = await invokeAction<{ item: HelpAndAbout }>('create', {
    title,
    description,
  })
  if (!result?.item) throw new Error('Failed to submit ticket')
  return result.item
}

export async function listSupportTickets(): Promise<HelpAndAbout[]> {
  const result = await invokeAction<{ items: HelpAndAbout[] }>('list')
  return result?.items ?? []
}
