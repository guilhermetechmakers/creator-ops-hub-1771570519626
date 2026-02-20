import { Link } from 'react-router-dom'
import {
  Bell,
  CheckCheck,
  FileText,
  MessageCircle,
  AlertCircle,
  Send,
  Settings,
  Sliders,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { useNotifications } from '@/hooks/use-notifications'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/notifications'

const typeIcons: Record<string, typeof FileText> = {
  new_content: FileText,
  review_action: AlertCircle,
  publish_status: Send,
  failed_publish: AlertCircle,
  system_alert: Bell,
  comment: MessageCircle,
  mention: MessageCircle,
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

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
}) {
  const Icon = typeIcons[notification.type] ?? Bell
  const isUnread = !notification.read_at

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg transition-all duration-200',
        isUnread && 'bg-primary/5 border-l-2 border-l-primary',
        'hover:bg-muted/50'
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-small font-medium">{notification.title}</p>
        {notification.body && (
          <p className="text-micro text-muted-foreground mt-0.5 line-clamp-2">
            {notification.body}
          </p>
        )}
        <p className="text-micro text-muted-foreground mt-1">
          {formatTimeAgo(notification.created_at)}
        </p>
      </div>
      {isUnread && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={(e) => {
            e.preventDefault()
            onMarkRead(notification.id)
          }}
          aria-label="Mark as read"
        >
          <CheckCheck className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

export function NotificationsDropdown() {
  const { notifications, unreadCount, isLoading, error, markRead, refetch } = useNotifications({
    limit: 10,
    unreadOnly: false,
  })

  return (
    <DropdownMenu onOpenChange={(open) => open && refetch()}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative hover:bg-muted transition-colors duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent text-accent-foreground text-micro font-medium px-1"
              aria-hidden
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[380px] max-h-[min(480px,70vh)] p-0"
        sideOffset={8}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-micro"
              onClick={() => markRead(undefined, true)}
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <div className="overflow-y-auto max-h-[360px] min-h-[200px]">
          {isLoading ? (
            <div className="p-4 space-y-3 animate-fade-in" role="status" aria-live="polite" aria-label="Loading notifications">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" shimmer />
              ))}
            </div>
          ) : error ? (
            <div className="p-4">
              <ErrorState
                title="Couldn't load notifications"
                description={error.message}
                onRetry={refetch}
                retryLabel="Try again"
                buttonAriaLabel="Retry loading notifications"
                className="py-8"
              />
            </div>
          ) : notifications.length > 0 ? (
            <div className="p-2 space-y-1">
              {notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={(id) => markRead([id])}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" aria-hidden />
              <p className="text-small font-medium text-muted-foreground">
                No notifications yet
              </p>
              <p className="text-micro text-muted-foreground mt-1 max-w-[240px]">
                You'll see new content, review actions, and publish status here
              </p>
              <Button
                asChild
                size="sm"
                className="mt-4 w-full max-w-[200px] transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link
                  to="/dashboard/settings-&-preferences"
                  className="inline-flex items-center justify-center gap-2"
                >
                  <Sliders className="h-4 w-4" aria-hidden />
                  Customize notifications
                </Link>
              </Button>
            </div>
          )}
        </div>
        <div className="p-2 border-t">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link to="/dashboard/settings-&-preferences" className="flex items-center justify-center gap-2">
              <Settings className="h-4 w-4" />
              Notification settings
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
