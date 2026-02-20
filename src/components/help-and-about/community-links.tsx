import { ExternalLink, MessageCircle, Map } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const COMMUNITY_LINKS = [
  {
    id: 'feedback',
    title: 'Feedback Forum',
    description: 'Share ideas, feature requests, and vote on roadmap items',
    href: '#',
    icon: MessageCircle,
  },
  {
    id: 'roadmap',
    title: 'Roadmap',
    description: 'See what we\'re building next and track progress',
    href: '#',
    icon: Map,
  },
]

export function CommunityLinks() {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-h3">Community</CardTitle>
        <p className="text-small text-muted-foreground">
          Join the conversation and shape the product
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {COMMUNITY_LINKS.map((link) => {
            const Icon = link.icon
            return (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'group flex flex-col rounded-xl border border-border bg-card p-4 transition-all duration-200',
                  'hover:border-primary/50 hover:shadow-card-hover hover:scale-[1.02] active:scale-[0.98]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {link.title}
                  </span>
                  <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-small text-muted-foreground flex-1">
                  {link.description}
                </p>
              </a>
            )
          })}
        </div>
        <p className="text-micro text-muted-foreground mt-4">
          Community links are placeholders. Replace with your actual forum and
          roadmap URLs.
        </p>
      </CardContent>
    </Card>
  )
}
