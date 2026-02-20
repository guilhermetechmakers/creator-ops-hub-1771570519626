import { Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, type SelectOption } from '@/components/ui/select'
import { CHANNEL_OPTIONS } from '@/types/analytics'
import type { AnalyticsFilters } from '@/types/analytics'
import { cn } from '@/lib/utils'

const CHANNEL_SELECT_OPTIONS: SelectOption[] = CHANNEL_OPTIONS.map((c) => ({
  value: c.value,
  label: c.label,
}))

export interface AnalyticsFiltersProps {
  filters: AnalyticsFilters
  onFiltersChange: (filters: AnalyticsFilters) => void
  className?: string
}

export function AnalyticsFiltersComponent({
  filters,
  onFiltersChange,
  className,
}: AnalyticsFiltersProps) {
  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, dateFrom: e.target.value || undefined })
  }

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, dateTo: e.target.value || undefined })
  }

  const handleChannelChange = (value: string) => {
    onFiltersChange({ ...filters, channel: value === 'all' ? undefined : value })
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl border bg-card p-4 transition-all duration-200',
        className
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filters</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="analytics-date-from" className="text-micro">
            From date
          </Label>
          <Input
            id="analytics-date-from"
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={handleDateFromChange}
            className="transition-colors duration-200 focus:border-primary/50"
            aria-label="Analytics from date"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="analytics-date-to" className="text-micro">
            To date
          </Label>
          <Input
            id="analytics-date-to"
            type="date"
            value={filters.dateTo ?? ''}
            onChange={handleDateToChange}
            className="transition-colors duration-200 focus:border-primary/50"
            aria-label="Analytics to date"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="analytics-channel" className="text-micro">
            Channel
          </Label>
          <Select
            id="analytics-channel"
            options={CHANNEL_SELECT_OPTIONS}
            value={filters.channel ?? 'all'}
            onChange={(e) => handleChannelChange(e.target.value)}
            aria-label="Filter by channel"
          />
        </div>
      </div>
    </div>
  )
}
