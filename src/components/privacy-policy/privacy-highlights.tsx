import { Shield, Database, Clock, Mail } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface PrivacyHighlightsProps {
  className?: string
}

const HIGHLIGHTS = [
  {
    icon: Database,
    title: 'Data Collected',
    items: [
      'Account and profile information',
      'Content you create (drafts, research, assets)',
      'Google integration data (Calendar, Gmail, YouTube)',
      'Usage and technical data',
    ],
  },
  {
    icon: Shield,
    title: 'Usage',
    items: [
      'Deliver and improve our services',
      'Personalize your experience',
      'Enable AI research and content tools',
      'We do not sell your data',
    ],
  },
  {
    icon: Clock,
    title: 'Retention',
    items: [
      'Active account: data retained while in use',
      'After deletion: removed within 90 days',
      'AI research: anonymized aggregates may be retained',
      'Legal requirements may extend retention',
    ],
  },
  {
    icon: Mail,
    title: 'Contact',
    items: [
      'privacy@creatoropshub.com',
      'Data requests and rights',
      'Response within 30 days',
    ],
  },
]

export function PrivacyHighlights({ className }: PrivacyHighlightsProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
        className
      )}
    >
      {HIGHLIGHTS.map((highlight, index) => {
        const Icon = highlight.icon
        return (
          <Card
            key={highlight.title}
            className="animate-slide-up opacity-0 border-primary/10 bg-gradient-to-br from-card to-primary/5 transition-all duration-300 hover:shadow-card-hover hover:border-primary/20 hover:-translate-y-0.5"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'forwards',
            }}
          >
            <CardContent className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-h3 font-semibold text-foreground mb-2">
                {highlight.title}
              </h3>
              <ul className="space-y-1.5 text-small text-muted-foreground">
                {highlight.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
