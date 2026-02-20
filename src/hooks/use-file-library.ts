import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { FileLibrary } from '@/types/file-library'
import type { FileLibraryFilters } from '@/types/file-library'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''
const DEFAULT_PAGE_SIZE = 12

export interface UseFileLibraryResult {
  items: FileLibrary[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  totalCount: number
  page: number
  totalPages: number
}

export function useFileLibrary(
  filters: FileLibraryFilters = {}
): UseFileLibraryResult {
  const [items, setItems] = useState<FileLibrary[]>([])
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
        .from('file_library')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false })

      if (filters.fileType) {
        query = query.eq('file_type', filters.fileType)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error: err } = await query

      if (err) throw err
      let result = (data ?? []) as FileLibrary[]

      if (filters.search?.trim()) {
        const q = filters.search.toLowerCase()
        result = result.filter(
          (item) =>
            item.title?.toLowerCase().includes(q) ||
            (item.description?.toLowerCase().includes(q) ?? false) ||
            (item.file_name?.toLowerCase().includes(q) ?? false) ||
            (item.tags?.some((t) => t.toLowerCase().includes(q)) ?? false)
        )
      }

      if (filters.tags?.length) {
        result = result.filter((item) =>
          filters.tags!.some((t) => item.tags?.includes(t))
        )
      }

      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom).getTime()
        result = result.filter((item) => new Date(item.created_at).getTime() >= from)
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo).getTime()
        result = result.filter((item) => new Date(item.created_at).getTime() <= to)
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
    filters.search,
    filters.tags?.join(','),
    filters.fileType,
    filters.dateFrom,
    filters.dateTo,
    filters.dateRange,
    filters.page,
    filters.limit,
    page,
    limit,
  ])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const totalPages = Math.max(1, Math.ceil(totalCount / limit))

  return {
    items,
    loading,
    error,
    refetch: fetchItems,
    totalCount,
    page,
    totalPages,
  }
}

export function highlightSearchText(text: string, search: string): string {
  if (!search?.trim()) return text
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  return text.replace(regex, '<mark class="bg-primary/20 text-primary rounded px-0.5">$1</mark>')
}
