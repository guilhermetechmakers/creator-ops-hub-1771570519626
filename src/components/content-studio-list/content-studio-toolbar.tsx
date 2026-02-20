import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Filter, Trash2, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, type SelectOption } from '@/components/ui/select'
import { ContentSearch } from '@/components/content-studio-list/content-search'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ContentStudioListFilters } from '@/types/content-editor'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'Review' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
]

const CHANNEL_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All channels' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'linkedin', label: 'LinkedIn' },
]

function parseTagsInput(value: string): string[] {
  return value
    .split(/[,\s]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
}

export interface ContentStudioToolbarProps {
  filters: ContentStudioListFilters
  onFiltersChange: (filters: ContentStudioListFilters) => void
  selectedCount: number
  onBulkDelete?: () => void
  onBulkStatusChange?: (status: string) => void
  isBulkUpdating?: boolean
  onNewContent?: () => void
  searchValue?: string
  onSearchChange?: (value: string) => void
  /** Unique tags from content for quick filter suggestions */
  suggestedTags?: string[]
  className?: string
}

export function ContentStudioToolbar({
  filters,
  onFiltersChange,
  selectedCount,
  onBulkDelete,
  onBulkStatusChange,
  isBulkUpdating = false,
  searchValue = '',
  onSearchChange,
  suggestedTags = [],
  className,
}: ContentStudioToolbarProps) {
  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : (value as ContentStudioListFilters['status']),
    })
  }

  const handleChannelChange = (value: string) => {
    onFiltersChange({
      ...filters,
      channel: value === 'all' ? undefined : value,
    })
  }

  const handleAssigneeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      assignee: value === 'all' ? undefined : value,
    })
  }

  const tagsInputValue = filters.tags?.join(', ') ?? ''
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = parseTagsInput(e.target.value)
    onFiltersChange({
      ...filters,
      tags: tags.length > 0 ? tags : undefined,
      page: 1,
    })
  }

  const handleSearchChange = (value: string) => {
    onSearchChange?.(value)
    onFiltersChange({
      ...filters,
      search: value || undefined,
      page: 1,
    })
  }

  const handleTagRemove = (tag: string) => {
    const next = filters.tags?.filter((t) => t !== tag) ?? []
    onFiltersChange({
      ...filters,
      tags: next.length > 0 ? next : undefined,
      page: 1,
    })
  }

  const handleTagAdd = (tag: string) => {
    const current = filters.tags ?? []
    if (current.includes(tag)) return
    onFiltersChange({
      ...filters,
      tags: [...current, tag],
      page: 1,
    })
  }

  const [filtersExpanded, setFiltersExpanded] = useState(true)
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
          <Button asChild className="shrink-0 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
            <Link to="/dashboard/content-editor/new">
              <Plus className="h-4 w-4 mr-2" />
              New Content
            </Link>
          </Button>
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 animate-fade-in">
              <span className="text-small text-muted-foreground">
                {selectedCount} selected
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isBulkUpdating}>
                    <MoreHorizontal className="h-4 w-4 mr-1" />
                    {isBulkUpdating ? 'Updating...' : 'Bulk actions'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[180px]">
                  {onBulkStatusChange && (
                    <>
                      <DropdownMenuItem onClick={() => onBulkStatusChange('draft')}>
                        Mark as Draft
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onBulkStatusChange('review')}>
                        Mark as Review
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onBulkStatusChange('scheduled')}>
                        Mark as Scheduled
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onBulkStatusChange('published')}>
                        Mark as Published
                      </DropdownMenuItem>
                    </>
                  )}
                  {onBulkDelete && (
                    <DropdownMenuItem
                      onClick={onBulkDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete selected
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 transition-all duration-200">
        <button
          type="button"
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-expanded={filtersExpanded}
          aria-label={filtersExpanded ? 'Collapse filters' : 'Expand filters'}
        >
          <Filter className="h-4 w-4" aria-hidden />
          <span className="text-sm font-medium">Filters</span>
        </button>
        {filtersExpanded && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 animate-slide-up">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="filter-search" className="text-micro">
                Search (title & tags)
              </Label>
              <ContentSearch
                value={(searchValue || filters.search) ?? ''}
                onChange={handleSearchChange}
                placeholder="Full-text and tag search..."
                suggestedTags={suggestedTags}
                activeTags={filters.tags ?? []}
                onTagRemove={handleTagRemove}
                onTagAdd={handleTagAdd}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-status" className="text-micro">
                Status
              </Label>
              <Select
                id="filter-status"
                options={STATUS_OPTIONS}
                value={filters.status ?? 'all'}
                onChange={(e) => handleStatusChange(e.target.value)}
                aria-label="Filter by status"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-channel" className="text-micro">
                Channel
              </Label>
              <Select
                id="filter-channel"
                options={CHANNEL_OPTIONS}
                value={filters.channel ?? 'all'}
                onChange={(e) => handleChannelChange(e.target.value)}
                aria-label="Filter by channel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-assignee" className="text-micro">
                Assignee
              </Label>
              <Select
                id="filter-assignee"
                options={[{ value: 'all', label: 'All assignees' }]}
                value={filters.assignee ?? 'all'}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                aria-label="Filter by assignee"
              />
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="filter-tags" className="text-micro">
                Tags
              </Label>
              <Input
                id="filter-tags"
                placeholder="e.g. campaign, launch"
                value={tagsInputValue}
                onChange={handleTagsChange}
                className="transition-colors duration-200 focus:border-primary/50"
                aria-label="Filter by tags (comma-separated)"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
