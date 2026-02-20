import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { invalidateDashboardRelatedCaches } from '@/lib/cache-invalidate'
import { FileEdit, ClipboardCheck, Clock, BarChart3 } from 'lucide-react'
import {
  useContentStudioList,
  useContentStudioListInfinite,
  useContentStudioStats,
  getUniqueTagsFromItems,
} from '@/hooks/use-content-studio-list'
import {
  deleteContentEditor,
  bulkUpdateContentEditorStatus,
} from '@/lib/content-editor-ops'
import { ContentStudioToolbar } from '@/components/content-studio-list/content-studio-toolbar'
import { ContentTableCards } from '@/components/content-studio-list/content-table-cards'
import { ContentPagination } from '@/components/content-studio-list/content-pagination'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import type { ContentEditor } from '@/types/content-editor'
import type { ContentStudioListFilters } from '@/types/content-editor'

const DEFAULT_PAGE_SIZE = 10

function hasActiveFilters(filters: ContentStudioListFilters): boolean {
  return !!(
    filters.search?.trim() ||
    filters.status ||
    filters.channel ||
    filters.assignee ||
    (filters.tags && filters.tags.length > 0)
  )
}

export function ContentStudioListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<ContentStudioListFilters>({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  })
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)
  const [useInfiniteScroll, setUseInfiniteScroll] = useState(false)

  const baseFilters = {
    status: filters.status,
    channel: filters.channel,
    assignee: filters.assignee,
    tags: filters.tags,
    search: filters.search,
    limit: filters.limit,
  }

  const paginated = useContentStudioList(filters)
  const infinite = useContentStudioListInfinite(baseFilters)

  const items = useInfiniteScroll ? infinite.items : paginated.items
  const loading = useInfiniteScroll ? infinite.loading : paginated.loading
  const error = useInfiniteScroll ? infinite.error : paginated.error
  const refetch = useInfiniteScroll ? infinite.refetch : paginated.refetch
  const totalCount = useInfiniteScroll ? infinite.totalCount : paginated.totalCount
  const page = useInfiniteScroll ? infinite.page : paginated.page
  const totalPages = useInfiniteScroll ? infinite.totalPages : paginated.totalPages

  const { stats, loading: statsLoading, refetch: refetchStats } = useContentStudioStats()

  const selectedItems = items.filter((i) => selectedIds.has(i.id))

  const emptyMessage = useMemo(
    () =>
      hasActiveFilters(filters)
        ? 'No content matches your filters. Try adjusting search or filters.'
        : 'No content items yet. Create your first content to get started.',
    [filters]
  )

  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      search: value || undefined,
      page: 1,
    }))
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
  }, [])

  const handlePageSizeChange = useCallback((limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 }))
  }, [])

  const handleLoadMore = useCallback(() => {
    infinite.loadMore()
  }, [infinite])

  const handleBulkDelete = useCallback(() => {
    setDeleteConfirmOpen(true)
  }, [])

  const confirmBulkDelete = useCallback(async () => {
    if (selectedItems.length === 0) return
    setIsDeleting(true)
    try {
      for (const item of selectedItems) {
        await deleteContentEditor(item.id)
      }
      toast.success(`${selectedItems.length} item(s) deleted`)
      invalidateDashboardRelatedCaches(queryClient)
      setSelectedIds(new Set())
      setDeleteConfirmOpen(false)
      refetch()
      refetchStats()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setIsDeleting(false)
    }
  }, [selectedItems, refetch, queryClient])

  const handleBulkStatusChange = useCallback(
    async (status: string) => {
      if (selectedItems.length === 0) return
      setIsBulkUpdating(true)
      try {
        await bulkUpdateContentEditorStatus(
          selectedItems.map((i) => i.id),
          status
        )
        toast.success(`${selectedItems.length} item(s) marked as ${status}`)
        invalidateDashboardRelatedCaches(queryClient)
        setSelectedIds(new Set())
        refetch()
        refetchStats()
      } catch (e) {
        toast.error((e as Error).message)
      } finally {
        setIsBulkUpdating(false)
      }
    },
    [selectedItems, refetch, queryClient]
  )

  const handleItemClick = useCallback(
    (item: ContentEditor) => {
      navigate(`/dashboard/content-editor/${item.id}`)
    },
    [navigate]
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h1 font-bold">Content Studio</h1>
          <p className="text-muted-foreground mt-1">
            List and manage content items and briefs across projects
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4 flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-10" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-card-hover border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <ClipboardCheck className="h-6 w-6 text-primary" aria-hidden />
                </div>
                <div>
                  <p className="text-micro text-muted-foreground font-medium">Pending review</p>
                  <p className="text-h3 font-bold">{stats.pendingReview}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-card-hover">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <FileEdit className="h-6 w-6 text-muted-foreground" aria-hidden />
                </div>
                <div>
                  <p className="text-micro text-muted-foreground font-medium">Drafts</p>
                  <p className="text-h3 font-bold">{stats.draft}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-card-hover">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <Clock className="h-6 w-6 text-muted-foreground" aria-hidden />
                </div>
                <div>
                  <p className="text-micro text-muted-foreground font-medium">Scheduled</p>
                  <p className="text-h3 font-bold">{stats.scheduled}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-card-hover">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <BarChart3 className="h-6 w-6 text-muted-foreground" aria-hidden />
                </div>
                <div>
                  <p className="text-micro text-muted-foreground font-medium">Total items</p>
                  <p className="text-h3 font-bold">{stats.total}</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ContentStudioToolbar
        filters={filters}
        onFiltersChange={setFilters}
        selectedCount={selectedIds.size}
        onBulkDelete={selectedIds.size > 0 ? handleBulkDelete : undefined}
        onBulkStatusChange={handleBulkStatusChange}
        isBulkUpdating={isBulkUpdating}
        searchValue={filters.search ?? ''}
        onSearchChange={handleSearchChange}
        suggestedTags={getUniqueTagsFromItems(items)}
      />

      {error ? (
        <ErrorState
          title="Failed to load content"
          description={error}
          onRetry={refetch}
          retryLabel="Try again"
          buttonAriaLabel="Retry loading content"
          className="min-h-[280px]"
        />
      ) : (
        <>
          <ContentTableCards
            items={items}
            isLoading={loading}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            searchQuery={filters.search ?? ''}
            onItemClick={handleItemClick}
            emptyMessage={emptyMessage}
          />

          <ContentPagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={filters.limit ?? DEFAULT_PAGE_SIZE}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            useInfiniteScroll={useInfiniteScroll}
            onLoadMore={handleLoadMore}
            isLoading={loading}
            hasMore={page < totalPages}
            onViewModeChange={setUseInfiniteScroll}
          />
        </>
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected content?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedItems.length} item(s). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ContentStudioListPage
