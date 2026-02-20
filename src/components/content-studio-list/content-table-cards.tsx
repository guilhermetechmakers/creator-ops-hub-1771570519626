import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronUp, ChevronDown, Sparkles, Eye, FileText, Plus, FilterX } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import type { ContentEditor } from '@/types/content-editor'
import { highlightSearchText } from '@/hooks/use-content-studio-list'
import { QuickPreview } from './quick-preview'
import { QuickPreviewHover } from './quick-preview-hover'
import { cn } from '@/lib/utils'

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'outline'> = {
  draft: 'secondary',
  review: 'warning',
  scheduled: 'default',
  published: 'success',
}

function formatDueDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { dateStyle: 'short' })
}

type SortKey = 'title' | 'channel' | 'due_date' | 'status' | 'updated_at'
type SortDir = 'asc' | 'desc'

interface SortHeaderProps {
  label: string
  sortKey: SortKey
  currentSortKey: SortKey
  sortDir: SortDir
  onSort: (key: SortKey) => void
}

function SortHeader({ label, sortKey, currentSortKey, sortDir, onSort }: SortHeaderProps) {
  return (
    <TableHead>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="flex items-center gap-1 font-medium hover:text-primary transition-colors duration-200"
        aria-label={`Sort by ${label}`}
      >
        {label}
        {currentSortKey === sortKey ? (
          sortDir === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )
        ) : null}
      </button>
    </TableHead>
  )
}

export interface ContentTableCardsProps {
  items: ContentEditor[]
  isLoading?: boolean
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
  searchQuery?: string
  onItemClick?: (item: ContentEditor) => void
  emptyMessage?: string
  /** When true, shows secondary "Clear filters" CTA in empty state */
  hasActiveFilters?: boolean
  /** Callback for clearing filters when empty state is shown with active filters */
  onClearFilters?: () => void
  /** Optional retry callback for QuickPreview error state (e.g. refetch content list) */
  onPreviewRetry?: () => void
}

