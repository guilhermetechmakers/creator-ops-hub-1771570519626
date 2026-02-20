import { Link } from 'react-router-dom'
import {
  Calendar,
  FileText,
  FolderOpen,
  Search,
  Plus,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-h1 font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your single-pane operational view</p>
      </div>

      {/* Upgrade CTA */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
          <div>
            <h3 className="font-semibold">Upgrade to Pro</h3>
            <p className="text-small text-muted-foreground">Unlock unlimited research credits and team features.</p>
          </div>
          <Button>Upgrade</Button>
        </CardContent>
      </Card>

      {/* Widgets grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-small font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">3</p>
            <p className="text-small text-muted-foreground">posts scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-small font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">12</p>
            <p className="text-small text-muted-foreground">upcoming this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-small font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">+24%</p>
            <p className="text-small text-muted-foreground">vs last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Research */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Research</CardTitle>
              <CardDescription>Latest OpenClaw research outputs</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/research">
                <Search className="h-4 w-4 mr-2" />
                View all
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">Research topic {i}</p>
                    <p className="text-small text-muted-foreground">2 hours ago</p>
                  </div>
                  <Badge variant="secondary">85%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Assets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Assets</CardTitle>
              <CardDescription>Latest uploads to your library</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/library">
                <FolderOpen className="h-4 w-4 mr-2" />
                View all
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-muted flex items-center justify-center hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer"
                >
                  <FolderOpen className="h-8 w-8 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Create + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Create</CardTitle>
            <CardDescription>Start creating content</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button asChild>
              <Link to="/dashboard/studio/new">
                <Plus className="h-4 w-4 mr-2" />
                New Content
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard/research/new">
                <Search className="h-4 w-4 mr-2" />
                New Research
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Activity Feed</CardTitle>
            <CardDescription>Recent workspace activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { icon: FileText, text: 'Content "Launch post" was published', time: '1h ago' },
                { icon: FolderOpen, text: 'Asset "hero.png" was uploaded', time: '2h ago' },
                { icon: Search, text: 'Research "competitor analysis" completed', time: '3h ago' },
              ].map(({ icon: Icon, text, time }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-small">{text}</p>
                    <p className="text-micro text-muted-foreground">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
