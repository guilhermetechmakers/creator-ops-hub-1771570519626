import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { BarChart3, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { AnalyticsChartPoint } from '@/types/analytics'

export interface AnalyticsChartsProps {
  chartData: AnalyticsChartPoint[]
  isLoading?: boolean
  /** Optional callback for refresh action; when provided, shows a refresh button */
  onRefresh?: () => void
  /** Optional: whether a refresh is in progress (for loading state on refresh button) */
  isRefreshing?: boolean
}

function ChartsEmptyState() {
  return (
    <Card
      className="col-span-full overflow-hidden border-dashed border-2 border-muted-foreground/20 bg-muted/30 transition-all duration-300 hover:shadow-card-hover"
      role="status"
      aria-live="polite"
      aria-label="No chart data available"
    >
      <CardContent className="flex flex-col items-center justify-center gap-6 py-16 px-6 sm:py-20 sm:px-8 min-h-[280px] animate-fade-in">
        <div
          className="rounded-2xl bg-muted/50 p-8 ring-1 ring-muted/80"
          aria-hidden
        >
          <BarChart3
            className="h-16 w-16 text-muted-foreground/70 mx-auto"
            aria-hidden
          />
        </div>
        <div className="text-center space-y-2 max-w-sm">
          <h3 className="text-base font-semibold text-foreground sm:text-lg">
            No chart data yet
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Connect your channels and publish content to see impressions and engagement trends over time. Try adjusting your date range or filters.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function ChartCardHeader({
  title,
  description,
  onRefresh,
  isRefreshing,
}: {
  title: string
  description: string
  onRefresh?: () => void
  isRefreshing?: boolean
}) {
  return (
    <CardHeader className="flex flex-row items-start justify-between gap-4">
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
      {onRefresh && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="shrink-0 h-9 w-9 transition-transform duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={isRefreshing ? 'Refreshing chart data' : 'Refresh chart data'}
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            aria-hidden
          />
        </Button>
      )}
    </CardHeader>
  )
}

export function AnalyticsCharts({
  chartData,
  isLoading,
  onRefresh,
  isRefreshing = false,
}: AnalyticsChartsProps) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        role="status"
        aria-busy="true"
        aria-live="polite"
        aria-label="Charts are loading"
      >
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" shimmer />
            <Skeleton className="h-4 w-24 mt-2" shimmer />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" shimmer />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" shimmer />
            <Skeleton className="h-4 w-24 mt-2" shimmer />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" shimmer />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartsEmptyState />
      </div>
    )
  }

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      role="region"
      aria-label="Analytics charts"
    >
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
        <ChartCardHeader
          title="Impressions"
          description="Daily impressions over time"
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
        <CardContent>
          <div
            className="h-[200px] min-h-[200px]"
            role="img"
            aria-label="Impressions over time chart showing daily impression counts"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} aria-hidden>
                <defs>
                  <linearGradient
                    id="impressionsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="rgb(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor="rgb(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-micro" />
                <YAxis className="text-micro" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid rgb(var(--border))',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="impressions"
                  stroke="rgb(var(--primary))"
                  fill="url(#impressionsGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
        <ChartCardHeader
          title="Engagement"
          description="Daily engagement over time"
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
        <CardContent>
          <div
            className="h-[200px] min-h-[200px]"
            role="img"
            aria-label="Engagement over time chart showing daily engagement counts"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} aria-hidden>
                <defs>
                  <linearGradient
                    id="engagementGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="rgb(var(--accent))"
                      stopOpacity={0.9}
                    />
                    <stop
                      offset="100%"
                      stopColor="rgb(var(--accent))"
                      stopOpacity={0.4}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-micro" />
                <YAxis className="text-micro" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid rgb(var(--border))',
                  }}
                />
                <Bar
                  dataKey="engagement"
                  fill="url(#engagementGradient)"
                  stroke="rgb(var(--accent))"
                  strokeWidth={1}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
