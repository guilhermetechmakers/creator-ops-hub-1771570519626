import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronUp, ChevronDown, Sparkles, Eye, FileEdit } from 'lucide-react'
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

export interface ContentTableCardsProps {
  items: ContentEditor[]
  isLoading?: boolean
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
  searchQuery?: string
  onItemClick?: (item: ContentEditor) => void
  emptyMessage?: string
}

export function ContentTableCards({
  items,
  isLoading,
  selectedIds,
  onSelectionChange,
  searchQuery = '',
  onItemClick,
  emptyMessage = 'No content items yet',
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

  const SortHeader = ({
    label,
    sortKey: sk,
  }: {
    label: string
    sortKey: SortKey
  }) => (
    <TableHead>
      <button
        type="button"
        onClick={() => toggleSort(sk)}
        className="flex items-center gap-1 font-medium hover:text-primary transition-colors duration-200"
        aria-label={`Sort by ${label}`}
      >
        {label}
        {sortKey === sk ? (
          sortDir === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )
        ) : null}
      </button>
    </TableHead>
  )

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
              aria-label="Quick preview (hover or click)"
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
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-24 w-full animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  if (sortedItems.length === 0) {
    return (
      <Card className="overflow-hidden border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-6 py-16 px-8">
          <div className="rounded-2xl bg-muted/50 p-8">
            <FileEdit className="h-16 w-16 text-muted-foreground/70 mx-auto" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-body font-medium">{emptyMessage}</p>
            <p className="text-small text-muted-foreground max-w-sm">
              Create your first content item to get started. Use the editor to draft posts, scripts, and outlines with templates and AI assistance.
            </p>
          </div>
          <Link
            to="/dashboard/content-editor/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium text-small transition-all duration-200 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileEdit className="h-4 w-4" />
            New Content
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Mobile: cards */}
      <div className="block lg:hidden space-y-4">
        {sortedItems.map(renderCard)}
      </div>

      {/* Desktop: table */}
      <Card className="hidden lg:block overflow-hidden transition-shadow duration-200 hover:shadow-card-hover">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b sticky top-0 z-10">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={items.length > 0 && selectedIds.size === items.length}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <SortHeader label="Title" sortKey="title" />
                  <SortHeader label="Channel" sortKey="channel" />
                  <SortHeader label="Due Date" sortKey="due_date" />
                  <SortHeader label="Status" sortKey="status" />
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
                              aria-label="Quick preview (hover or click)"
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

      {previewItem && (
        <QuickPreview
          item={previewItem}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          searchQuery={searchQuery}
        />
      )}
    </>
  )
}
