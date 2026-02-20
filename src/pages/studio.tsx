import { Link } from 'react-router-dom'
import { Plus, Search, Filter, FileEdit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const statusColors = {
  draft: 'secondary',
  review: 'warning',
  scheduled: 'default',
  published: 'success',
} as const

type ContentItem = {
  id: string
  title: string
  status: keyof typeof statusColors
  channel: string
  updated: string
}

/** Empty state when content table has no items - per Design Reference: icon, helpful copy, clear CTA */
function ContentTableEmptyState() {
  return (
    <Card
      className="overflow-hidden border-2 border-dashed border-muted bg-muted/5 animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <CardContent className="flex flex-col items-center justify-center gap-6 py-16 px-8 min-h-[280px] sm:min-h-[320px]">
        <div className="rounded-2xl bg-muted/50 p-8 ring-1 ring-muted/80 transition-transform duration-200 hover:scale-[1.02]">
          <FileEdit
            className="h-16 w-16 text-muted-foreground/70 mx-auto"
            aria-hidden
          />
        </div>
        <div className="text-center space-y-2 max-w-sm">
          <h3 className="text-body font-semibold text-foreground">No content yet</h3>
          <p className="text-small text-muted-foreground leading-relaxed">
            Create your first content item to get started. Use the editor to draft posts, scripts, and outlines with templates and AI assistance.
          </p>
        </div>
        <Button asChild className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
          <Link to="/dashboard/content-editor/new">
            <Plus className="h-4 w-4 mr-2" />
            New Content
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

const MOCK_CONTENT: ContentItem[] = [
  { id: '1', title: 'Launch announcement', status: 'draft', channel: 'Instagram', updated: '2h ago' },
  { id: '2', title: 'Product demo thread', status: 'published', channel: 'X', updated: '1d ago' },
  { id: '3', title: 'Tutorial script', status: 'review', channel: 'YouTube', updated: '3h ago' },
]

export function StudioPage() {
  const contentItems: ContentItem[] = MOCK_CONTENT

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold">Content Studio</h1>
          <p className="text-muted-foreground mt-1">Manage content items and briefs</p>
        </div>
        <Button asChild>
          <Link to="/dashboard/content-editor/new">
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

      {/* Content table or empty state */}
      {contentItems.length === 0 ? (
        <ContentTableEmptyState />
      ) : (
        <Card className="overflow-hidden transition-shadow duration-200 hover:shadow-card-hover">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-left p-4 font-medium">Title</TableHead>
                    <TableHead className="text-left p-4 font-medium">Status</TableHead>
                    <TableHead className="text-left p-4 font-medium">Channel</TableHead>
                    <TableHead className="text-left p-4 font-medium">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <TableCell className="p-4">
                        <Link
                          to={`/dashboard/content-editor/${item.id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {item.title}
                        </Link>
                      </TableCell>
                      <TableCell className="p-4">
                        <Badge variant={statusColors[item.status]}>{item.status}</Badge>
                      </TableCell>
                      <TableCell className="p-4 text-muted-foreground">{item.channel}</TableCell>
                      <TableCell className="p-4 text-muted-foreground">{item.updated}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
