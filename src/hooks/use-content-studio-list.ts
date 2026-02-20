import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { ContentEditor } from '@/types/content-editor'
import type { ContentStudioListFilters } from '@/types/content-editor'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''
const DEFAULT_PAGE_SIZE = 10

export interface ContentStudioListResult {
  items: ContentEditor[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  totalCount: number
  page: number
  totalPages: number
  hasMore: boolean
}

export function useContentStudioList(
  filters: ContentStudioListFilters = {}
): ContentStudioListResult {
  const [items, setItems] = useState<ContentEditor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const page = filters.page ?? 1
  const limit = filters.limit ?? DEFAULT_PAGE_SIZE

  const fetchItems = useCallback(async () => {
    if (!SUPABASE_URL) {
      setItems([])
      setTotalCount(0)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setItems([])
        setTotalCount(0)
        setLoading(false)
        return
      }

      let query = supabase
        .from('content_editor')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false })

      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.channel) {
        query = query.eq('channel', filters.channel)
      }
      if (filters.assignee) {
        query = query.eq('assignee_id', filters.assignee)
      }

      const { data, error: err } = await query

      if (err) throw err
      let result = (data ?? []) as ContentEditor[]

      if (filters.search?.trim()) {
        const q = filters.search.toLowerCase()
        result = result.filter(
          (item) =>
            item.title?.toLowerCase().includes(q) ||
            (item.description?.toLowerCase().includes(q) ?? false) ||
            (item.tags?.some((t) => t.toLowerCase().includes(q)) ?? false)
        )
      }

      if (filters.tags?.length) {
        result = result.filter((item) =>
          filters.tags!.some((t) => item.tags?.includes(t))
        )
      }

      const filteredTotal = result.length
      const offset = (page - 1) * limit
      const paginated = result.slice(offset, offset + limit)

      setItems(paginated)
      setTotalCount(filteredTotal)
    } catch (err) {
      setError((err as Error).message)
      setItems([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [
    filters.status,
    filters.channel,
    filters.assignee,
    filters.search,
    filters.tags?.join(','),
    filters.page,
    filters.limit,
    page,
    limit,
  ])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const totalPages = Math.max(1, Math.ceil(totalCount / limit))
  const hasMore = page < totalPages

  return {
    items,
    loading,
    error,
    refetch: fetchItems,
    totalCount,
    page,
    totalPages,
    hasMore,
  }
}

export function highlightSearchText(text: string, search: string): string {
  if (!search?.trim()) return text
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  return text.replace(regex, '<mark class="bg-primary/20 text-primary rounded px-0.5">$1</mark>')
}
