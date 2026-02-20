import { useState, useEffect, useCallback } from 'react'
import { History, Loader2, RotateCcw, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { getContentEditorVersions } from '@/lib/content-editor-ops'
import type { ContentEditorVersionRecord } from '@/lib/content-editor-ops'
import { cn } from '@/lib/utils'

export interface VersionHistorySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contentEditorId: string | undefined
  onRestore?: (content: string) => void
}

function formatVersionDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

interface EmptyStateProps {
  onClose?: () => void
}

function EmptyStateSaveFirst({ onClose }: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed border-border bg-muted/20 p-8 text-center animate-fade-in min-h-[200px]"
    >
      <div className="rounded-2xl bg-muted/50 p-6 ring-1 ring-border/80">
        <Save className="h-12 w-12 text-muted-foreground/70" aria-hidden />
      </div>
      <div className="space-y-2 max-w-[260px]">
        <h2 className="text-base font-semibold text-foreground">
          Save to enable version history
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Save your content first to create versions. Each save creates a new version you can restore later.
        </p>
      </div>
      {onClose && (
        <Button
          variant="default"
          size="sm"
          onClick={onClose}
          className="mt-2 gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
          aria-label="Close version history"
        >
          Got it
        </Button>
      )}
    </div>
  )
}

function EmptyStateNoVersions({ onClose }: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed border-border bg-muted/20 p-8 text-center animate-fade-in min-h-[200px]"
    >
      <div className="rounded-2xl bg-muted/50 p-6 ring-1 ring-border/80">
        <History className="h-12 w-12 text-muted-foreground/70" aria-hidden />
      </div>
      <div className="space-y-2 max-w-[260px]">
        <h2 className="text-base font-semibold text-foreground">
          No versions yet
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Versions are created automatically when you save. Save your content to create your first version.
        </p>
      </div>
      {onClose && (
        <Button
          variant="default"
          size="sm"
          onClick={onClose}
          className="mt-2 gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
          aria-label="Close version history"
        >
          Got it
        </Button>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div
      className="space-y-4"
      role="status"
      aria-live="polite"
      aria-label="Loading version history"
    >
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
        <p className="text-sm text-muted-foreground">Loading versions…</p>
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            className="h-20 w-full rounded-lg animate-pulse bg-muted/60"
          />
        ))}
      </div>
    </div>
  )
}

export function VersionHistorySheet({
  open,
  onOpenChange,
  contentEditorId,
  onRestore,
}: VersionHistorySheetProps) {
  const [versions, setVersions] = useState<ContentEditorVersionRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [restoringId, setRestoringId] = useState<string | null>(null)

  const fetchVersions = useCallback(async () => {
    if (!contentEditorId) {
      setVersions([])
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const list = await getContentEditorVersions(contentEditorId)
      setVersions(list)
    } catch (err) {
      setVersions([])
      setError(err instanceof Error ? err.message : 'Failed to load version history')
    } finally {
      setLoading(false)
    }
  }, [contentEditorId])

  useEffect(() => {
    if (open && contentEditorId) {
      fetchVersions()
    }
  }, [open, contentEditorId, fetchVersions])

  const handleRestore = async (v: ContentEditorVersionRecord) => {
    if (!v.content_body || !onRestore) return
    setRestoringId(v.id)
    try {
      onRestore(v.content_body)
      toast.success('Version restored', {
        description: `Version ${v.version_number} has been restored to the editor.`,
      })
      onOpenChange(false)
    } finally {
      setRestoringId(null)
    }
  }

  const handleClose = () => onOpenChange(false)

  const renderContent = () => {
    if (!contentEditorId) {
      return <EmptyStateSaveFirst onClose={handleClose} />
    }
    if (loading) {
      return <LoadingState />
    }
    if (error) {
      return (
        <ErrorState
          title="Could not load versions"
          description={error}
          onRetry={fetchVersions}
          retryLabel="Try again"
          buttonAriaLabel="Retry loading version history"
        />
      )
    }
    if (versions.length === 0) {
      return <EmptyStateNoVersions onClose={handleClose} />
    }
    return (
      <section
        aria-labelledby="versions-list-heading"
        className="space-y-3"
      >
        <h2
          id="versions-list-heading"
          className="text-sm font-medium text-foreground"
        >
          Previous versions
        </h2>
        <ul className="space-y-2" role="list">
          {versions.map((v) => (
            <li
              key={v.id}
              className={cn(
                'rounded-lg border border-border bg-card p-4 transition-all duration-200',
                'hover:shadow-card-hover hover:border-primary/30 hover:-translate-y-0.5'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-foreground">
                    Version {v.version_number}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatVersionDate(v.created_at)}
                  </p>
                  {v.content_body && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {v.content_body.slice(0, 120)}
                      {v.content_body.length > 120 ? '...' : ''}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm disabled:opacity-50"
                  onClick={() => handleRestore(v)}
                  disabled={!v.content_body || restoringId !== null}
                  aria-label={`Restore version ${v.version_number}`}
                  aria-busy={restoringId === v.id}
                >
                  {restoringId === v.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <RotateCcw className="h-4 w-4" aria-hidden />
                  )}
                  {restoringId === v.id ? 'Restoring…' : 'Restore'}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col"
        aria-describedby="version-history-description"
      >
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle
            as="h1"
            id="version-history-title"
            className="flex items-center gap-2"
          >
            <History className="h-5 w-5 text-primary" aria-hidden />
            Version history
          </SheetTitle>
          <p
            id="version-history-description"
            className="text-sm text-muted-foreground"
          >
            Restore a previous version of your content.
          </p>
        </SheetHeader>

        <div
          className="flex-1 overflow-y-auto py-4"
          role="region"
          aria-labelledby="version-history-title"
        >
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  )
}
