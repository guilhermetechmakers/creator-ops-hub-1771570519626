import { Eye, Heart, TrendingUp, Users } from 'lucide-react'
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
          <Skeleton className="h-8 w-24" />
        ) : (
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        )}
      </CardContent>
    </Card>
  )
}

export interface AnalyticsOverviewCardsProps {
  overview: AnalyticsOverview | null
  isLoading?: boolean
}

export function AnalyticsOverviewCards({ overview, isLoading }: AnalyticsOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Impressions"
        value={overview ? formatNumber(overview.impressions) : '0'}
        icon={Eye}
        gradient="bg-gradient-to-br from-primary/5 to-transparent border-primary/10"
        isLoading={isLoading}
      />
      <MetricCard
        title="Engagement"
        value={overview ? formatNumber(overview.engagement) : '0'}
        icon={Heart}
        gradient="bg-gradient-to-br from-accent/5 to-transparent border-accent/10"
        isLoading={isLoading}
      />
      <MetricCard
        title="Top Posts"
        value={overview ? overview.topPostsCount : 0}
        icon={TrendingUp}
        gradient="bg-gradient-to-br from-success/5 to-transparent border-success/20"
        isLoading={isLoading}
      />
      <MetricCard
        title="Follower Growth"
        value={overview ? `+${formatNumber(overview.followerGrowth)}` : '+0'}
        icon={Users}
        gradient="bg-gradient-to-br from-secondary to-transparent border-border"
        isLoading={isLoading}
      />
    </div>
  )
}
