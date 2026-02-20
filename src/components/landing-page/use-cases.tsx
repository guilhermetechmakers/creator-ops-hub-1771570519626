import { User, Users, Building2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const personas = [
  {
    icon: User,
    title: 'Solo Creators',
    description: 'Streamline your content workflow from research to publish. One workspace for all your creative needs.',
    highlights: ['Single dashboard', 'AI-powered research', 'Multi-platform scheduling'],
    gradient: 'from-primary/10 to-accent/5',
  },
  {
    icon: Users,
    title: 'Teams',
    description: 'Collaborate with your team on content planning, approvals, and publishing. Stay in sync.',
    highlights: ['Shared workspace', 'Approval workflows', 'Role-based access'],
    gradient: 'from-accent/10 to-primary/5',
  },
  {
    icon: Building2,
    title: 'Agencies',
    description: 'Manage multiple clients and campaigns. Scale your content operations without the chaos.',
    highlights: ['Multi-client support', 'White-label options', 'Advanced analytics'],
    gradient: 'from-primary/10 to-accent/10',
  },
] as const

export function UseCases() {
  return (
    <section className="container mx-auto px-4 py-24">
      <h2 className="text-h2 font-bold text-center mb-4 animate-slide-up">Built for every creator</h2>
      <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16 animate-slide-up" style={{ animationDelay: '50ms' }}>
        Whether you're flying solo, working with a team, or running an agency—Creator Ops Hub adapts to your workflow.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {personas.map(({ icon: Icon, title, description, highlights, gradient }, i) => (
          <Card
            key={title}
            className="animate-slide-up opacity-0 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-card-hover border-2"
            style={{ animationDelay: `${(i + 1) * 100}ms`, animationFillMode: 'forwards' }}
          >
            <div className={cn('h-1.5 bg-gradient-to-r', gradient)} />
            <CardHeader>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-7 w-7" />
              </div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription className="text-base">{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-small text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {h}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
