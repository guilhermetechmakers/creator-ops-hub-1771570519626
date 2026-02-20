import { BarChart2, Eye, Heart, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { AnalyticsOverview } from '@/types/analytics'
import { cn } from '@/lib/utils'

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  gradient: string
  isLoading?: boolean
}

function MetricCard({ title, value, icon: Icon, gradient, isLoading }: MetricCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:scale-[1.02]',
        gradient
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <span className="text-small font-medium text-muted-foreground">{title}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" shimmer />
        ) : (
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        )}
      </CardContent>
    </Card>
  )
}

/** Empty state when overview is null - per Design Reference: icon, helpful copy */
function OverviewEmptyState() {
  return (
    <Card
      className="col-span-full overflow-hidden border-dashed border-2 border-muted-foreground/20 bg-muted/30 transition-all duration-300 hover:shadow-card-hover"
      role="status"
      aria-live="polite"
      aria-label="No overview metrics available"
    >
      <CardContent className="flex flex-col items-center justify-center gap-6 py-16 px-6 sm:py-20 sm:px-8 min-h-[200px] animate-fade-in">
        <div
          className="rounded-2xl bg-muted/50 p-8 ring-1 ring-muted/80"
          aria-hidden
        >
          <BarChart2
            className="h-16 w-16 text-muted-foreground/70 mx-auto"
            aria-hidden
          />
        </div>
        <div className="text-center space-y-2 max-w-sm">
          <h3 className="text-base font-semibold text-foreground sm:text-lg" id="overview-empty-heading">
            No overview metrics yet
          </h3>
          <p id="overview-empty-description" className="text-sm text-muted-foreground leading-relaxed">
            Connect your channels and publish content to see impressions, engagement, top posts, and follower growth. Try adjusting your date range or filters.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/** Page-level loading skeleton for all overview metric cards */
function OverviewLoadingSkeleton() {
  const gradients = [
    'bg-gradient-to-br from-primary/5 to-transparent border-primary/10',
    'bg-gradient-to-br from-accent/5 to-transparent border-accent/10',
    'bg-gradient-to-br from-success/5 to-transparent border-success/20',
    'bg-gradient-to-br from-secondary to-transparent border-border',
  ]
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Overview metrics are loading"
    >
      {gradients.map((gradient, i) => (
        <Card key={i} className={cn('overflow-hidden', gradient)}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-20" shimmer />
            <Skeleton className="h-9 w-9 rounded-lg" shimmer />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24" shimmer />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export interface AnalyticsOverviewCardsProps {
  overview: AnalyticsOverview | null
  isLoading?: boolean
}

export function AnalyticsOverviewCards({ overview, isLoading }: AnalyticsOverviewCardsProps) {
  if (isLoading) {
    return <OverviewLoadingSkeleton />
  }

  if (!overview) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <OverviewEmptyState />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Impressions"
        value={formatNumber(overview.impressions)}
        icon={Eye}
        gradient="bg-gradient-to-br from-primary/5 to-transparent border-primary/10"
      />
      <MetricCard
        title="Engagement"
        value={formatNumber(overview.engagement)}
        icon={Heart}
        gradient="bg-gradient-to-br from-accent/5 to-transparent border-accent/10"
      />
      <MetricCard
        title="Top Posts"
        value={overview.topPostsCount}
        icon={TrendingUp}
        gradient="bg-gradient-to-br from-success/5 to-transparent border-success/20"
      />
      <MetricCard
        title="Follower Growth"
        value={`+${formatNumber(overview.followerGrowth)}`}
        icon={Users}
        gradient="bg-gradient-to-br from-secondary to-transparent border-border"
      />
    </div>
  )
}
