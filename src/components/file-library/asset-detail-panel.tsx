import { useState, useEffect } from 'react'
import {
  Download,
  Link2,
  FileImage,
  FileText,
  Check,
  ExternalLink,
  FileSearch,
  FolderOpen,
} from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { toast } from 'sonner'
import { getSignedUrl } from '@/lib/file-library-ops'
import type { FileLibrary } from '@/types/file-library'
import { cn } from '@/lib/utils'

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatSize(bytes: number | null | undefined): string {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export interface AssetDetailPanelProps {
  item: FileLibrary | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsertIntoEditor?: (item: FileLibrary) => void
  folderName?: string | null
  className?: string
}

type UrlState = 'idle' | 'loading' | 'success' | 'error'

export function AssetDetailPanel({
  item,
  open,
  onOpenChange,
  onInsertIntoEditor,
  folderName,
  className,
}: AssetDetailPanelProps) {
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [urlState, setUrlState] = useState<UrlState>('idle')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!item?.storage_path || !open) {
      queueMicrotask(() => {
        setShareLink(null)
        setUrlState('idle')
      })
      return
    }
    let cancelled = false
    queueMicrotask(() => setUrlState('loading'))
    getSignedUrl(item.storage_path)
      .then((url) => {
        if (!cancelled) {
          setShareLink(url)
          setUrlState('success')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setShareLink(null)
          setUrlState('error')
        }
      })
    return () => {
      cancelled = true
    }
  }, [item?.storage_path, open])

  const handleRetryUrl = () => {
    if (!item?.storage_path) return
    setUrlState('loading')
    getSignedUrl(item.storage_path)
      .then((url) => {
        setShareLink(url)
        setUrlState('success')
      })
      .catch(() => {
        setShareLink(null)
        setUrlState('error')
      })
  }

  const handleCopyLink = async () => {
    if (!shareLink) return
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleDownload = () => {
    if (!shareLink) return
    window.open(shareLink, '_blank', 'noopener,noreferrer')
    toast.success('Download started')
  }

  const handleInsert = () => {
    if (!item) return
    onInsertIntoEditor?.(item)
    onOpenChange(false)
    toast.success(`${item.file_name ?? item.title} inserted into Content Editor`)
  }

  const handleBrowseAssets = () => {
    onOpenChange(false)
  }

  const displayName = item?.file_name ?? item?.title ?? ''
  const isImage = item?.file_type?.startsWith('image/')
  const previewUrl =
    item?.storage_path && isImage
      ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/file-library/${item.storage_path}`
      : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn('w-full max-w-md overflow-y-auto sm:max-w-lg', className)}
        aria-label={item ? 'Asset details' : 'Asset details panel'}
      >
        {!item ? (
          <div
            className="flex flex-col items-center justify-center gap-6 py-16 px-6 text-center animate-fade-in min-h-[280px]"
            role="status"
            aria-live="polite"
            aria-label="No asset selected"
          >
            <Card className="w-full max-w-sm border-dashed">
              <CardContent className="flex flex-col items-center gap-6 pt-6 pb-6">
                <div
                  className="rounded-2xl bg-muted/50 p-8 flex items-center justify-center"
                  aria-hidden
                >
                  <FileSearch
                    className="h-16 w-16 text-muted-foreground/70"
                    aria-hidden
                  />
                </div>
                <div className="space-y-2">
                  <h2 className="text-body font-semibold text-foreground">
                    No asset selected
                  </h2>
                  <p className="text-small text-muted-foreground max-w-sm">
                    Select an asset from the library to view its details, metadata,
                    and actions.
                  </p>
                </div>
                <Button
                  onClick={handleBrowseAssets}
                  className="w-full sm:w-auto transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  aria-label="Browse assets in the file library"
                >
                  <FolderOpen className="h-4 w-4 mr-2" aria-hidden />
                  Browse assets
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <SheetHeader className="border-b pb-4">
              <SheetTitle
                className="text-left truncate pr-8"
                id="asset-detail-title"
              >
                {displayName}
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-6 pt-6" aria-labelledby="asset-detail-title">
              {/* Preview */}
              <Card className="overflow-hidden border-primary/10">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={`Preview of ${displayName}`}
                    className="w-full aspect-video object-contain"
                  />
                ) : (
                  <CardContent className="aspect-video flex items-center justify-center p-0">
                    {isImage ? (
                      <FileImage
                        className="h-16 w-16 text-muted-foreground"
                        aria-hidden
                      />
                    ) : (
                      <FileText
                        className="h-16 w-16 text-muted-foreground"
                        aria-hidden
                      />
                    )}
                  </CardContent>
                )}
              </Card>

              {/* URL loading / error state */}
              {urlState === 'loading' && (
                <div className="space-y-2" role="status" aria-live="polite">
                  <Skeleton className="h-10 w-full" shimmer />
                  <Skeleton className="h-10 w-full" shimmer />
                  <p className="text-micro text-muted-foreground">
                    Preparing download link…
                  </p>
                </div>
              )}
              {urlState === 'error' && (
                <ErrorState
                  title="Could not load link"
                  description="We couldn't generate a share link for this asset. You can try again."
                  onRetry={handleRetryUrl}
                  retryLabel="Retry"
                  buttonAriaLabel="Retry generating share link"
                />
              )}

              {/* Metadata */}
              <Card>
                <CardHeader className="pb-2">
                  <h3
                    id="metadata-heading"
                    className="text-small font-semibold leading-none"
                  >
                    Metadata
                  </h3>
                </CardHeader>
                <CardContent className="pt-0">
                  <dl
                    className="grid grid-cols-1 gap-2 text-small"
                    aria-labelledby="metadata-heading"
                  >
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Type</dt>
                      <dd>{item.file_type ?? '—'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Size</dt>
                      <dd>{formatSize(item.file_size)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Version</dt>
                      <dd>v{item.version ?? 1}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Folder</dt>
                      <dd>
                        {folderName ?? (item.folder_id ? '—' : 'Uncategorized')}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Created</dt>
                      <dd>{formatDate(item.created_at)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Updated</dt>
                      <dd>{formatDate(item.updated_at)}</dd>
                    </div>
                    {item.last_used_at && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Last used</dt>
                        <dd>{formatDate(item.last_used_at)}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>

              {/* Tags */}
              {(item.tags ?? []).length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <h3 className="text-small font-semibold leading-none">
                      Tags
                    </h3>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {item.tags!.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Versions timeline placeholder */}
              {item.version && item.version > 1 && (
                <Card>
                  <CardHeader className="pb-2">
                    <h3 className="text-small font-semibold leading-none">
                      Versions
                    </h3>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {Array.from(
                        { length: Math.min(item.version, 5) },
                        (_, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-small"
                          >
                            <span className="font-medium">
                              v{item.version! - i}
                            </span>
                            <span className="text-muted-foreground">
                              {i === 0 ? 'Current' : 'Previous'}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Usage references placeholder */}
              <Card>
                <CardHeader className="pb-2">
                  <h3 className="text-small font-semibold leading-none">Usage</h3>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-small text-muted-foreground">
                    {item.last_used_at
                      ? 'Used in content projects'
                      : 'Not yet used in content'}
                  </p>
                </CardContent>
              </Card>

              {/* Actions - only show when URL is ready or we have insert */}
              {(urlState === 'success' || onInsertIntoEditor) && (
                <div
                  className="flex flex-col gap-2 pt-4 border-t"
                  role="group"
                  aria-label="Asset actions"
                >
                  <Button
                    className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    onClick={handleDownload}
                    disabled={!shareLink}
                    aria-label={
                      shareLink
                        ? `Download ${displayName}`
                        : 'Download unavailable - link is loading'
                    }
                  >
                    <Download className="h-4 w-4 mr-2" aria-hidden />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    onClick={handleCopyLink}
                    disabled={!shareLink}
                    aria-label={
                      copied
                        ? 'Link copied to clipboard'
                        : shareLink
                          ? 'Copy share link to clipboard'
                          : 'Copy link unavailable - link is loading'
                    }
                  >
                    {copied ? (
                      <Check className="h-4 w-4 mr-2 text-success" aria-hidden />
                    ) : (
                      <Link2 className="h-4 w-4 mr-2" aria-hidden />
                    )}
                    {copied ? 'Copied!' : 'Copy share link'}
                  </Button>
                  {onInsertIntoEditor && (
                    <Button
                      variant="secondary"
                      className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      onClick={handleInsert}
                      aria-label={`Insert ${displayName} into Content Editor`}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" aria-hidden />
                      Insert into Content Editor
                    </Button>
                  )}
                </div>
              )}

              {/* Show action buttons in loading state for insert (insert doesn't need URL) */}
              {urlState === 'loading' && onInsertIntoEditor && (
                <div
                  className="flex flex-col gap-2 pt-4 border-t"
                  role="group"
                  aria-label="Asset actions"
                >
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Button
                    variant="secondary"
                    className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    onClick={handleInsert}
                    aria-label={`Insert ${displayName} into Content Editor`}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" aria-hidden />
                    Insert into Content Editor
                  </Button>
                </div>
              )}

              {/* Show only insert when URL failed but insert is available */}
              {urlState === 'error' && onInsertIntoEditor && (
                <div
                  className="flex flex-col gap-2 pt-4 border-t"
                  role="group"
                  aria-label="Asset actions"
                >
                  <Button
                    variant="secondary"
                    className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    onClick={handleInsert}
                    aria-label={`Insert ${displayName} into Content Editor`}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" aria-hidden />
                    Insert into Content Editor
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
