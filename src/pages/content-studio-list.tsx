import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useContentStudioList } from '@/hooks/use-content-studio-list'
import { deleteContentEditor } from '@/lib/content-editor-ops'
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
import type { ContentEditor } from '@/types/content-editor'
import type { ContentStudioListFilters } from '@/types/content-editor'

const PAGE_SIZE = 10

export function ContentStudioListPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<ContentStudioListFilters>({
    page: 1,
    limit: PAGE_SIZE,
  })
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { items, loading, error, refetch, totalCount, page, totalPages } =
    useContentStudioList(filters)

  const selectedItems = items.filter((i) => selectedIds.has(i.id))

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
      setSelectedIds(new Set())
      setDeleteConfirmOpen(false)
      refetch()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setIsDeleting(false)
    }
  }, [selectedItems, refetch])

  const handleBulkStatusChange = useCallback(
    async (_status: string) => {
      toast.info('Bulk status update coming soon')
    },
    []
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

      <ContentStudioToolbar
        filters={filters}
        onFiltersChange={setFilters}
        selectedCount={selectedIds.size}
        onBulkDelete={selectedIds.size > 0 ? handleBulkDelete : undefined}
        onBulkStatusChange={handleBulkStatusChange}
        searchValue={filters.search ?? ''}
        onSearchChange={handleSearchChange}
      />

      {error && (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive"
          role="alert"
        >
          {error}
          <button
            type="button"
            onClick={() => refetch()}
            className="ml-4 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      <ContentTableCards
        items={items}
        isLoading={loading}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        searchQuery={filters.search ?? ''}
        onItemClick={handleItemClick}
      />

      <ContentPagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
      />

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
