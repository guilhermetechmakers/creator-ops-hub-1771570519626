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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { AnalyticsChartPoint } from '@/types/analytics'

export interface AnalyticsChartsProps {
  chartData: AnalyticsChartPoint[]
  isLoading?: boolean
}

export function AnalyticsCharts({ chartData, isLoading }: AnalyticsChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
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
