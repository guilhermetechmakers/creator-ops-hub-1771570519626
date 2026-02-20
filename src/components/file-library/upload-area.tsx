import { useCallback, useState } from 'react'
import { Upload, X, FileImage, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
      if (!disabled) setIsDragging(true)
    },
    [disabled]
  )

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
    },
    []
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
    [disabled, isUploading]
  )

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []).filter((f) => f.size > 0)
      if (files.length === 0) return
      await processFiles(files)
      e.target.value = ''
    },
    []
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

  const processFiles = async (files: File[]) => {
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
  }

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

  return (
    <div className={cn('space-y-4', className)}>
      <Card
        className={cn(
          'border-2 border-dashed transition-all duration-300 cursor-pointer',
          'bg-gradient-to-br from-card to-muted/30',
          isDragging && !disabled && 'border-primary bg-primary/5 scale-[1.01] shadow-lg shadow-primary/10',
          disabled && 'opacity-50 cursor-not-allowed',
          'hover:border-primary/50 hover:bg-muted/30 hover:shadow-card-hover'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label className="block cursor-pointer">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Upload className="h-12 w-12 text-muted-foreground mb-4 transition-transform duration-200 group-hover:scale-110" />
            <p className="font-medium text-body">Drag and drop files here</p>
            <p className="text-small text-muted-foreground mt-1">
              or click to browse · Multi-file supported
            </p>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              disabled={disabled || isUploading}
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

      {uploads.length > 0 && (
        <div className="space-y-2 animate-slide-up">
          <p className="text-micro font-medium text-muted-foreground">
            Upload progress
          </p>
          <div className="space-y-2">
            {uploads.map((item, index) => {
              const Icon = getFileIcon(item.file)
              return (
                <div
                  key={`${item.file.name}-${index}`}
                  className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-all duration-200"
                >
                  <div className="rounded-lg bg-muted p-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-small font-medium truncate">
                      {item.file.name}
                    </p>
                    <p className="text-micro text-muted-foreground">
                      {formatSize(item.file.size)}
                      {item.status === 'uploading' && (
                        <span className="ml-2">Uploading...</span>
                      )}
                      {item.status === 'done' && (
                        <span className="ml-2 text-success">Done</span>
                      )}
                      {item.status === 'error' && (
                        <span className="ml-2 text-destructive">
                          {item.error}
                        </span>
                      )}
                    </p>
                    {item.status !== 'done' && item.status !== 'error' && (
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeUpload(index)}
                    aria-label="Remove from queue"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
