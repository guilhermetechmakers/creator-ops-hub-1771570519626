import { FolderOpen, FileEdit, Calendar, Search } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: FolderOpen,
    title: 'File Library',
    description: 'Tagged assets with upload, versioning, and usage tracking. Keep all your media organized and searchable.',
    className: 'md:col-span-1',
  },
  {
    icon: FileEdit,
    title: 'Content Studio',
    description: 'Drafting, templates, briefs, and channel-aware publishing. Create content that resonates across platforms.',
    className: 'md:col-span-1',
  },
  {
    icon: Calendar,
    title: 'Editorial Calendar',
    description: 'Plan Instagram, X, and YouTube with drag-and-drop scheduling. Visualize your content pipeline.',
    className: 'md:col-span-1',
  },
  {
    icon: Search,
    title: 'OpenClaw Research',
    description: 'AI research with citations, confidence scores, and traceability. Research smarter, not harder.',
    className: 'md:col-span-1',
  },
] as const

export function FeatureHighlights() {
  return (
    <section id="feature-highlights" className="container mx-auto px-4 py-24 scroll-mt-20">
      <h2 className="text-h2 font-bold text-center mb-4 animate-slide-up">Everything you need</h2>
      <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16 animate-slide-up" style={{ animationDelay: '50ms' }}>
        File Library, Content Studio, Editorial Calendar, and AI-powered research—all in one place.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map(({ icon: Icon, title, description, className }, i) => (
          <Card
            key={title}
            className={cn(
              'animate-slide-up opacity-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-card-hover',
              className
            )}
            style={{ animationDelay: `${(i + 1) * 100}ms`, animationFillMode: 'forwards' }}
          >
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                <Icon className="h-6 w-6" />
              </div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}
