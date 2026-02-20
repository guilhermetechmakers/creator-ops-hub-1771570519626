import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Download,
  Upload,
  FileSpreadsheet,
  X,
  Inbox,
  FileDown,
  RefreshCw,
  AlertCircle,
  FileX2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, type SelectOption } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  exportFileLibrary,
  importFileLibrary,
  type ExportFormat,
} from '@/lib/file-library-ops'
import { cn } from '@/lib/utils'

const EXPORT_FORMAT_OPTIONS: SelectOption[] = [
  { value: 'json', label: 'JSON' },
  { value: 'csv', label: 'CSV' },
]

/** Normalize import errors into user-friendly messages */
function normalizeImportError(raw: string): string {
  const lower = raw.toLowerCase()
  if (lower.includes('json') && (lower.includes('parse') || lower.includes('invalid') || lower.includes('unexpected'))) {
    return 'Invalid JSON format. Please ensure your file contains valid JSON.'
  }
  if (lower.includes('csv') && (lower.includes('parse') || lower.includes('invalid'))) {
    return 'Invalid CSV format. Please ensure your file has valid headers and rows.'
  }
  if (lower.includes('not authenticated') || lower.includes('unauthorized')) {
    return 'Session expired. Please sign in again and try importing.'
  }
  if (lower.includes('required') || lower.includes('missing')) {
    return 'File is missing required fields. Expected: title, description, tags, file_type.'
  }
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed')) {
    return 'Network error. Please check your connection and try again.'
  }
  return raw
}

export interface ImportExportPanelProps {
  selectedIds: Set<string>
  totalCount: number
  onImportComplete?: () => void
  onExportComplete?: () => void
  className?: string
}

