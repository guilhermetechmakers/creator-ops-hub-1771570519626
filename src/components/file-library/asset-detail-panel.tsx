import { useState, useEffect } from 'react'
import {
  Download,
  Link2,
  FileImage,
  FileText,
  Check,
  ExternalLink,
} from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  className?: string
}

export function AssetDetailPanel({
  item,
  open,
  onOpenChange,
  onInsertIntoEditor,
  className,
}: AssetDetailPanelProps) {
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!item?.storage_path || !open) {
      setShareLink(null)
      return
    }
    getSignedUrl(item.storage_path)
      .then(setShareLink)
      .catch(() => setShareLink(null))
  }, [item?.storage_path, open])

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
    window.open(shareLink, '_blank', 'noopener')
    toast.success('Download started')
  }

  if (!item) return null

  const displayName = item.file_name ?? item.title
  const isImage = item.file_type?.startsWith('image/')
  const previewUrl =
    item.storage_path && isImage
      ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/file-library/${item.storage_path}`
      : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn('w-full max-w-md overflow-y-auto sm:max-w-lg', className)}
      >
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-left truncate pr-8">
            {displayName}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pt-6">
          {/* Preview */}
          <div className="rounded-xl border bg-muted overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={displayName}
                className="w-full aspect-video object-contain"
              />
            ) : (
              <div className="aspect-video flex items-center justify-center">
                {isImage ? (
                  <FileImage className="h-16 w-16 text-muted-foreground" />
                ) : (
                  <FileText className="h-16 w-16 text-muted-foreground" />
                )}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="space-y-3">
            <h3 className="text-small font-semibold">Metadata</h3>
            <dl className="grid grid-cols-1 gap-2 text-small">
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
          </div>

          {/* Tags */}
          {(item.tags ?? []).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-small font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {item.tags!.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Versions timeline placeholder */}
          {item.version && item.version > 1 && (
            <div className="space-y-2">
              <h3 className="text-small font-semibold">Versions</h3>
              <div className="space-y-2">
                {Array.from({ length: Math.min(item.version, 5) }, (_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-small"
                  >
                    <span className="font-medium">v{item.version! - i}</span>
                    <span className="text-muted-foreground">
                      {i === 0 ? 'Current' : 'Previous'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Usage references placeholder */}
          <div className="space-y-2">
            <h3 className="text-small font-semibold">Usage</h3>
            <p className="text-small text-muted-foreground">
              {item.last_used_at
                ? 'Used in content projects'
                : 'Not yet used in content'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-4 border-t">
            <Button
              className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleDownload}
              disabled={!shareLink}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleCopyLink}
              disabled={!shareLink}
            >
              {copied ? (
                <Check className="h-4 w-4 mr-2 text-success" />
              ) : (
                <Link2 className="h-4 w-4 mr-2" />
              )}
              {copied ? 'Copied!' : 'Copy share link'}
            </Button>
            {onInsertIntoEditor && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  onInsertIntoEditor(item)
                  onOpenChange(false)
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Insert into Content Editor
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
