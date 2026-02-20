import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const data = [
  { name: 'Mon', impressions: 4000, engagement: 240 },
  { name: 'Tue', impressions: 3000, engagement: 198 },
  { name: 'Wed', impressions: 5000, engagement: 320 },
  { name: 'Thu', impressions: 4500, engagement: 280 },
  { name: 'Fri', impressions: 6000, engagement: 390 },
  { name: 'Sat', impressions: 5500, engagement: 350 },
  { name: 'Sun', impressions: 4800, engagement: 310 },
]

export function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Performance insights</p>
        </div>
        <Button variant="outline">Export CSV</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Impressions</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-micro" />
                  <YAxis className="text-micro" />
                  <Tooltip />
                  <Area type="monotone" dataKey="impressions" stroke="rgb(var(--primary))" fill="rgb(var(--primary))" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Engagement</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-micro" />
                  <YAxis className="text-micro" />
                  <Tooltip />
                  <Area type="monotone" dataKey="engagement" stroke="rgb(var(--accent))" fill="rgb(var(--accent))" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
