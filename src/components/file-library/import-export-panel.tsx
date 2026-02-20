import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  X,
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
  const [importDrag, setImportDrag] = useState(false)

  const handleExport = useCallback(
    async (scope: 'selected' | 'all') => {
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
        toast.error((e as Error).message)
      } finally {
        setIsExporting(false)
      }
    },
    [exportFormat, selectedIds, onExportComplete]
  )

  const handleImportFile = useCallback(
    async (file: File) => {
      setImportError(null)
      const ext = file.name.split('.').pop()?.toLowerCase()
      const format = ext === 'csv' ? 'csv' : 'json'
      const text = await file.text()
      setIsImporting(true)
      try {
        const { imported } = await importFileLibrary(format, text)
        toast.success(`${imported} asset(s) imported`)
        onImportComplete?.()
        return imported
      } catch (e) {
        setImportError((e as Error).message)
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

  return (
    <Card
      className={cn(
        'overflow-hidden border-2 transition-all duration-300',
        'bg-gradient-to-br from-card to-muted/20',
        'hover:shadow-card-hover hover:shadow-primary/5 hover:border-primary/30',
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-h3 flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          Data Import / Export
        </CardTitle>
        <p className="text-small text-muted-foreground">
          Import content from CSV/JSON or export assets for backup and migration
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger
              value="import"
              className="transition-all duration-200 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </TabsTrigger>
            <TabsTrigger
              value="export"
              className="transition-all duration-200 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4">
            <div
              className={cn(
                'rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 cursor-pointer',
                importDrag && 'border-primary bg-primary/5 scale-[1.01]',
                'hover:border-primary/50 hover:bg-muted/30'
              )}
              onDragOver={(e) => {
                e.preventDefault()
                setImportDrag(true)
              }}
              onDragLeave={() => setImportDrag(false)}
              onDrop={handleImportDrop}
            >
              <label className="block cursor-pointer">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium text-body">
                  Drag and drop CSV or JSON here
                </p>
                <p className="text-small text-muted-foreground mt-1">
                  or click to browse · Supports title, description, tags, file_type
                </p>
                <input
                  type="file"
                  accept=".csv,.json"
                  className="hidden"
                  onChange={handleImportSelect}
                  disabled={isImporting}
                />
              </label>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-micro font-medium text-muted-foreground mb-2">
                Import from Google Docs
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="opacity-60 cursor-not-allowed"
              >
                Connect Google (coming soon)
              </Button>
            </div>

            {importError && (
              <div
                className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive text-small animate-slide-up"
                role="alert"
              >
                {importError}
                <button
                  type="button"
                  onClick={() => setImportError(null)}
                  className="ml-auto p-1 hover:bg-destructive/10 rounded"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {isImporting && (
              <div className="flex items-center gap-2 text-small text-muted-foreground">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Importing...
              </div>
            )}
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="export-format" className="text-micro font-medium">
                Export format
              </Label>
              <Select
                id="export-format"
                options={EXPORT_FORMAT_OPTIONS}
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button
                className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => handleExport('selected')}
                disabled={isExporting || selectedIds.size === 0}
              >
                {isExporting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export selected ({selectedIds.size} items)
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleExport('all')}
                disabled={isExporting || totalCount === 0}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export all ({totalCount} items)
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
