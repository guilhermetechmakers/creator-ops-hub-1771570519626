import { FileText, FolderOpen, Search, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export interface ActivityItem {
  id: string
  icon: 'file' | 'folder' | 'research' | 'comment'
  text: string
  time: string
}

const iconMap = {
  file: FileText,
  folder: FolderOpen,
  research: Search,
  comment: MessageCircle,
}

interface DashboardActivityFeedProps {
  items?: ActivityItem[]
}

const defaultItems: ActivityItem[] = [
  { id: '1', icon: 'file', text: 'Content "Launch post" was published', time: '1h ago' },
  { id: '2', icon: 'folder', text: 'Asset "hero.png" was uploaded', time: '2h ago' },
  { id: '3', icon: 'research', text: 'Research "competitor analysis" completed', time: '3h ago' },
  { id: '4', icon: 'comment', text: 'New mention in "Q1 Campaign"', time: '4h ago' },
]

export function DashboardActivityFeed({ items = defaultItems }: DashboardActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>Comments, mentions, publish status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map(({ id, icon, text, time }) => {
            const Icon = iconMap[icon]
            return (
              <div
                key={id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-small">{text}</p>
                  <p className="text-micro text-muted-foreground">{time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
