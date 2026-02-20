import { FileText, FolderOpen, Search, MessageCircle, Send, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useNotifications } from '@/hooks/use-notifications'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/notifications'

export interface ActivityItem {
  id: string
  icon: 'file' | 'folder' | 'research' | 'comment' | 'publish' | 'alert'
  text: string
  time: string
}

const iconMap: Record<string, typeof FileText> = {
  file: FileText,
  folder: FolderOpen,
  research: Search,
  comment: MessageCircle,
  publish: Send,
  alert: AlertCircle,
}

const typeToIcon: Record<string, 'file' | 'folder' | 'research' | 'comment' | 'publish' | 'alert'> = {
  new_content: 'file',
  review_action: 'alert',
  publish_status: 'publish',
  failed_publish: 'alert',
  system_alert: 'alert',
  comment: 'comment',
  mention: 'comment',
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function notificationToActivityItem(n: Notification): ActivityItem {
  const icon = typeToIcon[n.type] ?? 'file'
  const text = n.body ? `${n.title}: ${n.body}` : n.title
  return {
    id: n.id,
    icon,
    text,
    time: formatTimeAgo(n.created_at),
  }
}

const defaultItems: ActivityItem[] = [
  { id: '1', icon: 'file', text: 'Content "Launch post" was published', time: '1h ago' },
  { id: '2', icon: 'folder', text: 'Asset "hero.png" was uploaded', time: '2h ago' },
  { id: '3', icon: 'research', text: 'Research "competitor analysis" completed', time: '3h ago' },
  { id: '4', icon: 'comment', text: 'New mention in "Q1 Campaign"', time: '4h ago' },
]

interface DashboardActivityFeedProps {
  items?: ActivityItem[]
}

export function DashboardActivityFeed({ items: propItems }: DashboardActivityFeedProps) {
  const { notifications, isLoading } = useNotifications({
    limit: 8,
    unreadOnly: false,
  })

  const activityItems: ActivityItem[] =
    propItems ??
    (notifications.length > 0
      ? notifications.map(notificationToActivityItem)
      : defaultItems)

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>Comments, mentions, publish status</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {activityItems.map(({ id, icon, text, time }, i) => {
              const Icon = iconMap[icon] ?? FileText
              return (
                <div
                  key={id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all duration-200',
                    'hover:border-primary/10 border border-transparent'
                  )}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-small line-clamp-2">{text}</p>
                    <p className="text-micro text-muted-foreground">{time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
