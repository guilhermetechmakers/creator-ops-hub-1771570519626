import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useFileLibrary } from '@/hooks/use-file-library'
import {
  createFileLibrary,
  bulkDeleteFileLibrary,
  bulkTagFileLibrary,
  uploadFile,
  exportFileLibrary,
} from '@/lib/file-library-ops'
import { SearchFilters } from '@/components/file-library/search-filters'
import { UploadArea } from '@/components/file-library/upload-area'
import { ImportExportPanel } from '@/components/file-library/import-export-panel'
import { AssetGridList } from '@/components/file-library/asset-grid-list'
import { AssetDetailPanel } from '@/components/file-library/asset-detail-panel'
import { BulkActions } from '@/components/file-library/bulk-actions'
import { ContentPagination } from '@/components/content-studio-list/content-pagination'
import type { FileLibrary } from '@/types/file-library'
import type { FileLibraryFilters } from '@/types/file-library'

const DEFAULT_PAGE_SIZE = 12

export function FileLibraryPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<FileLibraryFilters>({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  })
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [detailItem, setDetailItem] = useState<FileLibrary | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTagging, setIsTagging] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const { items, loading, error, refetch, totalCount, page, totalPages } =
    useFileLibrary(filters)

  const selectedItems = items.filter((i) => selectedIds.has(i.id))

  useEffect(() => {
    document.title = 'File Library | Creator Ops Hub'
  }, [])

  const allTags = Array.from(
    new Set(items.flatMap((i) => i.tags ?? []))
  ).slice(0, 8)

  const handleUpload = useCallback(
    async (files: File[], tags?: string[]) => {
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
            tags: tags ?? [],
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

  const handleExport = useCallback(async () => {
    if (selectedItems.length === 0) return
    setIsExporting(true)
    try {
      const result = await exportFileLibrary('json', selectedItems.map((i) => i.id))
      const content = JSON.stringify(result.data, null, 2)
      const blob = new Blob([content], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `file-library-export-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export completed')
      setSelectedIds(new Set())
      refetch()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setIsExporting(false)
    }
  }, [selectedItems, refetch])

  const handleItemClick = useCallback((item: FileLibrary) => {
    setDetailItem(item)
    setDetailOpen(true)
  }, [])

  const handleInsertIntoEditor = useCallback((asset: FileLibrary) => {
    const url =
      asset.storage_path && asset.file_type?.startsWith('image/')
        ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/file-library/${asset.storage_path}`
        : null
    navigate('/dashboard/content-editor/new', {
      state: { insertAsset: { ...asset, previewUrl: url } },
    })
  }, [navigate])

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
          <h1 className="text-h1 font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            File Library
          </h1>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <BulkActions
            selectedCount={selectedIds.size}
            onDelete={selectedIds.size > 0 ? handleBulkDelete : undefined}
            onTag={selectedIds.size > 0 ? handleBulkTag : undefined}
            onExport={selectedIds.size > 0 ? handleExport : undefined}
            isDeleting={isDeleting}
            isTagging={isTagging}
            isExporting={isExporting}
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
            onInsertIntoEditor={handleInsertIntoEditor}
          />
        </div>

        <div className="lg:col-span-1">
          <ImportExportPanel
            selectedIds={selectedIds}
            totalCount={totalCount}
            onImportComplete={refetch}
            onExportComplete={refetch}
          />
        </div>
      </div>
    </div>
  )
}

export default FileLibraryPage
