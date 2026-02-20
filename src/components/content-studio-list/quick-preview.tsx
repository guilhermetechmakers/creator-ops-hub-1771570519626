import { Link } from 'react-router-dom'
import { FileText, ExternalLink, FileQuestion, AlertCircle, RefreshCw, List } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ContentEditor } from '@/types/content-editor'
import { highlightSearchText } from '@/hooks/use-content-studio-list'
import { cn } from '@/lib/utils'

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'outline'> = {
  draft: 'secondary',
  review: 'warning',
  scheduled: 'default',
  published: 'success',
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' })
}

function truncate(str: string | null | undefined, len: number): string {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '…' : str
}

function isValidItem(item: ContentEditor | null | undefined): item is ContentEditor {
  return Boolean(item && typeof item.id === 'string' && item.id.length > 0)
}

/** Empty state when no item is selected - per Design Reference: icon, helpful copy, CTA */
function QuickPreviewEmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="No content selected"
      className={cn(
        'flex flex-col items-center justify-center gap-6 rounded-xl',
        'border-2 border-dashed border-muted bg-muted/20 p-6 sm:p-8 text-center',
        'animate-fade-in min-h-[200px] sm:min-h-[240px]'
      )}
    >
      <div className="rounded-2xl bg-muted/50 p-6 ring-1 ring-muted/80" aria-hidden>
        <FileQuestion className="h-12 w-12 text-muted-foreground/70" />
      </div>
      <div className="space-y-2 max-w-[280px]">
        <h3 className="text-base font-semibold text-foreground">No content selected</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Select a content item from the list to preview its details here.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[240px]">
        <Button
          onClick={onClose}
          className="w-full transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          aria-label="Close and return to content list"
        >
          <List className="h-4 w-4 mr-2" aria-hidden />
          View content list
        </Button>
      </div>
    </div>
  )
}

/** Content preview when item is valid - proper heading hierarchy (h2 from SheetTitle, h3 for sections) */
function QuickPreviewContent({
  item,
  onOpenChange,
}: {
  item: ContentEditor
  onOpenChange: (open: boolean) => void
}) {
  return (
    <div id="quick-preview-content" className="mt-6 space-y-6" aria-label="Content preview">
      <div className="flex flex-wrap gap-2">
        <Badge variant={STATUS_VARIANTS[item.status ?? ''] ?? 'default'}>
          {item.status ?? 'draft'}
        </Badge>
        {item.channel && (
          <Badge variant="outline" className="capitalize">
            {item.channel}
          </Badge>
        )}
        {item.is_ai_generated && (
          <Badge variant="outline" className="border-primary/30 text-primary">
            OpenClaw
          </Badge>
        )}
      </div>

      <section aria-labelledby="brief-heading">
        <h3
          id="brief-heading"
          className="text-small font-medium text-muted-foreground mb-2 flex items-center gap-2"
        >
          <FileText className="h-4 w-4" aria-hidden />
          Brief summary
        </h3>
        <p className="text-body text-foreground/90 leading-relaxed">
          {item.description ?? 'No brief summary'}
        </p>
      </section>

      <section aria-labelledby="draft-heading">
        <h3
          id="draft-heading"
          className="text-small font-medium text-muted-foreground mb-2"
        >
          Latest draft
        </h3>
        <div className="rounded-lg border bg-muted/30 p-4 text-small text-foreground/80 leading-relaxed max-h-48 overflow-y-auto">
          {truncate(item.content_body ?? '', 300) || 'No content yet'}
        </div>
      </section>

      {item.due_date && (
        <p className="text-micro text-muted-foreground">
          Due: {formatDate(item.due_date)}
        </p>
      )}

      <Button asChild className="w-full transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
        <Link
          to={`/dashboard/content-editor/${item.id}`}
          onClick={() => onOpenChange(false)}
          aria-label="Open this content in the editor"
        >
          <ExternalLink className="h-4 w-4 mr-2" aria-hidden />
          Open in editor
        </Link>
      </Button>
    </div>
  )
}

/** Error state when item data is invalid or corrupted - with inline message and retry */
function QuickPreviewErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-lg',
        'border border-destructive/20 bg-destructive/5 p-6 text-center',
        'animate-fade-in'
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-5 w-5 text-destructive" aria-hidden />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">Unable to load preview</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          aria-label="Try again to load preview"
          className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <RefreshCw className="h-4 w-4 mr-2" aria-hidden />
          Try again
        </Button>
      )}
    </div>
  )
}

export interface QuickPreviewProps {
  item: ContentEditor | null | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
  searchQuery?: string
  /** Optional retry callback for error state (e.g. refetch content) */
  onRetry?: () => void
}

export function QuickPreview({
  item,
  open,
  onOpenChange,
  searchQuery = '',
  onRetry,
}: QuickPreviewProps) {
  const hasNoItem = item == null
  const hasInvalidItem = !hasNoItem && !isValidItem(item)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-md sm:max-w-lg overflow-y-auto"
        aria-describedby={
          hasNoItem ? 'quick-preview-empty' : hasInvalidItem ? 'quick-preview-error' : 'quick-preview-content'
        }
      >
        <SheetHeader>
          <SheetTitle className="pr-8" id="quick-preview-title">
            {hasNoItem ? (
              'Quick preview'
            ) : hasInvalidItem ? (
              'Quick preview'
            ) : (
              <span
                dangerouslySetInnerHTML={{
                  __html: highlightSearchText(item!.title ?? 'Untitled', searchQuery) || (item!.title ?? 'Untitled'),
                }}
              />
            )}
          </SheetTitle>
        </SheetHeader>

        {hasNoItem ? (
          <div id="quick-preview-empty" className="mt-6" aria-label="Empty preview state">
            <QuickPreviewEmptyState onClose={() => onOpenChange(false)} />
          </div>
        ) : hasInvalidItem ? (
          <div id="quick-preview-error" className="mt-6" aria-label="Preview error">
            <QuickPreviewErrorState
              message="This content item could not be loaded. It may be missing required data."
              onRetry={onRetry}
            />
          </div>
        ) : (
          <QuickPreviewContent item={item as ContentEditor} onOpenChange={onOpenChange} />
        )}
      </SheetContent>
    </Sheet>
  )
}
