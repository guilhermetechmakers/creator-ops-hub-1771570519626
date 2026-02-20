import { useState, useEffect, useCallback } from 'react'
import { History, RotateCcw } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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

export function VersionHistorySheet({
  open,
  onOpenChange,
  contentEditorId,
  onRestore,
}: VersionHistorySheetProps) {
  const [versions, setVersions] = useState<ContentEditorVersionRecord[]>([])
  const [loading, setLoading] = useState(false)

  const fetchVersions = useCallback(async () => {
    if (!contentEditorId) {
      setVersions([])
      return
    }
    setLoading(true)
    try {
      const list = await getContentEditorVersions(contentEditorId)
      setVersions(list)
    } catch {
      setVersions([])
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
      onOpenChange(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col"
        aria-describedby="version-history-description"
      >
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Version history
          </SheetTitle>
          <p
            id="version-history-description"
            className="text-small text-muted-foreground"
          >
            Restore a previous version of your content.
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {!contentEditorId ? (
            <div className="rounded-lg border border-dashed border-input p-8 text-center text-small text-muted-foreground">
              <History className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>Save your content first to see version history.</p>
            </div>
          ) : loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : versions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-input p-8 text-center text-small text-muted-foreground">
              <History className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No versions yet. Versions are saved when you save your content.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {versions.map((v) => (
                <li
                  key={v.id}
                  className={cn(
                    'rounded-lg border p-4 transition-all duration-200',
                    'hover:shadow-card-hover hover:border-primary/30'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-small">
                        Version {v.version_number}
                      </p>
                      <p className="text-micro text-muted-foreground mt-0.5">
                        {formatVersionDate(v.created_at)}
                      </p>
                      {v.content_body && (
                        <p className="text-small text-muted-foreground mt-2 line-clamp-2">
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
                      <RotateCcw className="h-4 w-4" />
                      Restore
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