export function ContentTableCards({
  items,
  isLoading,
  selectedIds,
  onSelectionChange,
  searchQuery = '',
  onItemClick,
  emptyMessage = 'No content items yet',
  hasActiveFilters = false,
  onClearFilters,
  onPreviewRetry,
}: ContentTableCardsProps) {
  const [sortKey, setSortKey] = useState<SortKey>('updated_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [previewItem, setPreviewItem] = useState<ContentEditor | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sortedItems = [...items].sort((a, b) => {
    let aVal: string | number | null = null
    let bVal: string | number | null = null
    switch (sortKey) {
      case 'title':
        aVal = a.title ?? ''
        bVal = b.title ?? ''
        break
      case 'channel':
        aVal = a.channel ?? ''
        bVal = b.channel ?? ''
        break
      case 'due_date':
        aVal = a.due_date ? new Date(a.due_date).getTime() : 0
        bVal = b.due_date ? new Date(b.due_date).getTime() : 0
        break
      case 'status':
        aVal = a.status ?? ''
        bVal = b.status ?? ''
        break
      case 'updated_at':
        aVal = new Date(a.updated_at).getTime()
        bVal = new Date(b.updated_at).getTime()
        break
    }
    const cmp = (aVal ?? '') < (bVal ?? '') ? -1 : (aVal ?? '') > (bVal ?? '') ? 1 : 0
    return sortDir === 'asc' ? cmp : -cmp
  })

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(items.map((i) => i.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange(next)
  }

  const handleRowClick = (item: ContentEditor) => {
    onItemClick?.(item)
  }

  const handlePreviewClick = (e: React.MouseEvent, item: ContentEditor) => {
    e.stopPropagation()
    setPreviewItem(item)
    setPreviewOpen(true)
  }

  const renderCard = (item: ContentEditor) => (
    <Card
      key={item.id}
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-card-hover',
        'hover:border-primary/30'
      )}
      onClick={() => handleRowClick(item)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={selectedIds.has(item.id)}
            onCheckedChange={() => toggleSelect(item.id)}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${item.title}`}
          />
          <div className="flex-1 min-w-0">
            <Link
              to={`/dashboard/content-editor/${item.id}`}
              onClick={(e) => e.stopPropagation()}
              className="font-medium hover:text-primary block truncate"
              aria-label={`View and edit ${item.title ?? 'Untitled'}`}
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: highlightSearchText(item.title ?? '', searchQuery) || (item.title ?? ''),
                }}
              />
            </Link>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant={STATUS_VARIANTS[item.status ?? ''] ?? 'default'} className="text-micro">
                {item.status ?? 'draft'}
              </Badge>
              {item.channel && (
                <span className="text-micro text-muted-foreground capitalize">{item.channel}</span>
              )}
              {item.is_ai_generated && (
                <Badge variant="outline" className="gap-1 border-primary/30 text-primary text-micro">
                  <Sparkles className="h-3 w-3" />
                  OpenClaw
                </Badge>
              )}
            </div>
            <p className="text-micro text-muted-foreground mt-1">
              Due: {formatDueDate(item.due_date)} · {item.assignee_id ? 'Assigned' : 'Unassigned'}
            </p>
          </div>
          <QuickPreviewHover item={item} searchQuery={searchQuery} side="left">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={(e) => handlePreviewClick(e, item)}
              className="shrink-0"
              aria-label={`Open quick preview for ${item.title ?? 'Untitled'}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </QuickPreviewHover>
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <section
        className="space-y-4"
        role="status"
        aria-label="Loading content"
        aria-busy="true"
      >
        {/* Mobile: card skeletons */}
        <div className="block lg:hidden space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" shimmer />
          ))}
        </div>
        {/* Desktop: table skeleton */}
        <Card className="hidden lg:block overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50 border-b">
                    <TableHead className="w-12">
                      <Skeleton className="h-4 w-4 rounded" shimmer />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-20" shimmer />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-16" shimmer />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-20" shimmer />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-14" shimmer />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-16" shimmer />
                    </TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-4 rounded" shimmer />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" shimmer />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" shimmer />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" shimmer />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-14 rounded-full" shimmer />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" shimmer />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8 rounded" shimmer />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>
    )
  }

  if (sortedItems.length === 0) {
    return (
      <section
        className="animate-fade-in"
        aria-labelledby="content-empty-heading"
        role="region"
      >
        <Card className="overflow-hidden border-dashed border-2 border-muted min-h-[320px] flex flex-col">
          <CardContent className="flex flex-1 flex-col items-center justify-center gap-6 py-16 px-6 sm:px-8">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5"
              aria-hidden
            >
              <FileText className="h-12 w-12 text-primary/80" aria-hidden />
            </div>
            <div className="text-center space-y-2 max-w-sm">
              <h2
                id="content-empty-heading"
                className="text-h3 font-semibold text-foreground"
              >
                {emptyMessage}
              </h2>
              <p className="text-small text-muted-foreground">
                {hasActiveFilters
                  ? 'Try adjusting your search or filters to see more results.'
                  : 'Create your first content item to get started. Use the editor to draft posts, scripts, and outlines with templates and AI assistance.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                aria-label="Create new content"
              >
                <Link to="/dashboard/content-editor/new" className="inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" aria-hidden />
                  Create New Content
                </Link>
              </Button>
              {hasActiveFilters && onClearFilters && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onClearFilters}
                  className="w-full sm:w-auto transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  aria-label="Clear filters to show all content"
                >
                  <FilterX className="h-4 w-4 mr-2" aria-hidden />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <>
      <section
        aria-labelledby="content-list-heading"
        role="region"
        className="space-y-4"
      >
        <h2 id="content-list-heading" className="sr-only">
          Content list
        </h2>
        {/* Mobile: cards */}
        <div className="block lg:hidden space-y-4">
          {sortedItems.map(renderCard)}
        </div>

        {/* Desktop: table */}
        <Card className="hidden lg:block overflow-hidden transition-shadow duration-200 hover:shadow-card-hover">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table aria-label="Content items">
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b sticky top-0 z-10">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={items.length > 0 && selectedIds.size === items.length}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <SortHeader label="Title" sortKey="title" currentSortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Channel" sortKey="channel" currentSortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Due Date" sortKey="due_date" currentSortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Status" sortKey="status" currentSortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <TableHead>Assigned</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className={cn(
                        'cursor-pointer transition-all duration-200',
                        'hover:bg-muted/30 hover:shadow-sm'
                      )}
                      onClick={() => handleRowClick(item)}
                      data-state={selectedIds.has(item.id) ? 'selected' : undefined}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(item.id)}
                          onCheckedChange={() => toggleSelect(item.id)}
                          aria-label={`Select ${item.title}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link
                          to={`/dashboard/content-editor/${item.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-primary transition-colors"
                          aria-label={`View and edit ${item.title ?? 'Untitled'}`}
                        >
                          <span
                            dangerouslySetInnerHTML={{
                              __html: highlightSearchText(item.title ?? '', searchQuery) || (item.title ?? ''),
                            }}
                          />
                        </Link>
                      </TableCell>
                      <TableCell className="capitalize text-muted-foreground">
                        {item.channel ?? '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDueDate(item.due_date)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[item.status ?? ''] ?? 'default'}>
                          {item.status ?? 'draft'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-small">
                        {item.assignee_id ? 'Assigned' : '—'}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <QuickPreviewHover item={item} searchQuery={searchQuery} side="left">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePreviewClick(e, item)
                              }}
                              aria-label={`Open quick preview for ${item.title ?? 'Untitled'}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </QuickPreviewHover>
                          {item.is_ai_generated && (
                            <Badge
                              variant="outline"
                              className="gap-1 border-primary/30 text-primary"
                            >
                              <Sparkles className="h-3 w-3" />
                              OpenClaw
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </section>

      {(previewOpen || previewItem) && (
        <QuickPreview
          item={previewItem}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          searchQuery={searchQuery}
          onRetry={onPreviewRetry}
        />
      )}
    </>
  )
}
