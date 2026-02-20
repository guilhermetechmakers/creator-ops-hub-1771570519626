import { useRef, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  isLoading?: boolean
  hasMore?: boolean
  onViewModeChange?: (useInfinite: boolean) => void
  /** Customize empty state when totalCount is 0 */
  emptyTitle?: string
  emptyDescription?: string
  onEmptyAction?: () => void
  emptyActionLabel?: string
  /** Accessible label for the empty state action button */
  emptyActionAriaLabel?: string
  /** When true, return null when totalCount is 0 (parent handles empty state) */
  hideEmptyState?: boolean
  className?: string
}

export function ContentPagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onLoadMore,
  useInfiniteScroll = false,
  isLoading = false,
  hasMore = page < totalPages,
  onViewModeChange,
  emptyTitle = 'No items to display',
  emptyDescription = 'There are no items to show in this view. Try adjusting your filters or add new content to get started.',
  onEmptyAction,
  emptyActionLabel = 'Add content',
  emptyActionAriaLabel,
  hideEmptyState = false,
  className,
}: ContentPaginationProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (!entry?.isIntersecting || !onLoadMore || isLoading || !hasMore) return
      onLoadMore()
    },
    [onLoadMore, isLoading, hasMore]
  )

  useEffect(() => {
    if (!useInfiniteScroll || !onLoadMore || !loadMoreRef.current) return
    const el = loadMoreRef.current
    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [useInfiniteScroll, onLoadMore, handleIntersect])

  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalCount)

  if (totalCount === 0) {
    if (hideEmptyState) return null
    return (
      <Card
        role="status"
        aria-live="polite"
        className={cn(
          'overflow-hidden border-dashed border-2 border-muted animate-fade-in',
          'transition-shadow duration-300 hover:shadow-card-hover',
          className
        )}
      >
        <CardContent className="flex flex-col items-center justify-center gap-6 py-12 px-6 sm:py-16 sm:px-8">
          <div
            className="rounded-2xl bg-muted/50 p-6 sm:p-8"
            aria-hidden
          >
            <Inbox className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/70 mx-auto" />
          </div>
          <div className="text-center space-y-2 max-w-sm">
            <h3 className="font-semibold text-foreground text-body sm:text-h3">
              {emptyTitle}
            </h3>
            <p className="text-small text-muted-foreground leading-relaxed">
              {emptyDescription}
            </p>
          </div>
          {onEmptyAction && (
            <Button
              onClick={onEmptyAction}
              className="inline-flex items-center gap-2 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[44px] min-w-[44px]"
              aria-label={emptyActionAriaLabel ?? emptyActionLabel}
            >
              <Inbox className="h-4 w-4 shrink-0" aria-hidden />
              {emptyActionLabel}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {onViewModeChange && totalCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-micro text-muted-foreground">View:</span>
          <div className="flex rounded-lg border p-0.5" role="group" aria-label="View mode">
            <button
              type="button"
              onClick={() => onViewModeChange(false)}
              className={cn(
                'rounded-md px-3 py-1.5 text-micro font-medium transition-colors',
                !useInfiniteScroll
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="Use pagination view"
              aria-pressed={!useInfiniteScroll}
            >
              Pagination
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange(true)}
              className={cn(
                'rounded-md px-3 py-1.5 text-micro font-medium transition-colors',
                useInfiniteScroll
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="Use load more view"
              aria-pressed={useInfiniteScroll}
            >
              Load more
            </button>
          </div>
        </div>
      )}
      <div
        className={cn(
          'flex flex-col sm:flex-row items-center justify-between gap-4 py-4',
          useInfiniteScroll && 'flex-wrap'
        )}
      >
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-small text-muted-foreground">
            Showing {start}–{end} of {totalCount}
          </p>
          {onPageSizeChange && !useInfiniteScroll && (
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
        {!useInfiniteScroll && (
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
        )}
      </div>

      {useInfiniteScroll && hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-small">Loading more...</span>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              className="transition-transform duration-200 hover:scale-[1.02]"
              aria-label="Load more content"
            >
              Load more
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
