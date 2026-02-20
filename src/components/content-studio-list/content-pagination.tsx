import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'

const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '10 per page' },
  { value: '25', label: '25 per page' },
  { value: '50', label: '50 per page' },
  { value: '100', label: '100 per page' },
]

export interface ContentPaginationProps {
  page: number
  totalPages: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  onLoadMore?: () => void
  useInfiniteScroll?: boolean
  className?: string
}

export function ContentPagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  useInfiniteScroll: _useInfiniteScroll = false,
  className,
}: ContentPaginationProps) {
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalCount)

  if (totalCount === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 py-4',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-small text-muted-foreground">
          Showing {start}–{end} of {totalCount}
        </p>
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="page-size" className="text-small text-muted-foreground">
              Items per page
            </label>
            <Select
              id="page-size"
              options={PAGE_SIZE_OPTIONS}
              value={String(pageSize)}
              onChange={(e) => {
                const val = Number(e.target.value)
                onPageSizeChange(val)
              }}
              aria-label="Items per page"
              className="w-[120px]"
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-small font-medium px-2">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
