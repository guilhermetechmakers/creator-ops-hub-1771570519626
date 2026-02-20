import { useState, useRef, useCallback, cloneElement, isValidElement } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, FileText } from 'lucide-react'
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

function truncate(str: string | null | undefined, len: number): string {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '…' : str
}

const HOVER_DELAY_MS = 400
const TOOLTIP_ID_PREFIX = 'quick-preview-tooltip'

export interface QuickPreviewHoverProps {
  item: ContentEditor
  searchQuery?: string
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

export function QuickPreviewHover({
  item,
  searchQuery = '',
  children,
  side = 'right',
  className,
}: QuickPreviewHoverProps) {
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tooltipId = `${TOOLTIP_ID_PREFIX}-${item.id}`
  const labelId = `${tooltipId}-label`

  const show = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setVisible(true), HOVER_DELAY_MS)
  }, [])

  const hide = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setVisible(false)
  }, [])

  const brief = item.description ?? ''
  const hasBrief = Boolean(brief)
  const latestDraft = truncate(item.content_body ?? '', 200)
  const hasDraft = Boolean(latestDraft)

  const trigger = isValidElement(children)
    ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        'aria-describedby': visible ? tooltipId : undefined,
      })
    : children

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {trigger}
      {visible && (
        <div
          id={tooltipId}
          role="tooltip"
          aria-labelledby={labelId}
          aria-live="polite"
          className={cn(
            'absolute z-50 rounded-xl border border-border bg-card p-4 shadow-elevated animate-fade-in',
            'ring-1 ring-ring/20',
            'w-[min(20rem,90vw)] min-w-[16rem] sm:min-w-[18rem]',
            side === 'right' && 'left-full ml-2 top-0',
            side === 'left' && 'right-full mr-2 top-0',
            side === 'top' && 'bottom-full mb-2 left-0',
            side === 'bottom' && 'top-full mt-2 left-0'
          )}
        >
          {/* Visible label for screen readers and sighted users - WCAG 2.1 AA */}
          <p
            id={labelId}
            className="text-micro font-semibold uppercase tracking-wider text-muted-foreground mb-2"
          >
            Quick preview
          </p>
          <div className="space-y-3">
            <p className="font-medium text-small line-clamp-2 text-foreground">
              <span
                dangerouslySetInnerHTML={{
                  __html: highlightSearchText(item.title ?? 'Untitled', searchQuery) || (item.title ?? 'Untitled'),
                }}
              />
            </p>
            <div className="flex flex-wrap gap-1">
              <Badge variant={STATUS_VARIANTS[item.status ?? ''] ?? 'default'} className="text-micro">
                {item.status ?? 'draft'}
              </Badge>
              {item.channel && (
                <Badge variant="outline" className="capitalize text-micro border-border text-foreground">
                  {item.channel}
                </Badge>
              )}
              {item.is_ai_generated && (
                <Badge variant="outline" className="border-primary/30 text-primary text-micro">
                  OpenClaw
                </Badge>
              )}
            </div>
            <div>
              <p className="text-micro font-medium text-muted-foreground mb-1">Brief</p>
              {hasBrief ? (
                <p className="text-micro text-foreground line-clamp-2">{brief}</p>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-micro text-muted-foreground" role="status">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground/70" aria-hidden />
                  <span>No brief summary yet</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-micro font-medium text-muted-foreground mb-1">Latest draft</p>
              {hasDraft ? (
                <p className="text-micro text-foreground/90 line-clamp-3">{latestDraft}</p>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-micro text-muted-foreground" role="status">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground/70" aria-hidden />
                  <span>No content yet</span>
                </div>
              )}
            </div>
            <Button asChild size="sm" className="w-full text-micro transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
              <Link to={`/dashboard/content-editor/${item.id}`}>
                <ExternalLink className="h-3 w-3 mr-1" aria-hidden />
                Open in editor
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
