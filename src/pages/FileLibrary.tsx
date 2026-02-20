import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useFileLibrary } from '@/hooks/use-file-library'
import {
  createFileLibrary,
  bulkDeleteFileLibrary,
  bulkTagFileLibrary,
  uploadFile,
} from '@/lib/file-library-ops'
import { SearchFilters } from '@/components/file-library/search-filters'
import { UploadArea } from '@/components/file-library/upload-area'
import { AssetGridList } from '@/components/file-library/asset-grid-list'
import { AssetDetailPanel } from '@/components/file-library/asset-detail-panel'
import { BulkActions } from '@/components/file-library/bulk-actions'
import { ContentPagination } from '@/components/content-studio-list/content-pagination'
import type { FileLibrary } from '@/types/file-library'
import type { FileLibraryFilters } from '@/types/file-library'

const DEFAULT_PAGE_SIZE = 12

export function FileLibraryPage() {
  const [filters, setFilters] = useState<FileLibraryFilters>({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  })
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [detailItem, setDetailItem] = useState<FileLibrary | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTagging, setIsTagging] = useState(false)

  const { items, loading, error, refetch, totalCount, page, totalPages } =
    useFileLibrary(filters)

  const selectedItems = items.filter((i) => selectedIds.has(i.id))

  const allTags = Array.from(
    new Set(items.flatMap((i) => i.tags ?? []))
  ).slice(0, 8)

  const handleUpload = useCallback(
    async (files: File[]) => {
      try {
        for (const file of files) {
          const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
          await uploadFile(file, path)
          await createFileLibrary({
            title: file.name,
            file_name: file.name,
            file_type: file.type || undefined,
            file_size: file.size,
            storage_path: path,
            tags: [],
          })
        }
        toast.success(`${files.length} file(s) uploaded`)
        refetch()
      } catch (e) {
        toast.error((e as Error).message)
        throw e
      }
    },
    [refetch]
  )

  const handleBulkDelete = useCallback(async () => {
    if (selectedItems.length === 0) return
    setIsDeleting(true)
    try {
      await bulkDeleteFileLibrary(selectedItems.map((i) => i.id))
      toast.success(`${selectedItems.length} asset(s) deleted`)
      setSelectedIds(new Set())
      refetch()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setIsDeleting(false)
    }
  }, [selectedItems, refetch])

  const handleBulkTag = useCallback(
    async (tags: string[]) => {
      if (selectedItems.length === 0 || tags.length === 0) return
      setIsTagging(true)
      try {
        await bulkTagFileLibrary(
          selectedItems.map((i) => i.id),
          tags
        )
        toast.success(`Tags added to ${selectedItems.length} asset(s)`)
        setSelectedIds(new Set())
        refetch()
      } catch (e) {
        toast.error((e as Error).message)
      } finally {
        setIsTagging(false)
      }
    },
    [selectedItems, refetch]
  )

  const handleExport = useCallback(() => {
    if (selectedItems.length === 0) return
    toast.info('Export feature coming soon')
  }, [selectedItems])

  const handleItemClick = useCallback((item: FileLibrary) => {
    setDetailItem(item)
    setDetailOpen(true)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
  }, [])

  const handlePageSizeChange = useCallback((limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 }))
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h1 font-bold">File Library</h1>
          <p className="text-muted-foreground mt-1">
            Central asset manager for uploading, tagging, versioning, and linking
            assets to content projects
          </p>
        </div>
      </div>

      <SearchFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableTags={allTags}
      />

      <UploadArea
        onUpload={handleUpload}
        suggestedTags={allTags.slice(0, 4)}
      />

      <BulkActions
        selectedCount={selectedIds.size}
        onDelete={selectedIds.size > 0 ? handleBulkDelete : undefined}
        onTag={selectedIds.size > 0 ? handleBulkTag : undefined}
        onExport={selectedIds.size > 0 ? handleExport : undefined}
        isDeleting={isDeleting}
        isTagging={isTagging}
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

      <AssetGridList
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
        pageSize={filters.limit ?? DEFAULT_PAGE_SIZE}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      <AssetDetailPanel
        item={detailItem}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}

export default FileLibraryPage
