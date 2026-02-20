import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ContentPaginationProps {
  page: number
  totalPages: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
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
  useInfiniteScroll: _useInfiniteScroll = false,
  className,
}: ContentPaginationProps) {
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalCount)

  if (totalPages <= 1 && totalCount <= pageSize) {
    return null
  }

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 py-4',
        className
      )}
    >
      <p className="text-small text-muted-foreground">
        Showing {start}–{end} of {totalCount}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="transition-transform duration-200 hover:scale-[1.02] disabled:opacity-50"
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
          className="transition-transform duration-200 hover:scale-[1.02] disabled:opacity-50"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
