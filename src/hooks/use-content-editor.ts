import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { ContentEditor } from '@/types/content-editor'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''

export function useContentEditor(id: string | undefined) {
  const [item, setItem] = useState<ContentEditor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItem = useCallback(async () => {
    if (!SUPABASE_URL || !id) {
      setItem(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setItem(null)
        setLoading(false)
        return
      }
      const { data, error: err } = await supabase
        .from('content_editor')
        .select('*')
        .eq('id', id)
        .eq('user_id', session.user.id)
        .single()
      if (err) throw err
      setItem(data as ContentEditor)
    } catch (err) {
      setError((err as Error).message)
      setItem(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchItem()
  }, [fetchItem])

  return { item, loading, error, refetch: fetchItem }
}

export function useContentEditorList() {
  const [items, setItems] = useState<ContentEditor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    if (!SUPABASE_URL) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setItems([])
        setLoading(false)
        return
      }
      const { data, error: err } = await supabase
        .from('content_editor')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false })
      if (err) throw err
      setItems((data ?? []) as ContentEditor[])
    } catch (err) {
      setError((err as Error).message)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  return { items, loading, error, refetch: fetchItems }
}
