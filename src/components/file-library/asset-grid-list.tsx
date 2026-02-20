import { useState } from 'react'
import {
  Grid3X3,
  List,
  FileImage,
  FileText,
  ImageIcon,
  FolderSearch,
  ChevronUp,
  ChevronDown,
  Loader2,
  Upload,
} from 'lucide-react'
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
import type { FileLibrary } from '@/types/file-library'
import { highlightSearchText } from '@/hooks/use-file-library'
import { cn } from '@/lib/utils'

type SortKey = 'title' | 'file_type' | 'updated_at' | 'last_used_at' | 'version'
type SortDir = 'asc' | 'desc'

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  return d.toLocaleDateString(undefined, { dateStyle: 'short' })
}

function getThumbnailIcon(item: FileLibrary) {
  const type = item.file_type ?? ''
  if (type.startsWith('image/')) return FileImage
  return FileText
}

export interface AssetGridListProps {
  items: FileLibrary[]
  isLoading?: boolean
  /** When true, disables interactions and shows loading overlay during bulk actions */
  isActionLoading?: boolean
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
  searchQuery?: string
  onItemClick?: (item: FileLibrary) => void
  emptyMessage?: string
}

export function AssetGridList({
  items,
  isLoading,
  isActionLoading = false,
  selectedIds,
  onSelectionChange,
  searchQuery = '',
  onItemClick,
  emptyMessage = 'No assets yet',
}: AssetGridListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortKey, setSortKey] = useState<SortKey>('updated_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const safeItems = Array.isArray(items) ? items : []
  const sortedItems = [...safeItems].sort((a, b) => {
    let aVal: string | number | null = null
    let bVal: string | number | null = null
    switch (sortKey) {
      case 'title':
        aVal = a.title ?? ''
        bVal = b.title ?? ''
        break
      case 'file_type':
        aVal = a.file_type ?? ''
        bVal = b.file_type ?? ''
        break
      case 'updated_at':
        aVal = new Date(a.updated_at).getTime()
        bVal = new Date(b.updated_at).getTime()
        break
      case 'last_used_at':
        aVal = a.last_used_at ? new Date(a.last_used_at).getTime() : 0
        bVal = b.last_used_at ? new Date(b.last_used_at).getTime() : 0
        break
      case 'version':
        aVal = a.version ?? 0
        bVal = b.version ?? 0
        break
    }
    const cmp = (aVal ?? '') < (bVal ?? '') ? -1 : (aVal ?? '') > (bVal ?? '') ? 1 : 0
    return sortDir === 'asc' ? cmp : -cmp
  })

  const toggleSelectAll = () => {
    if (selectedIds.size === safeItems.length) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(safeItems.map((i) => i.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange(next)
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

  const renderGridCard = (item: FileLibrary) => {
    const Icon = getThumbnailIcon(item)
    const displayName = item.file_name ?? item.title
    return (
      <Card
        key={item.id}
        className={cn(
          'overflow-hidden cursor-pointer transition-all duration-200',
          'hover:shadow-card-hover hover:shadow-primary/5 hover:border-primary/30 hover:scale-[1.02] active:scale-[0.98]',
          'border border-transparent hover:border-primary/20'
        )}
        onClick={() => onItemClick?.(item)}
      >
        <div className="aspect-square bg-muted flex items-center justify-center relative group">
          {item.storage_path && item.file_type?.startsWith('image/') ? (
            <img
              src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/file-library/${item.storage_path}`}
              alt={displayName}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <Icon className="h-16 w-16 text-muted-foreground" />
          )}
          {item.version && item.version > 1 && (
            <Badge
              variant="secondary"
              className="absolute bottom-2 right-2 text-micro"
            >
              v{item.version}
            </Badge>
          )}
        </div>
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Checkbox
              checked={selectedIds.has(item.id)}
              onCheckedChange={() => toggleSelect(item.id)}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Select ${displayName}`}
            />
            <div className="flex-1 min-w-0">
              <p
                className="font-medium text-small truncate"
                dangerouslySetInnerHTML={{
                  __html:
                    highlightSearchText(displayName, searchQuery) || displayName,
                }}
              />
              <div className="flex flex-wrap gap-1 mt-1">
                {(item.tags ?? []).slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-micro px-1.5"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="text-micro text-muted-foreground mt-1">
                {formatDate(item.last_used_at ?? item.updated_at)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderLoadingState = () => {
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton
              key={i}
              className="aspect-square rounded-xl"
              shimmer
              aria-hidden
            />
          ))}
        </div>
      )
    }
    return (
      <Card className="overflow-hidden transition-shadow duration-200">
        <CardContent className="p-0">
          <div
            className="overflow-x-auto"
            role="status"
            aria-label="Loading assets"
          >
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b">
                  <TableHead className="w-12">
                    <Skeleton className="h-4 w-4 rounded" shimmer />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead>Version</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <TableRow key={i} className="border-b">
                    <TableCell>
                      <Skeleton className="h-4 w-4 rounded" shimmer />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" shimmer />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" shimmer />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" shimmer />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-8 rounded-full" shimmer />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderEmptyState = () => {
    const isFiltered = Boolean(searchQuery?.trim())
    const Icon = isFiltered ? FolderSearch : ImageIcon
    const title = isFiltered ? 'No results found' : emptyMessage
    const description = isFiltered
      ? `No assets match "${searchQuery}". Try a different search term or clear filters.`
      : 'Upload your first asset to get started. Drag and drop files above or click to browse.'

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => setViewMode('list')}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        <Card
          className="overflow-hidden border-dashed border-2 border-muted-foreground/30 animate-fade-in transition-shadow duration-200 hover:shadow-card"
          role="status"
          aria-live="polite"
        >
          <CardContent className="flex flex-col items-center justify-center gap-6 py-16 px-8 min-h-[280px]">
            <div className="rounded-2xl bg-muted/50 p-8 ring-1 ring-muted/80 flex items-center justify-center">
              <Icon
                className="h-16 w-16 text-muted-foreground/70"
                aria-hidden
              />
            </div>
            <div className="text-center space-y-2 max-w-sm">
              <p className="text-body font-semibold text-foreground">{title}</p>
              <p className="text-small text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
            {!isFiltered && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Upload className="h-5 w-5" aria-hidden />
                <span className="text-small">Use the upload area above to add files</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => setViewMode('list')}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        {renderLoadingState()}
      </div>
    )
  }

  if (sortedItems.length === 0) {
    return renderEmptyState()
  }

  const ViewToggleBar = () => (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
        size="icon-sm"
        onClick={() => setViewMode('grid')}
        aria-label="Grid view"
        disabled={isActionLoading}
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
        size="icon-sm"
        onClick={() => setViewMode('list')}
        aria-label="List view"
        disabled={isActionLoading}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <div className="space-y-4 relative">
      <ViewToggleBar />

      <div className={cn('relative', isActionLoading && 'pointer-events-none opacity-60')}>
        {isActionLoading && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-background/60 backdrop-blur-[2px]"
            role="status"
            aria-live="polite"
            aria-label="Processing bulk action"
          >
            <Loader2
              className="h-10 w-10 animate-spin text-primary"
              aria-hidden
            />
            <p className="mt-2 text-small font-medium text-muted-foreground">
              Processing...
            </p>
          </div>
        )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sortedItems.map(renderGridCard)}
        </div>
      ) : (
        <Card className="overflow-hidden transition-shadow duration-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50 border-b sticky top-0 z-10">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          safeItems.length > 0 && selectedIds.size === safeItems.length
                        }
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <SortHeader label="Name" sortKey="title" />
                    <SortHeader label="Type" sortKey="file_type" />
                    <SortHeader label="Last used" sortKey="last_used_at" />
                    <TableHead>Version</TableHead>
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
                      onClick={() => onItemClick?.(item)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(item.id)}
                          onCheckedChange={() => toggleSelect(item.id)}
                          aria-label={`Select ${item.title}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <span
                          dangerouslySetInnerHTML={{
                            __html:
                              highlightSearchText(
                                item.file_name ?? item.title,
                                searchQuery
                              ) || (item.file_name ?? item.title),
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-small">
                        {item.file_type ?? '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-small">
                        {formatDate(item.last_used_at ?? item.updated_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-micro">
                          v{item.version ?? 1}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  )
}
