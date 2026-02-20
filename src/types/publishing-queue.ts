/** Publishing queue job record */

export type PublishingJobStatus =
  | 'queued'
  | 'processing'
  | 'published'
  | 'failed'
  | 'cancelled'

export interface PublishingQueueLog {
  id: string
  user_id: string
  title: string
  description?: string
  platform: string
  scheduled_time: string | null
  payload: Record<string, unknown>
  error_logs: string | null
  status: PublishingJobStatus
  created_at: string
  updated_at: string
}

export interface PublishingQueueFilters {
  status?: PublishingJobStatus | 'all'
  platform?: string
  dateFrom?: string
  dateTo?: string
}
