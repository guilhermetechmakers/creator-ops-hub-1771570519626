import { useState } from 'react'
import { RotateCw, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { PublishingQueueLog } from '@/types/publishing-queue'
import { cn } from '@/lib/utils'

export interface BulkRetryProps {
  selectedJobs: PublishingQueueLog[]
  onBulkRetry: (jobs: PublishingQueueLog[]) => Promise<void>
  disabled?: boolean
  className?: string
}

export function BulkRetry({
  selectedJobs,
  onBulkRetry,
  disabled,
  className,
}: BulkRetryProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const retriableJobs = selectedJobs.filter(
    (j) => j.status === 'failed' || j.status === 'cancelled'
  )
  const hasConflicts = retriableJobs.length < selectedJobs.length
  const canRetry = retriableJobs.length > 0

  const handleOpen = () => {
    if (!canRetry) return
    setOpen(true)
  }

  const handleConfirm = async () => {
    if (retriableJobs.length === 0) {
      setOpen(false)
      return
    }
    setLoading(true)
    try {
      await onBulkRetry(retriableJobs)
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        disabled={disabled || !canRetry}
        className={cn(
          'transition-all duration-200 hover:scale-[1.02]',
          className
        )}
      >
        <RotateCw className="h-4 w-4 mr-2" />
        Bulk retry ({retriableJobs.length})
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Schedule re-run</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  {retriableJobs.length} job
                  {retriableJobs.length !== 1 ? 's' : ''} will be scheduled for
                  retry.
                </p>
                {hasConflicts && (
                  <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                    <p className="text-small text-amber-800 dark:text-amber-200">
                      Conflict detection: {selectedJobs.length - retriableJobs.length} selected
                      job(s) are not in a retriable state (queued or published).
                      Only failed/cancelled jobs will be retried.
                    </p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleConfirm()
              }}
              disabled={loading}
            >
              {loading ? 'Scheduling…' : 'Schedule re-run'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
