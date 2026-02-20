import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp } from 'lucide-react'
import type { TopPost } from '@/types/analytics'
import { cn } from '@/lib/utils'

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export interface AnalyticsTopPostsProps {
  topPosts: TopPost[]
  isLoading?: boolean
}

export function AnalyticsTopPosts({ topPosts, isLoading }: AnalyticsTopPostsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (topPosts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Top Posts
          </CardTitle>
          <CardDescription>Content performance by engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground">No content data yet</p>
            <p className="text-small text-muted-foreground mt-1">
              Publish content to see performance metrics here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Top Posts
        </CardTitle>
        <CardDescription>Content performance by engagement</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-medium">Title</TableHead>
                <TableHead className="font-medium">Channel</TableHead>
                <TableHead className="font-medium text-right">Impressions</TableHead>
                <TableHead className="font-medium text-right">Engagement</TableHead>
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
