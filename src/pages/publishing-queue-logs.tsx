import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { usePublishingQueue } from '@/hooks/use-publishing-queue'
import {
  retryJob,
  bulkRetryJobs,
  manualPublishJob,
} from '@/lib/publishing-queue-ops'
import { PublishingQueueFiltersComponent } from '@/components/publishing-queue-logs/filters'
import { QueueList } from '@/components/publishing-queue-logs/queue-list'
import { JobDetail } from '@/components/publishing-queue-logs/job-detail'
import { BulkRetry } from '@/components/publishing-queue-logs/bulk-retry'
import type {
  PublishingQueueLog,
  PublishingQueueFilters,
} from '@/types/publishing-queue'

export function PublishingQueueLogsPage() {
  const [filters, setFilters] = useState<PublishingQueueFilters>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [detailJob, setDetailJob] = useState<PublishingQueueLog | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const { jobs, loading, error, refetch } = usePublishingQueue(filters)

  const selectedJobs = jobs.filter((j) => selectedIds.has(j.id))

  const handleJobClick = useCallback((job: PublishingQueueLog) => {
    setDetailJob(job)
    setDetailOpen(true)
  }, [])

  const handleRetry = useCallback(
    async (job: PublishingQueueLog) => {
      setIsRetrying(true)
      try {
        await retryJob(job.id)
        toast.success('Job scheduled for retry')
        refetch()
        setDetailOpen(false)
      } catch (e) {
        toast.error((e as Error).message)
      } finally {
        setIsRetrying(false)
      }
    },
    [refetch]
  )

  const handleManualPublish = useCallback(
    async (job: PublishingQueueLog) => {
      setIsPublishing(true)
      try {
        await manualPublishJob(job.id)
        toast.success('Publish initiated')
        refetch()
        setDetailOpen(false)
      } catch (e) {
        toast.error((e as Error).message)
      } finally {
        setIsPublishing(false)
      }
    },
    [refetch]
  )

  const handleBulkRetry = useCallback(
    async (jobsToRetry: PublishingQueueLog[]) => {
      try {
        const { retried } = await bulkRetryJobs(jobsToRetry.map((j) => j.id))
        toast.success(`${retried} job(s) scheduled for retry`)
        setSelectedIds(new Set())
        refetch()
      } catch (e) {
        toast.error((e as Error).message)
      }
    },
    [refetch]
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h1 font-bold">Publishing Queue & Logs</h1>
          <p className="text-muted-foreground mt-1">
            Operational view of queued publishing jobs, failures, and retries
          </p>
        </div>
        <BulkRetry
          selectedJobs={selectedJobs}
          onBulkRetry={handleBulkRetry}
          disabled={loading}
        />
      </div>

      {error && (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}

      <PublishingQueueFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
      />

      <QueueList
        jobs={jobs}
        isLoading={loading}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onJobClick={handleJobClick}
      />

      <JobDetail
        job={detailJob}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onRetry={handleRetry}
        onManualPublish={handleManualPublish}
        isRetrying={isRetrying}
        isPublishing={isPublishing}
      />
    </div>
  )
}

export default PublishingQueueLogsPage
