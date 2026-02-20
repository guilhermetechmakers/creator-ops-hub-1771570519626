import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const days = Array.from({ length: 35 }, (_, i) => i + 1)
const channels = [
  { name: 'Instagram', color: 'bg-pink-500' },
  { name: 'X', color: 'bg-gray-900' },
  { name: 'YouTube', color: 'bg-red-500' },
]

export function CalendarPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold">Editorial Calendar</h1>
          <p className="text-muted-foreground mt-1">Plan and schedule Instagram, X, and YouTube</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/dashboard/content-editor/new">
              <Plus className="h-4 w-4 mr-2" />
              New post
            </Link>
          </Button>
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline">Month</Button>
        </div>
      </div>

      {/* Channel legend */}
      <div className="flex gap-4">
        {channels.map((c) => (
          <div key={c.name} className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${c.color}`} />
            <span className="text-small">{c.name}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="p-2 text-center text-small font-medium text-muted-foreground border-r last:border-r-0">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((d) => (
              <div
                key={d}
                className="min-h-[120px] p-2 border-b border-r last:border-r-0 hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <span className="text-small text-muted-foreground">{d}</span>
                {d === 15 && (
                  <div className="mt-2 p-2 rounded bg-primary/10 text-primary text-micro">
                    Launch post
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
