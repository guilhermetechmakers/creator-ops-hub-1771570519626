import { supabase } from '@/lib/supabase'
import type { ContentEditor } from '@/types/content-editor'

export interface CreateContentEditorInput {
  title: string
  description?: string
  status?: string
  content_body?: string
  channel?: string
}

export interface UpdateContentEditorInput {
  title?: string
  description?: string
  status?: string
  content_body?: string
  channel?: string
  assignee_id?: string | null
  due_date?: string | null
}

async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    throw new Error('Not authenticated')
  }
  return session
}

export async function createContentEditor(
  input: CreateContentEditorInput
): Promise<ContentEditor> {
  const session = await getSession()
  const { data, error } = await supabase
    .from('content_editor')
    .insert({
      user_id: session.user.id,
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? 'draft',
      content_body: input.content_body ?? null,
      channel: input.channel ?? 'instagram',
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return data as ContentEditor
}

export async function updateContentEditor(
  id: string,
  input: UpdateContentEditorInput
): Promise<ContentEditor> {
  const session = await getSession()
  const { data, error } = await supabase
    .from('content_editor')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single()
  if (error) throw error
  return data as ContentEditor
}

export async function deleteContentEditor(id: string): Promise<void> {
  const session = await getSession()
  const { error } = await supabase
    .from('content_editor')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id)
  if (error) throw error
}

export async function bulkUpdateContentEditorStatus(
  ids: string[],
  status: string
): Promise<void> {
  const session = await getSession()
  if (ids.length === 0) return
  const { error } = await supabase
    .from('content_editor')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .in('id', ids)
    .eq('user_id', session.user.id)
  if (error) throw error
}
