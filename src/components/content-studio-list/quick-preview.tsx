import { Link } from 'react-router-dom'
import { FileText, ExternalLink } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ContentEditor } from '@/types/content-editor'
import { highlightSearchText } from '@/hooks/use-content-studio-list'

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

export interface QuickPreviewProps {
  item: ContentEditor | null
  open: boolean
  onOpenChange: (open: boolean) => void
  searchQuery?: string
}

export function QuickPreview({
  item,
  open,
  onOpenChange,
  searchQuery = '',
}: QuickPreviewProps) {
  if (!item) return null

  const brief = item.description ?? 'No brief summary'
  const latestDraft = truncate(item.content_body ?? '', 300)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="pr-8">
            <span
              dangerouslySetInnerHTML={{
                __html: highlightSearchText(item.title ?? 'Untitled', searchQuery) || (item.title ?? 'Untitled'),
              }}
            />
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
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

          <div>
            <h4 className="text-small font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Brief summary
            </h4>
            <p className="text-body text-foreground/90 leading-relaxed">
              {brief}
            </p>
          </div>

          <div>
            <h4 className="text-small font-medium text-muted-foreground mb-2">
              Latest draft
            </h4>
            <div className="rounded-lg border bg-muted/30 p-4 text-small text-foreground/80 leading-relaxed max-h-48 overflow-y-auto">
              {latestDraft || 'No content yet'}
            </div>
          </div>

          {item.due_date && (
            <p className="text-micro text-muted-foreground">
              Due: {formatDate(item.due_date)}
            </p>
          )}

          <Button asChild className="w-full transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
            <Link
              to={`/dashboard/content-editor/${item.id}`}
              onClick={() => onOpenChange(false)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in editor
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
