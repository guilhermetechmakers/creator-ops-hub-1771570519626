export type SearchResultType = 'library' | 'content' | 'research'

export interface GlobalSearchResult {
  id: string
  type: SearchResultType
  title: string
  description?: string
  metadata?: Record<string, unknown>
  updated_at?: string
}

export interface GlobalSearchParams {
  query?: string
  types?: SearchResultType[]
  tags?: string[]
  limit?: number
}
