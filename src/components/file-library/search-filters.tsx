import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Filter, X } from 'lucide-react'

const SEARCH_DEBOUNCE_MS = 300
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, type SelectOption } from '@/components/ui/select'
import type { FileLibraryFilters } from '@/types/file-library'
import { cn } from '@/lib/utils'

const FILE_TYPE_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All file types' },
  { value: 'image/png', label: 'PNG' },
  { value: 'image/jpeg', label: 'JPEG' },
  { value: 'image/gif', label: 'GIF' },
  { value: 'image/webp', label: 'WebP' },
  { value: 'application/pdf', label: 'PDF' },
  { value: 'video/mp4', label: 'MP4' },
  { value: 'application/json', label: 'JSON' },
  { value: 'text/csv', label: 'CSV' },
]

const DATE_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Any date' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Past week' },
  { value: 'month', label: 'Past month' },
  { value: 'year', label: 'Past year' },
]

const USAGE_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All usage' },
  { value: 'used', label: 'Used in content' },
  { value: 'unused', label: 'Not used' },
]

export interface SearchFiltersProps {
  filters: FileLibraryFilters
  onFiltersChange: (filters: FileLibraryFilters) => void
  availableTags?: string[]
  className?: string
}

export function SearchFilters({
  filters,
  onFiltersChange,
  availableTags = [],
  className,
}: SearchFiltersProps) {
  const [filtersExpanded, setFiltersExpanded] = useState(true)
  const [tagInput, setTagInput] = useState('')
  const [searchInput, setSearchInput] = useState(filters.search ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  useEffect(() => {
    setSearchInput(filters.search ?? '')
  }, [filters.search])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      const trimmed = value.trim()
      debounceRef.current = setTimeout(() => {
        onFiltersChange({
          ...filtersRef.current,
          search: trimmed || undefined,
          page: 1,
        })
        debounceRef.current = null
      }, SEARCH_DEBOUNCE_MS)
    },
    [onFiltersChange]
  )

  const handleFileTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      fileType: value === 'all' ? undefined : value,
      page: 1,
    })
  }

  const handleDateChange = (value: string) => {
    if (value === 'all') {
      onFiltersChange({
        ...filters,
        dateRange: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        page: 1,
      })
      return
    }
    const now = new Date()
    let dateFrom: string | undefined
    let dateTo: string | undefined
    if (value === 'today') {
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      dateFrom = start.toISOString().split('T')[0]
      dateTo = now.toISOString().split('T')[0]
    } else if (value === 'week') {
      const d = new Date(now)
      d.setDate(d.getDate() - 7)
      dateFrom = d.toISOString().split('T')[0]
      dateTo = now.toISOString().split('T')[0]
    } else if (value === 'month') {
      const d = new Date(now)
      d.setMonth(d.getMonth() - 1)
      dateFrom = d.toISOString().split('T')[0]
      dateTo = now.toISOString().split('T')[0]
    } else if (value === 'year') {
      const d = new Date(now)
      d.setFullYear(d.getFullYear() - 1)
      dateFrom = d.toISOString().split('T')[0]
      dateTo = now.toISOString().split('T')[0]
    }
    onFiltersChange({
      ...filters,
      dateRange: value,
      dateFrom,
      dateTo,
      page: 1,
    })
  }

  const handleUsageChange = (value: string) => {
    onFiltersChange({
      ...filters,
      usage: value === 'all' ? undefined : value,
      page: 1,
    })
  }

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase()
    if (!trimmed || filters.tags?.includes(trimmed)) return
    onFiltersChange({
      ...filters,
      tags: [...(filters.tags ?? []), trimmed],
      page: 1,
    })
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    onFiltersChange({
      ...filters,
      tags: filters.tags?.filter((t) => t !== tag) ?? [],
      page: 1,
    })
  }

  const activeFilterCount =
    (filters.fileType ? 1 : 0) +
    (filters.dateRange && filters.dateRange !== 'all' ? 1 : 0) +
    (filters.usage ? 1 : 0) +
    (filters.tags?.length ?? 0)

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, tags, or description..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 transition-colors duration-200 focus:border-primary/50"
            aria-label="Global search"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          className="shrink-0 transition-all duration-200 hover:border-primary/50"
          aria-expanded={filtersExpanded}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5 text-micro">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {filtersExpanded && (
        <div className="rounded-lg border bg-card p-4 transition-all duration-200 animate-slide-up">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="filter-file-type" className="text-micro font-medium">
                File type
              </Label>
              <Select
                id="filter-file-type"
                options={FILE_TYPE_OPTIONS}
                value={filters.fileType ?? 'all'}
                onChange={(e) => handleFileTypeChange(e.target.value)}
                aria-label="Filter by file type"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-date" className="text-micro font-medium">
                Date
              </Label>
              <Select
                id="filter-date"
                options={DATE_OPTIONS}
                value={filters.dateRange ?? 'all'}
                onChange={(e) => handleDateChange(e.target.value)}
                aria-label="Filter by date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-usage" className="text-micro font-medium">
                Usage
              </Label>
              <Select
                id="filter-usage"
                options={USAGE_OPTIONS}
                value={filters.usage ?? 'all'}
                onChange={(e) => handleUsageChange(e.target.value)}
                aria-label="Filter by usage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-tags" className="text-micro font-medium">
                Tags
              </Label>
              <div className="flex flex-wrap gap-2">
                {(filters.tags ?? []).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer gap-1 pr-1 transition-all duration-200 hover:bg-destructive/20"
                    onClick={() => removeTag(tag)}
                  >
                    {tag}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
                <Input
                  id="filter-tags"
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag(tagInput)
                    }
                  }}
                  onBlur={() => tagInput && addTag(tagInput)}
                  className="h-9 flex-1 min-w-[100px]"
                />
              </div>
              {availableTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {availableTags
                    .filter((t) => !filters.tags?.includes(t))
                    .slice(0, 5)
                    .map((tag) => (
                      <Button
                        key={tag}
                        variant="ghost"
                        size="sm"
                        className="h-7 text-micro"
                        onClick={() => addTag(tag)}
                      >
                        + {tag}
                      </Button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
