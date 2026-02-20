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
import { BarChart3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { AnalyticsChartPoint } from '@/types/analytics'

export interface AnalyticsChartsProps {
  chartData: AnalyticsChartPoint[]
  isLoading?: boolean
}

function ChartsEmptyState() {
  return (
    <Card
      className="col-span-full overflow-hidden border-dashed border-2 border-muted-foreground/20 bg-muted/30 transition-all duration-300 hover:shadow-card-hover"
      role="status"
      aria-live="polite"
    >
      <CardContent className="flex flex-col items-center justify-center gap-6 py-16 px-6 sm:py-20 sm:px-8 min-h-[280px] animate-fade-in">
        <div className="rounded-2xl bg-muted/50 p-8 ring-1 ring-muted/80">
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

export function AnalyticsCharts({ chartData, isLoading }: AnalyticsChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

  if (chartData.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartsEmptyState />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle>Impressions</CardTitle>
          <CardDescription>Daily impressions over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity={0} />
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
        <CardHeader>
          <CardTitle>Engagement</CardTitle>
          <CardDescription>Daily engagement over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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
                  fill="rgb(var(--accent))"
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
