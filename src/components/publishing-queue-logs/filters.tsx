import { Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, type SelectOption } from '@/components/ui/select'
import {
  type PublishingJobStatus,
  type PublishingQueueFilters,
} from '@/types/publishing-queue'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'queued', label: 'Queued' },
  { value: 'processing', label: 'Processing' },
  { value: 'published', label: 'Published' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const PLATFORM_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All platforms' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'linkedin', label: 'LinkedIn' },
]

export interface PublishingQueueFiltersProps {
  filters: PublishingQueueFilters
  onFiltersChange: (filters: PublishingQueueFilters) => void
  className?: string
}

export function PublishingQueueFiltersComponent({
  filters,
  onFiltersChange,
  className,
}: PublishingQueueFiltersProps) {
  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : (value as PublishingJobStatus),
    })
  }

  const handlePlatformChange = (value: string) => {
    onFiltersChange({
      ...filters,
      platform: value === 'all' ? undefined : value,
    })
  }

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      dateFrom: e.target.value || undefined,
    })
  }

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      dateTo: e.target.value || undefined,
    })
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-lg border bg-card p-4 transition-all duration-200',
        className
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filters</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="filter-status" className="text-micro">
            Status
          </Label>
          <Select
            id="filter-status"
            options={STATUS_OPTIONS}
            value={filters.status ?? 'all'}
            onChange={(e) => handleStatusChange(e.target.value)}
            aria-label="Filter by status"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-platform" className="text-micro">
            Platform
          </Label>
          <Select
            id="filter-platform"
            options={PLATFORM_OPTIONS}
            value={filters.platform ?? 'all'}
            onChange={(e) => handlePlatformChange(e.target.value)}
            aria-label="Filter by platform"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-date-from" className="text-micro">
            From date
          </Label>
          <Input
            id="filter-date-from"
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={handleDateFromChange}
            className="transition-colors duration-200 focus:border-primary/50"
            aria-label="Filter from date"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-date-to" className="text-micro">
            To date
          </Label>
          <Input
            id="filter-date-to"
            type="date"
            value={filters.dateTo ?? ''}
            onChange={handleDateToChange}
            className="transition-colors duration-200 focus:border-primary/50"
            aria-label="Filter to date"
          />
        </div>
      </div>
    </div>
  )
}
