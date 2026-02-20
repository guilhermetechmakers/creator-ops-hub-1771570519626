import { useState, useEffect, useCallback } from 'react'
import { History, RotateCcw, Save } from 'lucide-react'
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

function EmptyStateSaveFirst() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed border-muted bg-muted/20 p-8 text-center animate-fade-in min-h-[200px]"
    >
      <div className="rounded-2xl bg-muted/50 p-6 ring-1 ring-muted/80">
        <Save className="h-12 w-12 text-muted-foreground/70" aria-hidden />
      </div>
      <div className="space-y-2 max-w-[260px]">
        <h3 className="text-base font-semibold text-foreground">
          Save to enable version history
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Save your content first to create versions. Each save creates a new version you can restore later.
        </p>
      </div>
    </div>
  )
}

function EmptyStateNoVersions() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed border-muted bg-muted/20 p-8 text-center animate-fade-in min-h-[200px]"
    >
      <div className="rounded-2xl bg-muted/50 p-6 ring-1 ring-muted/80">
        <History className="h-12 w-12 text-muted-foreground/70" aria-hidden />
      </div>
      <div className="space-y-2 max-w-[260px]">
        <h3 className="text-base font-semibold text-foreground">
          No versions yet
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Versions are created automatically when you save. Save your content to create your first version.
        </p>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="space-y-4" role="status" aria-live="polite" aria-label="Loading version history">
      <p className="text-sm text-muted-foreground animate-pulse">Loading versions…</p>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg animate-pulse" />
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

  const handleRestore = (v: ContentEditorVersionRecord) => {
    if (v.content_body && onRestore) {
      onRestore(v.content_body)
      toast.success('Version restored', {
        description: `Version ${v.version_number} has been restored to the editor.`,
      })
      onOpenChange(false)
    }
  }

  const renderContent = () => {
    if (!contentEditorId) {
      return <EmptyStateSaveFirst />
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
      return <EmptyStateNoVersions />
    }
    return (
      <section
        aria-labelledby="versions-list-heading"
        className="space-y-3"
      >
        <h3
          id="versions-list-heading"
          className="sr-only"
        >
          Previous versions
        </h3>
        <ul className="space-y-2" role="list">
          {versions.map((v) => (
            <li
              key={v.id}
              className={cn(
                'rounded-lg border p-4 transition-all duration-200',
                'hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">
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
                  className="shrink-0 gap-1.5 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                  onClick={() => handleRestore(v)}
                  disabled={!v.content_body}
                  aria-label={`Restore version ${v.version_number}`}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  Restore
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
        <SheetHeader className="border-b pb-4">
          <SheetTitle id="version-history-title" className="flex items-center gap-2">
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
