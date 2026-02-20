import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
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

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setVisible(true), HOVER_DELAY_MS)
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setVisible(false)
  }, [])

  const brief = item.description ?? 'No brief summary'
  const latestDraft = truncate(item.content_body ?? '', 200)

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {visible && (
        <div
          className={cn(
            'absolute z-50 w-80 max-w-[90vw] rounded-xl border bg-card p-4 shadow-elevated animate-fade-in',
            'ring-1 ring-border',
            side === 'right' && 'left-full ml-2 top-0',
            side === 'left' && 'right-full mr-2 top-0',
            side === 'top' && 'bottom-full mb-2 left-0',
            side === 'bottom' && 'top-full mt-2 left-0'
          )}
          role="tooltip"
          aria-label={`Preview: ${item.title ?? 'Untitled'}`}
        >
          <div className="space-y-3">
            <p className="font-medium text-small line-clamp-2">
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
                <Badge variant="outline" className="capitalize text-micro">
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
              <p className="text-micro text-foreground/90 line-clamp-2">{brief}</p>
            </div>
            <div>
              <p className="text-micro font-medium text-muted-foreground mb-1">Latest draft</p>
              <p className="text-micro text-foreground/80 line-clamp-3">{latestDraft || 'No content yet'}</p>
            </div>
            <Button asChild size="sm" className="w-full text-micro transition-transform duration-200 hover:scale-[1.02]">
              <Link to={`/dashboard/content-editor/${item.id}`}>
                <ExternalLink className="h-3 w-3 mr-1" />
                Open in editor
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
