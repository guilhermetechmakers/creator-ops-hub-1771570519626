import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronUp, ChevronDown, LayoutList, Send, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import type { PublishingQueueLog } from '@/types/publishing-queue'
import { cn } from '@/lib/utils'

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  queued: 'secondary',
  processing: 'default',
  published: 'success',
  failed: 'destructive',
  cancelled: 'outline',
}

function formatScheduledTime(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

type SortKey = 'scheduled_time' | 'title' | 'platform' | 'status' | 'created_at'
type SortDir = 'asc' | 'desc'

export interface QueueListProps {
  jobs: PublishingQueueLog[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
  onJobClick: (job: PublishingQueueLog) => void
  emptyMessage?: string
}

export function QueueList({
  jobs,
  isLoading,
  error,
  onRetry,
  selectedIds,
  onSelectionChange,
  onJobClick,
  emptyMessage = 'No publishing jobs in queue',
}: QueueListProps) {
  const [sortKey, setSortKey] = useState<SortKey>('scheduled_time')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sortedJobs = [...jobs].sort((a, b) => {
    let aVal: string | number | null = null
    let bVal: string | number | null = null
    switch (sortKey) {
      case 'scheduled_time':
        aVal = a.scheduled_time ? new Date(a.scheduled_time).getTime() : 0
        bVal = b.scheduled_time ? new Date(b.scheduled_time).getTime() : 0
        break
      case 'title':
        aVal = a.title
        bVal = b.title
        break
      case 'platform':
        aVal = a.platform
        bVal = b.platform
        break
      case 'status':
        aVal = a.status
        bVal = b.status
        break
      case 'created_at':
        aVal = new Date(a.created_at).getTime()
        bVal = new Date(b.created_at).getTime()
        break
    }
    if (aVal === null) return 1
    if (bVal === null) return -1
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    return sortDir === 'asc' ? cmp : -cmp
  })

  const toggleSelectAll = () => {
    if (selectedIds.size === jobs.length) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(jobs.map((j) => j.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange(next)
  }

  const SortHeader = ({
    label,
    sortKey: sk,
  }: {
    label: string
    sortKey: SortKey
  }) => (
    <TableHead>
      <button
        type="button"
        onClick={() => toggleSort(sk)}
        className="flex items-center gap-1 font-medium hover:text-primary transition-colors"
        aria-label={`Sort by ${label}`}
      >
        {label}
        {sortKey === sk ? (
          sortDir === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )
        ) : null}
      </button>
    </TableHead>
  )

  if (isLoading) {
    return (
      <Card className="overflow-hidden transition-shadow duration-200">
        <CardContent className="p-0">
          <div
            role="status"
            aria-live="polite"
            aria-label="Loading publishing queue"
            className="overflow-x-auto"
          >
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="w-12">
                    <Skeleton className="h-4 w-4 rounded" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-28" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-32" />
                  </TableHead>
                  <TableHead>
                    <Skeleton className="h-4 w-16" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell className="w-12">
                      <Skeleton className="h-4 w-4 rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16 font-mono" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-14 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="overflow-hidden transition-shadow duration-200">
        <CardContent className="p-6">
          <ErrorState
            title="Failed to load publishing queue"
            description={error}
            onRetry={onRetry}
            retryLabel="Try again"
            buttonAriaLabel="Retry loading publishing queue"
          />
        </CardContent>
      </Card>
    )
  }

  if (jobs.length === 0) {
    return (
      <Card className="overflow-hidden transition-shadow duration-200">
        <CardContent className="p-0">
          <div
            role="status"
            aria-live="polite"
            className={cn(
              'flex flex-col items-center justify-center gap-6 rounded-xl',
              'border-2 border-dashed border-muted bg-muted/20 p-8 sm:p-12 text-center',
              'animate-fade-in min-h-[240px] sm:min-h-[280px] mx-4 my-6'
            )}
          >
            <div className="rounded-2xl bg-muted/50 p-6 ring-1 ring-muted/80">
              <LayoutList className="h-12 w-12 text-muted-foreground/70" aria-hidden />
            </div>
            <div className="space-y-2 max-w-[320px]">
              <h3 className="text-base font-semibold text-foreground sm:text-lg">
                {emptyMessage}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Schedule content from Content Studio or Editorial Calendar to see jobs here.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" size="sm" asChild className="hover:scale-[1.02] active:scale-[0.98] transition-transform">
                <Link to="/dashboard/content-studio">
                  <Send className="h-4 w-4 mr-2" aria-hidden />
                  Content Studio
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="hover:scale-[1.02] active:scale-[0.98] transition-transform">
                <Link to="/dashboard/calendar">
                  <Calendar className="h-4 w-4 mr-2" aria-hidden />
                  Calendar
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden transition-shadow duration-200 hover:shadow-card-hover">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b sticky top-0">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      jobs.length > 0 && selectedIds.size === jobs.length
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <SortHeader label="Job ID" sortKey="created_at" />
                <SortHeader label="Content Title" sortKey="title" />
                <SortHeader label="Platform" sortKey="platform" />
                <SortHeader label="Scheduled Time" sortKey="scheduled_time" />
                <SortHeader label="Status" sortKey="status" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedJobs.map((job) => (
                  <TableRow
                    key={job.id}
                    className={cn(
                      'cursor-pointer transition-colors duration-200',
                      'hover:bg-muted/30'
                    )}
                    onClick={() => onJobClick(job)}
                    data-state={selectedIds.has(job.id) ? 'selected' : undefined}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(job.id)}
                        onCheckedChange={() => toggleSelect(job.id)}
                        aria-label={`Select job ${job.id}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-micro">
                      {job.id.slice(0, 8)}…
                    </TableCell>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {job.platform}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatScheduledTime(job.scheduled_time)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[job.status] ?? 'default'}>
                        {job.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
