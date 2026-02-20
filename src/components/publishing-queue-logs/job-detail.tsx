import { RotateCw, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { PublishingQueueLog } from '@/types/publishing-queue'
import { cn } from '@/lib/utils'

function formatScheduledTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export interface JobDetailProps {
  job: PublishingQueueLog | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRetry: (job: PublishingQueueLog) => void
  onManualPublish: (job: PublishingQueueLog) => void
  isRetrying?: boolean
  isPublishing?: boolean
}

export function JobDetail({
  job,
  open,
  onOpenChange,
  onRetry,
  onManualPublish,
  isRetrying,
  isPublishing,
}: JobDetailProps) {
  if (!job) return null

  const canRetry = job.status === 'failed' || job.status === 'cancelled'
  const canPublish = job.status === 'queued' || job.status === 'failed'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto"
      >
        <SheetHeader className="border-b pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-h3 truncate">{job.title}</SheetTitle>
              <p className="text-micro text-muted-foreground mt-1 font-mono">
                {job.id}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="capitalize">
                  {job.platform}
                </Badge>
                <Badge
                  variant={
                    job.status === 'failed'
                      ? 'destructive'
                      : job.status === 'published'
                        ? 'success'
                        : 'secondary'
                  }
                >
                  {job.status}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              aria-label="Close job details"
            >
              <X className="h-5 w-5" aria-hidden />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6 pt-6">
          <div>
            <p className="text-micro text-muted-foreground mb-1">
              Scheduled time
            </p>
            <p className="text-body">{formatScheduledTime(job.scheduled_time)}</p>
          </div>

          {job.description && (
            <div>
              <p className="text-micro text-muted-foreground mb-1">
                Description
              </p>
              <p className="text-body">{job.description}</p>
            </div>
          )}

          <Card className="border-muted/50">
            <CardHeader className="py-3">
              <CardTitle className="text-small">Payload preview</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <pre
                className={cn(
                  'text-micro overflow-x-auto rounded-lg bg-muted/50 p-4',
                  'max-h-48 overflow-y-auto'
                )}
              >
                {JSON.stringify(job.payload ?? {}, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {job.error_logs && (
            <Card className="border-destructive/30">
              <CardHeader className="py-3">
                <CardTitle className="text-small text-destructive">
                  Error logs
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <pre
                  className={cn(
                    'text-micro overflow-x-auto rounded-lg bg-destructive/5 p-4',
                    'max-h-32 overflow-y-auto text-destructive'
                  )}
                >
                  {job.error_logs}
                </pre>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap gap-2 pt-4 border-t" role="group" aria-label="Job actions">
            {canRetry && (
              <Button
                variant="outline"
                onClick={() => onRetry(job)}
                disabled={isRetrying}
                className="transition-all duration-200 hover:scale-[1.02]"
                aria-label={isRetrying ? 'Retrying job, please wait' : 'Retry failed job'}
              >
                <RotateCw
                  className={cn('h-4 w-4 mr-2', isRetrying && 'animate-spin')}
                  aria-hidden
                />
                {isRetrying ? 'Retrying…' : 'Retry'}
              </Button>
            )}
            {canPublish && (
              <Button
                onClick={() => onManualPublish(job)}
                disabled={isPublishing}
                className="transition-all duration-200 hover:scale-[1.02]"
                aria-label={isPublishing ? 'Publishing job, please wait' : 'Manually publish job now'}
              >
                <Send
                  className={cn('h-4 w-4 mr-2', isPublishing && 'animate-pulse')}
                  aria-hidden
                />
                {isPublishing ? 'Publishing…' : 'Manual publish'}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
