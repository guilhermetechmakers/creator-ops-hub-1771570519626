import { ExternalLink, MessageCircle, Map, Users, HelpCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CommunityLinkItem {
  id: string
  title: string
  description: string
  href: string
  icon: typeof MessageCircle
}

const COMMUNITY_LINKS: CommunityLinkItem[] = [
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

/** Empty state when no community links - per Design Reference: icon, helpful copy, clear CTA */
function CommunityLinksEmptyState() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="No community links"
      className={cn(
        'flex flex-col items-center justify-center gap-6 rounded-xl',
        'border-2 border-dashed border-muted bg-muted/20 p-6 sm:p-8 text-center',
        'animate-fade-in min-h-[200px] sm:min-h-[240px]'
      )}
    >
      <div className="rounded-2xl bg-muted/50 p-6 ring-1 ring-muted/80 transition-transform duration-200 hover:scale-[1.02]">
        <Users className="h-5 w-5 text-muted-foreground/70" aria-hidden />
      </div>
      <div className="space-y-2 max-w-[280px]">
        <h3 className="text-base font-semibold text-foreground">
          No community links yet
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Community resources like feedback forums and roadmaps will appear here
          once they are configured. Check back soon or contact support for
          details.
        </p>
      </div>
      <Button
        asChild
        variant="default"
        size="lg"
        aria-label="Contact support for community link details"
        className="inline-flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      >
        <a href="#contact" className="inline-flex items-center gap-2">
          <HelpCircle className="h-5 w-5 shrink-0" aria-hidden />
          Contact Support
        </a>
      </Button>
    </div>
  )
}

export interface CommunityLinksProps {
  /** Override default links. When empty, shows empty state. */
  links?: CommunityLinkItem[]
  /** Optional id for the section heading (accessibility) */
  headingId?: string
}

export function CommunityLinks({ links = COMMUNITY_LINKS, headingId }: CommunityLinksProps) {
  const isEmpty = links.length === 0

  return (
    <Card className="animate-fade-in border-primary/10 bg-gradient-to-br from-card to-primary/5 transition-all duration-300 hover:shadow-card-hover hover:border-primary/20">
      <CardHeader>
        <CardTitle as="h2" id={headingId} className="flex items-center gap-2 text-h2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          Community
        </CardTitle>
        <p className="text-small text-muted-foreground">
          Join the conversation and shape the product
        </p>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <CommunityLinksEmptyState />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {links.map((link) => {
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
              Community links are placeholders. Replace with your actual forum
              and roadmap URLs.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
