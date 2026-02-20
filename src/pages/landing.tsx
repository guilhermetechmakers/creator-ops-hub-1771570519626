import { Link } from 'react-router-dom'
import { FolderOpen, FileEdit, Calendar, Search, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 py-24 md:py-32 lg:py-40">
          <div className="mx-auto max-w-4xl text-center animate-slide-up">
            <h1 className="text-hero font-bold tracking-tight md:text-hero-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              One workspace for creators
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Centralize assets, research, and multi-platform publishing. From idea to published content—faster, with full traceability.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-base px-8 py-6" asChild>
                <Link to="/login-/-signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8 py-6" asChild>
                <Link to="/login-/-signup">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights - Bento-style grid */}
      <section className="container mx-auto px-4 py-24">
        <h2 className="text-h2 font-bold text-center mb-4">Everything you need</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16">
          File Library, Content Studio, Editorial Calendar, and AI-powered research—all in one place.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: FolderOpen,
              title: 'File Library',
              description: 'Tagged assets with upload, versioning, and usage tracking.',
              className: 'md:col-span-1',
            },
            {
              icon: FileEdit,
              title: 'Content Studio',
              description: 'Drafting, templates, briefs, and channel-aware publishing.',
              className: 'md:col-span-1',
            },
            {
              icon: Calendar,
              title: 'Editorial Calendar',
              description: 'Plan Instagram, X, and YouTube with drag-and-drop scheduling.',
              className: 'md:col-span-1',
            },
            {
              icon: Search,
              title: 'OpenClaw Research',
              description: 'AI research with citations, confidence scores, and traceability.',
              className: 'md:col-span-1',
            },
          ].map(({ icon: Icon, title, description, className }, i) => (
            <Card
              key={title}
              className={`animate-slide-up opacity-0 ${className}`}
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}
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

      {/* CTA */}
      <section className="container mx-auto px-4 py-24">
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-h2 font-bold mb-4">Ready to streamline your content workflow?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join creators and teams who ship faster with Creator Ops Hub.
            </p>
            <Button asChild size="lg">
              <Link to="/login-/-signup">
                Start free trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-muted-foreground text-small">© Creator Ops Hub</span>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-small text-muted-foreground hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="text-small text-muted-foreground hover:text-foreground">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
