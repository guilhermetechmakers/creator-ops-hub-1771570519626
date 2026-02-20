import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { FileText, Loader2, TrendingUp } from 'lucide-react'
import type { TopPost } from '@/types/analytics'
import { cn } from '@/lib/utils'

const CARD_SHADOW_CLASSES =
  'shadow-card transition-all duration-300 hover:shadow-card-hover'

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export interface AnalyticsTopPostsProps {
  topPosts: TopPost[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

export function AnalyticsTopPosts({
  topPosts,
  isLoading,
  error,
  onRetry,
}: AnalyticsTopPostsProps) {
  if (error) {
    return (
      <Card className={cn('overflow-hidden', CARD_SHADOW_CLASSES)}>
        <CardContent className="p-0">
          <ErrorState
            title="Unable to load top posts"
            description={error}
            onRetry={onRetry}
            retryLabel="Try again"
            buttonAriaLabel="Retry loading top posts"
          />
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card
        className={cn('overflow-hidden', CARD_SHADOW_CLASSES)}
        role="status"
        aria-busy="true"
        aria-live="polite"
        aria-label="Top posts are loading"
      >
        <CardHeader>
          <div className="flex items-center gap-2" aria-hidden>
            <div className="h-5 w-5 rounded bg-muted animate-pulse" />
            <Skeleton className="h-6 w-32" shimmer />
          </div>
          <Skeleton className="h-4 w-48 mt-2" shimmer />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8" aria-hidden>
            <Loader2
              className="h-8 w-8 animate-spin text-muted-foreground"
              aria-hidden
            />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" shimmer />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!topPosts || topPosts.length === 0) {
    return (
      <Card
        className={cn(
          'overflow-hidden border-dashed border-2 border-muted-foreground/20 bg-muted/30',
          CARD_SHADOW_CLASSES
        )}
        role="status"
        aria-live="polite"
        aria-label="No top posts data available"
      >
        <CardContent className="flex flex-col items-center justify-center gap-6 py-16 px-6 sm:py-20 sm:px-8 min-h-[280px] animate-fade-in">
          <div
            className="rounded-2xl bg-muted/50 p-8 ring-1 ring-muted/80"
            aria-hidden
          >
            <TrendingUp
              className="h-16 w-16 text-muted-foreground/70 mx-auto"
              aria-hidden
            />
          </div>
          <div className="text-center space-y-2 max-w-sm">
            <h3
              className="text-base font-semibold text-foreground sm:text-lg"
              id="top-posts-empty-title"
            >
              No top posts yet
            </h3>
            <p
              className="text-sm text-muted-foreground leading-relaxed"
              id="top-posts-empty-desc"
            >
              Publish content and connect your channels to see performance
              metrics here. Try adjusting your date range or filters.
            </p>
          </div>
          <Button
            asChild
            className="mt-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
            aria-label="Create your first content to see analytics"
          >
            <Link to="/dashboard/content-editor/new">
              <FileText className="h-4 w-4 mr-2" aria-hidden />
              Create content
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('overflow-hidden', CARD_SHADOW_CLASSES)}>
      <CardHeader>
        <CardTitle
          id="top-posts-title"
          aria-label="Top posts by engagement"
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-5 w-5 text-primary" aria-hidden />
          Top Posts
        </CardTitle>
        <CardDescription
          id="top-posts-description"
          aria-describedby="top-posts-title"
        >
          Content performance by engagement
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table
            role="table"
            aria-labelledby="top-posts-title"
            aria-describedby="top-posts-description"
          >
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-medium">Title</TableHead>
                <TableHead className="font-medium">Channel</TableHead>
                <TableHead className="font-medium text-right">
                  Impressions
                </TableHead>
                <TableHead className="font-medium text-right">
                  Engagement
                </TableHead>
                <TableHead className="font-medium text-right">Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPosts.map((post) => (
                <TableRow
                  key={post.id}
                  className={cn(
                    'transition-colors duration-200',
                    'hover:bg-muted/50'
                  )}
                >
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {post.title}
                  </TableCell>
                  <TableCell>{post.channel}</TableCell>
                  <TableCell className="text-right">
                    {formatNumber(post.impressions)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(post.engagement)}
                  </TableCell>
                  <TableCell className="text-right">
                    {post.engagementRate.toFixed(1)}%
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
