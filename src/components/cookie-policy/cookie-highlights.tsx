import { Cookie, Shield, Clock, Mail } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface CookieHighlightsProps {
  className?: string
}

const HIGHLIGHTS = [
  {
    icon: Cookie,
    title: 'Data Collected',
    items: [
      'Session and authentication cookies',
      'Preference and settings data',
      'Anonymized analytics (pages, features used)',
      'Google integration session data',
    ],
  },
  {
    icon: Shield,
    title: 'Usage',
    items: [
      'Keep you signed in and secure',
      'Remember your preferences',
      'Improve platform performance',
      'We do not sell cookie data',
    ],
  },
  {
    icon: Clock,
    title: 'Retention',
    items: [
      'Session cookies: until browser close',
      'Persistent cookies: up to 12 months',
      'After deletion: removed within 90 days',
      'Anonymized analytics may be retained',
    ],
  },
  {
    icon: Mail,
    title: 'Contact',
    items: [
      'privacy@creatoropshub.com',
      'Cookie consent and preferences',
      'Response within 30 days',
    ],
  },
]

export function CookieHighlights({ className }: CookieHighlightsProps) {
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
            className="animate-slide-up opacity-0 border-primary/10 bg-gradient-to-br from-card to-primary/5 transition-all duration-300 hover:shadow-card-hover hover:border-primary/20"
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
