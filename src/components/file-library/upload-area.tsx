import { useCallback, useState } from 'react'
import {
  Upload,
  X,
  FileImage,
  FileText,
  Loader2,
  AlertCircle,
  FileUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface UploadProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}

/** Derive tag suggestions from file names (e.g. "hero-banner.png" -> ["hero", "banner"]) */
function getAutoTagsFromFiles(files: File[]): string[] {
  const words = new Set<string>()
  for (const f of files) {
    const base = f.name.replace(/\.[^.]+$/, '').toLowerCase()
    base.split(/[-_\s.]+/).forEach((w) => {
      if (w.length >= 2) words.add(w)
    })
  }
  return Array.from(words).slice(0, 5)
}

export interface UploadAreaProps {
  onUpload: (files: File[], tags?: string[]) => Promise<void>
  disabled?: boolean
  suggestedTags?: string[]
  onTagSuggestionClick?: (tag: string) => void
  className?: string
}

/** Empty state when no uploads are in progress */
function UploadQueueEmptyState() {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-muted-foreground/30',
        'bg-muted/20 px-6 py-12 text-center animate-fade-in'
      )}
      role="status"
      aria-label="No files in upload queue"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <FileUp className="h-7 w-7 text-muted-foreground" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-body text-foreground">
          No files in upload queue
        </p>
        <p className="text-small text-muted-foreground max-w-[280px]">
          Drag and drop files above or click the upload area to add files
        </p>
      </div>
    </div>
  )
}

/** Inline error message for individual file upload failures */
function FileUploadError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex items-start gap-2 rounded-md border border-destructive/30',
        'bg-destructive/5 px-3 py-2 mt-2 text-small text-destructive',
        'animate-fade-in'
      )}
    >
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
      <span>{message}</span>
    </div>
  )
}

