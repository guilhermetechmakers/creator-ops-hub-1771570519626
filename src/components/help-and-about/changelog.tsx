import { GitBranch, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ChangelogEntry } from '@/types/help-and-about'

const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    id: '1',
    version: '2.1.0',
    date: '2025-02-20',
    title: 'Help & About and Documentation',
    status: 'released',
    items: [
      'New Help & About page with searchable docs',
      'FAQ section with common questions',
      'Contact support form for ticket submission',
      'Changelog and release notes',
      'Community links for feedback and roadmap',
    ],
  },
  {
    id: '2',
    version: '2.0.0',
    date: '2025-02-15',
    title: 'Content Studio and OpenClaw',
    status: 'released',
    items: [
      'Content Studio with AI-assisted editing',
      'OpenClaw credits for AI features',
      'File library integration',
      'Research and calendar views',
    ],
  },
  {
    id: '3',
    version: '1.5.0',
    date: '2025-02-01',
    title: 'Integrations and Analytics',
    status: 'released',
    items: [
      'New integrations (YouTube, Instagram, TikTok)',
      'Analytics dashboard with charts',
      'Publishing queue and logs',
      'Settings and preferences overhaul',
    ],
  },
  {
    id: '4',
    version: '2.2.0',
    date: 'Planned',
    title: 'Upcoming Features',
    status: 'planned',
    items: [
      'Bulk content scheduling',
      'Enhanced API v2',
      'Team collaboration improvements',
      'Mobile app',
    ],
  },
]

const STATUS_OPTIONS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  released: { label: 'Released', variant: 'default' },
  beta: { label: 'Beta', variant: 'secondary' },
  planned: { label: 'Planned', variant: 'outline' },
}

export function Changelog() {
  return (
    <Card className="animate-fade-in border-primary/10 bg-gradient-to-br from-card to-primary/5 transition-all duration-300 hover:shadow-card-hover hover:border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-h3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <GitBranch className="h-5 w-5 text-primary" />
          </div>
          Changelog
        </CardTitle>
        <p className="text-small text-muted-foreground">
          Release notes and product status
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {CHANGELOG_ENTRIES.map((entry, i) => (
            <div
              key={entry.id}
              className={cn(
                'border-b border-border last:border-0 py-6 animate-fade-in',
                i > 0 && 'animate-slide-up'
              )}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-semibold text-foreground">
                  v{entry.version}
                </span>
                {entry.status && STATUS_OPTIONS[entry.status] && (
                  <Badge
                    variant={STATUS_OPTIONS[entry.status].variant}
                    className="text-micro"
                  >
                    {STATUS_OPTIONS[entry.status].label}
                  </Badge>
                )}
                <span className="text-small text-muted-foreground">
                  {entry.date}
                </span>
              </div>
              <h3 className="font-medium text-foreground mb-3">{entry.title}</h3>
              <ul className="space-y-1.5">
                {entry.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2 text-small text-muted-foreground"
                  >
                    <CheckCircle className="h-4 w-4 shrink-0 text-success mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
