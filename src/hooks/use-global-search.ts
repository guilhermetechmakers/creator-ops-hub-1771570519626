import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchGlobalSearch } from '@/api/global-search'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { QUERY_KEYS, CACHE_TTL } from '@/lib/cache-config'
import type { GlobalSearchResult, GlobalSearchParams } from '@/types/search'

const DEBOUNCE_MS = 300
const SEARCH_TYPES = ['library', 'content', 'research'] as const

export function useGlobalSearch() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const debouncedQuery = useDebouncedValue(query.trim(), DEBOUNCE_MS)

  const { data, isFetching, refetch } = useQuery({
    queryKey: QUERY_KEYS.search(debouncedQuery, SEARCH_TYPES.join(',')),
    queryFn: () =>
      fetchGlobalSearch({
        query: debouncedQuery,
        types: [...SEARCH_TYPES],
        limit: 15,
      }),
    enabled: debouncedQuery.length > 0,
    staleTime: CACHE_TTL.SEARCH * 1000,
    gcTime: CACHE_TTL.SEARCH * 2 * 1000,
  })

  const results: GlobalSearchResult[] = data?.results ?? []

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)
  }, [])

  const clearSearch = useCallback(() => {
    setQuery('')
    setIsOpen(false)
  }, [])

  const search = useCallback(
    (params: GlobalSearchParams) => {
      setQuery(params.query ?? '')
      void refetch()
    },
    [refetch]
  )

  return {
    query,
    setQuery,
    results,
    isSearching: isFetching,
    isOpen,
    setIsOpen,
    handleQueryChange,
    search,
    clearSearch,
  }
}
