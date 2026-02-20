import { Link } from 'react-router-dom'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const statusColors = {
  draft: 'secondary',
  review: 'warning',
  scheduled: 'default',
  published: 'success',
} as const

export function StudioPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold">Content Studio</h1>
          <p className="text-muted-foreground mt-1">Manage content items and briefs</p>
        </div>
        <Button asChild>
          <Link to="/dashboard/studio/new">
            <Plus className="h-4 w-4 mr-2" />
            New Content
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search content..." className="pl-9" />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Content table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Title</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Channel</th>
                  <th className="text-left p-4 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { title: 'Launch announcement', status: 'draft' as const, channel: 'Instagram', updated: '2h ago' },
                  { title: 'Product demo thread', status: 'published' as const, channel: 'X', updated: '1d ago' },
                  { title: 'Tutorial script', status: 'review' as const, channel: 'YouTube', updated: '3h ago' },
                ].map((item, i) => (
                  <tr
                    key={i}
                    className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <Link to={`/dashboard/studio/${i + 1}`} className="font-medium hover:text-primary">
                        {item.title}
                      </Link>
                    </td>
                    <td className="p-4">
                      <Badge variant={statusColors[item.status]}>{item.status}</Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{item.channel}</td>
                    <td className="p-4 text-muted-foreground">{item.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
