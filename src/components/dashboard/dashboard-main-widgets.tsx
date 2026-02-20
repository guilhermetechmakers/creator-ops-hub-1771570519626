import { Link } from 'react-router-dom'
import {
  Calendar,
  Clock,
  Search,
  FolderOpen,
  Mail,
  ChevronRight,
  FileText,
  LayoutTemplate,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export interface CalendarEvent {
  id: string
  summary: string
  start: string
  end: string
}

export interface GmailThread {
  id: string
  snippet: string
}

export interface MainWidgetsProps {
  calendarEvents?: CalendarEvent[]
  gmailThreads?: GmailThread[]
  scheduledCount?: number
  researchSummaries?: { title: string; time: string; score: number }[]
  isLoadingCalendar?: boolean
  isLoadingGmail?: boolean
  googleConnected?: boolean
}

export function DashboardMainWidgets({
  calendarEvents = [],
  gmailThreads = [],
  scheduledCount = 0,
  researchSummaries = [],
  isLoadingCalendar = false,
  isLoadingGmail = false,
  googleConnected = false,
}: MainWidgetsProps) {
  return (
    <div className="space-y-6">
      {/* Today + Scheduled + Quick stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="overflow-hidden bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-small font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingCalendar ? (
              <Skeleton className="h-16 w-full" />
            ) : calendarEvents.length > 0 ? (
              <div className="space-y-2">
                {calendarEvents.slice(0, 3).map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-2 text-small p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="truncate">{e.summary}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-small text-muted-foreground">
                {googleConnected ? 'No events today' : 'Connect Google Calendar'}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-small font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{scheduledCount}</p>
            <p className="text-small text-muted-foreground">upcoming this week</p>
            <Button variant="link" size="sm" className="p-0 h-auto mt-2" asChild>
              <Link to="/dashboard/calendar">
                View calendar
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-small font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Flagged Gmail
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingGmail ? (
              <Skeleton className="h-16 w-full" />
            ) : gmailThreads.length > 0 ? (
              <div className="space-y-2">
                {gmailThreads.slice(0, 2).map((t) => (
                  <p key={t.id} className="text-small truncate text-muted-foreground">
                    {t.snippet}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-small text-muted-foreground">
                {googleConnected ? 'No flagged emails' : 'Connect Gmail'}
              </p>
            )}
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
              {researchSummaries.length > 0
                ? researchSummaries.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors duration-200"
                    >
                      <div>
                        <p className="font-medium">{r.title}</p>
                        <p className="text-small text-muted-foreground">{r.time}</p>
                      </div>
                      <Badge variant="secondary">{r.score}%</Badge>
                    </div>
                  ))
                : [1, 2, 3].map((i) => (
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

        {/* Recent Assets + Quick Create */}
        <div className="space-y-6">
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
                    className="aspect-square rounded-lg bg-muted flex items-center justify-center hover:ring-2 hover:ring-primary/50 transition-all duration-200 cursor-pointer"
                  >
                    <FolderOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10">
            <CardHeader>
              <CardTitle>Quick Create</CardTitle>
              <CardDescription>New brief, template, or content</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button asChild className="hover:scale-[1.02] transition-transform">
                <Link to="/dashboard/studio/new">
                  <FileText className="h-4 w-4 mr-2" />
                  New Brief
                </Link>
              </Button>
              <Button variant="outline" asChild className="hover:scale-[1.02] transition-transform">
                <Link to="/dashboard/studio/new">
                  <LayoutTemplate className="h-4 w-4 mr-2" />
                  New Template
                </Link>
              </Button>
              <Button variant="outline" asChild className="hover:scale-[1.02] transition-transform">
                <Link to="/dashboard/research/new">
                  <Search className="h-4 w-4 mr-2" />
                  New Research
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
