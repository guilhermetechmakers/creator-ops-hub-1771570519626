import { useState, useCallback, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { GlobalSearchResult, GlobalSearchParams } from '@/types/search'

const DEBOUNCE_MS = 300

export function useGlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GlobalSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const search = useCallback(async (params: GlobalSearchParams) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      const { data, error } = await supabase.functions.invoke('global-search', {
        body: params,
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (error) throw error
      setResults(data?.results ?? [])
    } catch {
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)

      if (!value.trim()) {
        setResults([])
        setIsSearching(false)
        return
      }

      debounceRef.current = setTimeout(() => {
        search({
          query: value.trim(),
          types: ['library', 'content', 'research'],
          limit: 15,
        })
      }, DEBOUNCE_MS)
    },
    [search]
  )

  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  return {
    query,
    setQuery,
    results,
    isSearching,
    isOpen,
    setIsOpen,
    handleQueryChange,
    search,
    clearSearch,
  }
}
