import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FileText, FolderOpen, Search as SearchIcon, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useGlobalSearch } from '@/hooks/use-global-search'
import { cn } from '@/lib/utils'
import type { GlobalSearchResult, SearchResultType } from '@/types/search'

const typeConfig: Record<SearchResultType, { icon: typeof FileText; label: string; path: (id: string) => string }> = {
  library: { icon: FolderOpen, label: 'Library', path: (id) => `/dashboard/file-library?highlight=${id}` },
  content: { icon: FileText, label: 'Content', path: (id) => `/dashboard/content-editor/${id}` },
  research: { icon: SearchIcon, label: 'Research', path: (id) => `/dashboard/research?highlight=${id}` },
}

function ResultItem({
  result,
  onSelect,
}: {
  result: GlobalSearchResult
  onSelect: () => void
}) {
  const config = typeConfig[result.type]
  const Icon = config.icon

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left',
        'hover:bg-muted/70 transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2'
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{result.title}</p>
        {result.description && (
          <p className="text-micro text-muted-foreground truncate mt-0.5">{result.description}</p>
        )}
        <Badge variant="secondary" className="mt-1.5 text-micro">
          {config.label}
        </Badge>
      </div>
    </button>
  )
}

export function GlobalSearch() {
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const {
    query,
    results,
    isSearching,
    isOpen,
    setIsOpen,
    handleQueryChange,
    clearSearch,
  } = useGlobalSearch()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setIsOpen])

  const handleSelect = (result: GlobalSearchResult) => {
    const config = typeConfig[result.type]
    navigate(config.path(result.id))
    clearSearch()
  }

  const showResults = isOpen && (query.length > 0 || results.length > 0)

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
      <Input
        placeholder="Search library, content, research..."
        className="pl-9 bg-muted/50 focus:border-primary/50 transition-colors duration-200 pr-9"
        value={query}
        onChange={(e) => {
          handleQueryChange(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        aria-label="Global search"
        aria-expanded={showResults}
        aria-haspopup="listbox"
      />
      {isSearching && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-pulse" />
      )}

      {showResults && (
        <div
          role="listbox"
          className={cn(
            'absolute top-full left-0 right-0 mt-1 z-50',
            'rounded-xl border bg-card shadow-elevated',
            'max-h-[min(400px,70vh)] overflow-y-auto',
            'animate-in fade-in zoom-in-95 duration-200'
          )}
        >
          {results.length > 0 ? (
            <div className="p-2 space-y-0.5">
              {results.map((r) => (
                <ResultItem key={`${r.type}-${r.id}`} result={r} onSelect={() => handleSelect(r)} />
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground text-small">
              {isSearching ? 'Searching...' : 'No results found'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