export function ImportExportPanel({
  selectedIds,
  totalCount,
  onImportComplete,
  onExportComplete,
  className,
}: ImportExportPanelProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json')
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [importDrag, setImportDrag] = useState(false)
  const [importZeroItems, setImportZeroItems] = useState(false)

  const handleExport = useCallback(
    async (scope: 'selected' | 'all') => {
      setExportError(null)
      setIsExporting(true)
      try {
        const ids = scope === 'selected' && selectedIds.size > 0
          ? Array.from(selectedIds)
          : undefined
        const result = await exportFileLibrary(exportFormat, ids)
        const content =
          result.format === 'csv'
            ? String(result.data)
            : JSON.stringify(result.data, null, 2)
        const ext = result.format === 'csv' ? 'csv' : 'json'
        const mime =
          result.format === 'csv' ? 'text/csv' : 'application/json'
        const blob = new Blob([content], { type: mime })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `file-library-export-${Date.now()}.${ext}`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Export completed')
        onExportComplete?.()
      } catch (e) {
        const message = (e as Error).message
        setExportError(message)
        toast.error(message)
      } finally {
        setIsExporting(false)
      }
    },
    [exportFormat, selectedIds, onExportComplete]
  )

  const handleImportFile = useCallback(
    async (file: File) => {
      setImportError(null)
      setImportZeroItems(false)
      const ext = file.name.split('.').pop()?.toLowerCase()
      const format = ext === 'csv' ? 'csv' : 'json'
      const text = await file.text()
      setIsImporting(true)
      try {
        const { imported } = await importFileLibrary(format, text)
        if (imported === 0) {
          setImportZeroItems(true)
          toast.info('No valid assets found in file')
        } else {
          toast.success(`${imported} asset(s) imported`)
        }
        onImportComplete?.()
        return imported
      } catch (e) {
        setImportError(normalizeImportError((e as Error).message))
        throw e
      } finally {
        setIsImporting(false)
      }
    },
    [onImportComplete]
  )

  const handleImportDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setImportDrag(false)
      const file = e.dataTransfer.files[0]
      if (!file) return
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (ext !== 'csv' && ext !== 'json') {
        setImportError('Only CSV or JSON files are supported')
        return
      }
      handleImportFile(file)
    },
    [handleImportFile]
  )

  const handleImportSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      handleImportFile(file)
      e.target.value = ''
    },
    [handleImportFile]
  )

  const isBusy = isImporting || isExporting
  const hasExportData = totalCount > 0
  const hasSelectedForExport = selectedIds.size > 0

  return (
    <Card
      className={cn(
        'overflow-hidden border-2 transition-all duration-300',
        'bg-gradient-to-br from-card to-muted/20',
        'hover:shadow-card-hover hover:shadow-primary/5 hover:border-primary/30',
        className
      )}
      aria-label="Import and export file library"
      aria-busy={isBusy}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-h3 flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" aria-hidden />
          Data Import / Export
        </CardTitle>
        <p className="text-small text-muted-foreground">
          Import content from CSV/JSON or export assets for backup and migration
        </p>
      </CardHeader>
      <CardContent className="relative">
        {/* Page-level loading overlay during import/export */}
        {isBusy && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm animate-fade-in"
            role="status"
            aria-live="polite"
            aria-label={isImporting ? 'Importing file library' : 'Exporting file library'}
          >
            <div className="flex flex-col items-center gap-4 p-6 rounded-xl border bg-card shadow-elevated min-w-[200px]">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20" aria-hidden />
                <div
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"
                  style={{ animationDuration: '0.8s' }}
                  aria-hidden
                />
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-sm font-medium text-foreground">
                  {isImporting ? 'Importing assets...' : 'Preparing export...'}
                </p>
                <p className="text-small text-muted-foreground">
                  {isImporting ? 'Please wait while we process your file' : 'Generating your download'}
                </p>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="import" className="w-full">
          <TabsList
            className="grid w-full grid-cols-2 mb-4"
            role="tablist"
            aria-label="Import and export tabs"
          >
            <TabsTrigger
              value="import"
              className="transition-all duration-200 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              aria-label="Import tab - upload CSV or JSON files"
            >
              <Upload className="h-4 w-4 mr-2" aria-hidden />
              Import
            </TabsTrigger>
            <TabsTrigger
              value="export"
              className="transition-all duration-200 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              aria-label="Export tab - download file library as JSON or CSV"
            >
              <Download className="h-4 w-4 mr-2" aria-hidden />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4" role="region" aria-label="Import section">
            {/* Import empty state: file processed with 0 valid items */}
            {importZeroItems && (
              <div
                className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border-2 border-dashed border-muted bg-muted/20 p-6 sm:p-8 min-h-[160px] animate-fade-in"
                role="status"
                aria-live="polite"
                id="import-zero-items-state"
              >
                <div className="rounded-2xl bg-muted/50 p-4 ring-1 ring-muted/80 flex-shrink-0">
                  <FileX2 className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/70" aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">No valid assets in file</p>
                  <p className="text-small text-muted-foreground mt-1">
                    The file was processed but contained no valid rows. Ensure your CSV or JSON has the required fields: title, description, tags, file_type.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      setImportZeroItems(false)
                      document.getElementById('import-file-input')?.click()
                    }}
                    aria-label="Try another file"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" aria-hidden />
                    Try another file
                  </Button>
                </div>
              </div>
            )}

            {/* Import drop zone - empty state CTA */}
            <label
              htmlFor="import-file-input"
              className={cn(
                'block rounded-xl border-2 border-dashed p-6 sm:p-8 text-center transition-all duration-300 cursor-pointer min-h-[200px] flex flex-col items-center justify-center',
                importDrag && 'border-primary bg-primary/5 scale-[1.01]',
                'hover:border-primary/50 hover:bg-muted/30',
                isImporting && 'pointer-events-none opacity-70'
              )}
              onDragOver={(e) => {
                e.preventDefault()
                if (!isImporting) setImportDrag(true)
              }}
              onDragLeave={() => setImportDrag(false)}
              onDrop={handleImportDrop}
              aria-label="Import file - drag and drop CSV or JSON here, or click to browse"
            >
              <div className="rounded-2xl bg-muted/50 p-6 ring-1 ring-muted/80 mb-4">
                <Inbox
                  className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/70 mx-auto"
                  aria-hidden
                />
              </div>
              <p className="font-medium text-body">
                No file imported yet
              </p>
              <p className="text-small text-muted-foreground mt-1">
                Drag and drop CSV or JSON here, or click to browse
              </p>
              <p className="text-micro text-muted-foreground mt-2">
                Supports title, description, tags, file_type
              </p>
              <input
                id="import-file-input"
                type="file"
                accept=".csv,.json"
                className="sr-only"
                onChange={handleImportSelect}
                disabled={isImporting}
                aria-label="Choose CSV or JSON file to import"
              />
            </label>

            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-micro font-medium text-muted-foreground mb-2">
                Import from Google Docs
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="opacity-60 cursor-not-allowed"
                aria-label="Connect Google - coming soon"
              >
                Connect Google (coming soon)
              </Button>
            </div>

            {/* Import error state - inline with retry and user-friendly message */}
            {importError && (
              <div
                id="import-error-message"
                className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive text-small animate-slide-up"
                role="alert"
                aria-live="assertive"
                aria-describedby="import-error-description"
              >
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden />
                  <div className="min-w-0" id="import-error-description">
                    <p className="font-medium">Import failed</p>
                    <p className="text-muted-foreground mt-0.5">{importError}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImportError(null)
                      document.getElementById('import-file-input')?.click()
                    }}
                    aria-label="Try again - choose another file"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" aria-hidden />
                    Try again
                  </Button>
                  <button
                    type="button"
                    onClick={() => setImportError(null)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                    aria-label="Dismiss import error"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
            )}

            {isImporting && (
              <div
                className="flex items-center gap-2 text-small text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                <div
                  className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"
                  aria-hidden
                />
                <span>Importing assets...</span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="export" className="space-y-4" role="region" aria-label="Export section">
            {/* Export empty state - no items in library */}
            {!hasExportData ? (
              <div
                className="flex flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed border-muted bg-muted/20 p-8 sm:p-12 min-h-[240px] animate-fade-in"
                role="status"
                aria-live="polite"
                aria-label="No assets to export - add or import assets first"
              >
                <div className="rounded-2xl bg-muted/50 p-6 ring-1 ring-muted/80">
                  <FileDown
                    className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/70"
                    aria-hidden
                  />
                </div>
                <div className="text-center space-y-2 max-w-sm">
                  <p className="text-body font-semibold text-foreground">
                    No assets to export yet
                  </p>
                  <p className="text-small text-muted-foreground leading-relaxed">
                    Add assets to your file library first, or import from CSV/JSON to get started.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="export-format" className="text-micro font-medium">
                    Export format
                  </Label>
                  <Select
                    id="export-format"
                    options={EXPORT_FORMAT_OPTIONS}
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                    aria-label="Choose export format: JSON or CSV"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  {!hasSelectedForExport && (
                    <p className="text-small text-muted-foreground flex items-center gap-2" role="status">
                      <span>Select items from the table above to export a subset.</span>
                    </p>
                  )}
                  <Button
                    className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => handleExport('selected')}
                    disabled={isExporting || !hasSelectedForExport}
                    aria-label={
                      hasSelectedForExport
                        ? `Export selected ${selectedIds.size} items`
                        : 'Export selected - select items from the table first'
                    }
                  >
                    {isExporting ? (
                      <>
                        <div
                          className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                          aria-hidden
                        />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" aria-hidden />
                        Export selected ({selectedIds.size} items)
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => handleExport('all')}
                    disabled={isExporting}
                    aria-label={`Export all ${totalCount} items`}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" aria-hidden />
                    Export all ({totalCount} items)
                  </Button>
                </div>

                {/* Export error state - inline with retry */}
                {exportError && (
                  <div
                    id="export-error-message"
                    className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive text-small animate-slide-up"
                    role="alert"
                    aria-live="assertive"
                    aria-describedby="export-error-description"
                  >
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden />
                      <div className="min-w-0" id="export-error-description">
                        <p className="font-medium">Export failed</p>
                        <p className="text-muted-foreground mt-0.5">{exportError}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport('all')}
                        aria-label="Retry export"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" aria-hidden />
                        Retry
                      </Button>
                      <button
                        type="button"
                        onClick={() => setExportError(null)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                        aria-label="Dismiss export error"
                      >
                        <X className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