export function UploadArea({
  onUpload,
  disabled = false,
  suggestedTags = [],
  onTagSuggestionClick,
  className,
}: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [tagsToApply, setTagsToApply] = useState<Set<string>>(new Set())

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled && !isUploading) setIsDragging(true)
    },
    [disabled, isUploading]
  )

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
    },
    []
  )

  const processFiles = useCallback(
    async (files: File[]) => {
      setIsUploading(true)
      const progressItems: UploadProgress[] = files.map((f) => ({
        file: f,
        progress: 0,
        status: 'pending',
      }))
      setUploads(progressItems)

      const autoTags = getAutoTagsFromFiles(files)
      const mergedTags = [...new Set([...tagsToApply, ...autoTags])]

      try {
        for (let i = 0; i < progressItems.length; i++) {
          setUploads((prev) =>
            prev.map((p, idx) =>
              idx === i ? { ...p, status: 'uploading', progress: 50 } : p
            )
          )
        }
        await onUpload(files, mergedTags.length > 0 ? mergedTags : undefined)
        setUploads((prev) =>
          prev.map((p) => ({ ...p, status: 'done', progress: 100 }))
        )
        setTagsToApply(new Set())
        setTimeout(() => setUploads([]), 2000)
      } catch (err) {
        setUploads((prev) =>
          prev.map((p) => ({
            ...p,
            status: 'error',
            error: (err as Error).message,
          }))
        )
      } finally {
        setIsUploading(false)
      }
    },
    [onUpload, tagsToApply]
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      if (disabled || isUploading) return
      const files = Array.from(e.dataTransfer.files).filter((f) => f.size > 0)
      if (files.length === 0) return
      await processFiles(files)
    },
    [disabled, isUploading, processFiles]
  )

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []).filter((f) => f.size > 0)
      if (files.length === 0) return
      await processFiles(files)
      e.target.value = ''
    },
    [processFiles]
  )

  const toggleTag = useCallback((tag: string) => {
    setTagsToApply((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
    onTagSuggestionClick?.(tag)
  }, [onTagSuggestionClick])

  const removeUpload = (index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (file: File) => {
    const type = file.type ?? ''
    if (type.startsWith('image/')) return FileImage
    return FileText
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const isDropZoneDisabled = disabled || isUploading

  return (
    <div className={cn('space-y-4', className)}>
      <Card
        className={cn(
          'relative border-2 border-dashed transition-all duration-300',
          'bg-gradient-to-br from-card to-muted/30',
          isDragging && !isDropZoneDisabled &&
            'border-primary bg-primary/5 scale-[1.01] shadow-lg shadow-primary/10 cursor-pointer',
          !isDropZoneDisabled && 'cursor-pointer hover:border-primary/50 hover:bg-muted/30 hover:shadow-card-hover',
          isDropZoneDisabled && 'opacity-60 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isUploading && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-[inherit] bg-background/80 backdrop-blur-sm pointer-events-auto"
            role="status"
            aria-live="polite"
            aria-label="Uploading files"
          >
            <Loader2
              className="h-12 w-12 animate-spin text-primary mb-4"
              aria-hidden
            />
            <p className="font-medium text-body">Uploading...</p>
            <p className="text-small text-muted-foreground mt-1">
              Please wait while your files are being uploaded
            </p>
          </div>
        )}
        <label
          className={cn(
            'block cursor-pointer',
            isDropZoneDisabled && 'cursor-not-allowed pointer-events-none'
          )}
        >
          <CardContent className="relative flex flex-col items-center justify-center py-16">
            <Upload
              className={cn(
                'h-12 w-12 text-muted-foreground mb-4 transition-transform duration-200',
                !isDropZoneDisabled && 'group-hover:scale-110'
              )}
            />
            <p className="font-medium text-body">
              {isUploading ? 'Upload in progress...' : 'Drag and drop files here'}
            </p>
            <p className="text-small text-muted-foreground mt-1">
              or click to browse · Multi-file supported
            </p>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              disabled={isDropZoneDisabled}
              aria-label="Upload files"
            />
          </CardContent>
        </label>
      </Card>

      {(suggestedTags.length > 0 || tagsToApply.size > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-micro text-muted-foreground">
            Auto-tagging: click to apply to uploads
          </span>
          {suggestedTags.map((tag) => (
            <Badge
              key={tag}
              variant={tagsToApply.has(tag) ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:scale-105',
                tagsToApply.has(tag)
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-primary/10 hover:border-primary/50'
              )}
              onClick={() => toggleTag(tag)}
            >
              {tagsToApply.has(tag) ? '✓ ' : '+ '}{tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-micro font-medium text-muted-foreground">
          Upload queue
        </p>
        {uploads.length > 0 ? (
          <div className="space-y-2 animate-slide-up">
            {uploads.map((item, index) => {
              const Icon = getFileIcon(item.file)
              const isError = item.status === 'error'
              const isUploadingItem = item.status === 'uploading' || item.status === 'pending'
              return (
                <div
                  key={`${item.file.name}-${index}`}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-3 transition-all duration-200',
                    isError
                      ? 'border-destructive/30 bg-destructive/5'
                      : 'border-border bg-card hover:shadow-elevated'
                  )}
                >
                  <div
                    className={cn(
                      'rounded-lg p-2 shrink-0',
                      isError ? 'bg-destructive/10' : 'bg-muted'
                    )}
                  >
                    {isError ? (
                      <AlertCircle
                        className="h-5 w-5 text-destructive"
                        aria-hidden
                      />
                    ) : (
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-small font-medium truncate">
                      {item.file.name}
                    </p>
                    <p className="text-micro text-muted-foreground">
                      {formatSize(item.file.size)}
                      {item.status === 'uploading' && (
                        <span className="ml-2 inline-flex items-center gap-1">
                          <Loader2
                            className="h-3 w-3 animate-spin"
                            aria-hidden
                          />
                          Uploading...
                        </span>
                      )}
                      {item.status === 'done' && (
                        <span className="ml-2 text-success">Done</span>
                      )}
                    </p>
                    {isError && item.error && (
                      <FileUploadError message={item.error} />
                    )}
                    {isUploadingItem && (
                      <div className="mt-2 space-y-1">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        {item.status === 'pending' && (
                          <Skeleton
                            className="h-3 w-20 mt-1"
                            shimmer
                            aria-hidden
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeUpload(index)}
                    aria-label="Remove from queue"
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        ) : (
          <UploadQueueEmptyState />
        )}
      </div>
    </div>
  )
}
