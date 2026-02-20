import { supabase } from '@/lib/supabase'
import type { FileLibrary } from '@/types/file-library'

const STORAGE_BUCKET = 'file-library'

async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    throw new Error('Not authenticated')
  }
  return session
}

export interface CreateFileLibraryInput {
  title: string
  description?: string
  file_name?: string
  file_type?: string
  file_size?: number
  storage_path?: string
  tags?: string[]
}

export interface UpdateFileLibraryInput {
  title?: string
  description?: string
  status?: string
  tags?: string[]
}

export async function createFileLibrary(
  input: CreateFileLibraryInput
): Promise<FileLibrary> {
  const session = await getSession()
  const tags = input.tags ?? []
  const { data, error } = await supabase
    .from('file_library')
    .insert({
      user_id: session.user.id,
      title: input.title,
      description: input.description ?? null,
      status: 'active',
      file_name: input.file_name ?? null,
      file_type: input.file_type ?? null,
      file_size: input.file_size ?? null,
      storage_path: input.storage_path ?? null,
      tags: Array.isArray(tags) ? tags : [],
      version: 1,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return data as FileLibrary
}

export async function updateFileLibrary(
  id: string,
  input: UpdateFileLibraryInput
): Promise<FileLibrary> {
  const session = await getSession()
  const { data, error } = await supabase
    .from('file_library')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single()
  if (error) throw error
  return data as FileLibrary
}

export async function deleteFileLibrary(id: string): Promise<void> {
  const session = await getSession()
  const { data } = await supabase
    .from('file_library')
    .select('storage_path')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()
  if (data?.storage_path) {
    await supabase.storage.from(STORAGE_BUCKET).remove([data.storage_path])
  }
  const { error } = await supabase
    .from('file_library')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id)
  if (error) throw error
}

export async function bulkDeleteFileLibrary(ids: string[]): Promise<void> {
  const session = await getSession()
  if (ids.length === 0) return
  const { data } = await supabase
    .from('file_library')
    .select('storage_path')
    .in('id', ids)
    .eq('user_id', session.user.id)
  const paths = (data ?? []).map((r) => r.storage_path).filter(Boolean) as string[]
  if (paths.length > 0) {
    await supabase.storage.from(STORAGE_BUCKET).remove(paths)
  }
  const { error } = await supabase
    .from('file_library')
    .delete()
    .in('id', ids)
    .eq('user_id', session.user.id)
  if (error) throw error
}

export async function bulkTagFileLibrary(
  ids: string[],
  tagsToAdd: string[]
): Promise<void> {
  const session = await getSession()
  if (ids.length === 0 || tagsToAdd.length === 0) return
  const { data } = await supabase
    .from('file_library')
    .select('id, tags')
    .in('id', ids)
    .eq('user_id', session.user.id)
  for (const row of data ?? []) {
    const existing = (row.tags ?? []) as string[]
    const merged = [...new Set([...existing, ...tagsToAdd])]
    await supabase
      .from('file_library')
      .update({ tags: merged, updated_at: new Date().toISOString() })
      .eq('id', row.id)
      .eq('user_id', session.user.id)
  }
}

export async function getSignedUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, 3600)
  if (error) throw error
  return data.signedUrl
}

export async function uploadFile(
  file: File,
  path: string
): Promise<{ path: string }> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { upsert: true })
  if (error) throw error
  return { path: data.path }
}
