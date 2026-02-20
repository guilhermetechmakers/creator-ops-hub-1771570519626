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

export interface ScheduledPost {
  id: string
  title: string
  scheduledTime?: string
  dueDate?: string
  platform?: string
  channel?: string
  status: string
}

export interface RecentAsset {
  id: string
  title: string
  file_type?: string
  updated_at: string
}

export interface MainWidgetsProps {
  calendarEvents?: CalendarEvent[]
  gmailThreads?: GmailThread[]
  scheduledPosts?: ScheduledPost[]
  recentAssets?: RecentAsset[]
  scheduledCount?: number
  researchSummaries?: { id: string; title: string; time: string; score: number }[]
  isLoadingCalendar?: boolean
  isLoadingGmail?: boolean
  isLoadingScheduled?: boolean
  isLoadingAssets?: boolean
  isLoadingResearch?: boolean
  googleConnected?: boolean
}

function formatScheduledTime(d?: string) {
  if (!d) return ''
  const date = new Date(d)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  return isToday ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function DashboardMainWidgets({
  calendarEvents = [],
  gmailThreads = [],
  scheduledPosts = [],
  recentAssets = [],
  scheduledCount,
  researchSummaries = [],
  isLoadingCalendar = false,
  isLoadingGmail = false,
  isLoadingScheduled = false,
  isLoadingAssets = false,
  isLoadingResearch = false,
  googleConnected = false,
}: MainWidgetsProps) {
  const displayScheduledCount = scheduledCount ?? scheduledPosts.length
  return (
    <div className="space-y-6">
      {/* Today + Scheduled + Quick stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="overflow-hidden bg-gradient-to-br from-primary/5 to-transparent border-primary/10 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5">
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

        <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-small font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{displayScheduledCount}</p>
            <p className="text-small text-muted-foreground">upcoming this week</p>
            <Button variant="link" size="sm" className="p-0 h-auto mt-2" asChild>
              <Link to="/dashboard/calendar">
                View calendar
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5">
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

      {/* Scheduled posts list */}
      <Card className="transition-all duration-300 hover:shadow-card-hover">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Scheduled Posts</CardTitle>
            <CardDescription>Upcoming content and queue items</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/calendar">
              <Clock className="h-4 w-4 mr-2" />
              View calendar
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingScheduled ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : scheduledPosts.length > 0 ? (
            <div className="space-y-2">
              {scheduledPosts.map((p) => (
                <Link
                  key={p.id}
                  to={p.scheduledTime ? '/dashboard/publishing-queue-logs' : `/dashboard/content-editor/${p.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 hover:shadow-sm transition-all duration-200 group"
                >
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">{p.title}</p>
                    <p className="text-micro text-muted-foreground">
                      {formatScheduledTime(p.scheduledTime ?? p.dueDate)}
                      {(p.platform ?? p.channel) && ` · ${p.platform ?? p.channel}`}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Clock className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-small text-muted-foreground">No scheduled posts</p>
              <Button variant="outline" size="sm" className="mt-2" asChild>
                <Link to="/dashboard/content-editor/new">Create content</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Research */}
        <Card className="transition-all duration-300 hover:shadow-card-hover">
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
              {isLoadingResearch ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : researchSummaries.length > 0 ? (
                researchSummaries.map((r, i) => (
                  <Link
                    key={r.id}
                    to={`/dashboard/research?highlight=${r.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 block animate-fade-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div>
                      <p className="font-medium">{r.title}</p>
                      <p className="text-small text-muted-foreground">{r.time}</p>
                    </div>
                    <Badge variant="secondary">{r.score}%</Badge>
                  </Link>
                ))
              ) : (
                <div className="py-8 text-center">
                  <Search className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-small text-muted-foreground">No research yet</p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link to="/dashboard/research/new">Start research</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Assets + Quick Create */}
        <div className="space-y-6">
          <Card className="transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Assets</CardTitle>
                <CardDescription>Latest uploads to your library</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard/file-library">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  View all
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingAssets ? (
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              ) : recentAssets.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {recentAssets.map((a) => (
                    <Link
                      key={a.id}
                      to={`/dashboard/file-library?highlight=${a.id}`}
                      className="aspect-square rounded-lg bg-muted flex flex-col items-center justify-center hover:ring-2 hover:ring-primary/50 transition-all duration-200 cursor-pointer p-2"
                    >
                      <FolderOpen className="h-8 w-8 text-muted-foreground mb-1" />
                      <span className="text-micro truncate w-full text-center">{a.title}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <FolderOpen className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-small text-muted-foreground">No assets yet</p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link to="/dashboard/file-library">Upload assets</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10">
            <CardHeader>
              <CardTitle>Quick Create</CardTitle>
              <CardDescription>New brief, template, or content</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button asChild className="hover:scale-[1.02] transition-transform duration-200">
                <Link to="/dashboard/content-editor/new">
                  <FileText className="h-4 w-4 mr-2" />
                  New Brief
                </Link>
              </Button>
              <Button variant="outline" asChild className="hover:scale-[1.02] transition-transform duration-200">
                <Link to="/dashboard/content-editor/new">
                  <LayoutTemplate className="h-4 w-4 mr-2" />
                  New Template
                </Link>
              </Button>
              <Button variant="outline" asChild className="hover:scale-[1.02] transition-transform duration-200">
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
