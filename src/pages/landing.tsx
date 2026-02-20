import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FolderOpen, FileEdit, Calendar, Search, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
export function LandingPage() {
  useEffect(() => {
    document.title = 'Creator Ops Hub | One workspace for creators'
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            to="/"
            className="text-h3 font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent transition-opacity hover:opacity-90"
          >
            Creator Ops Hub
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/login-/-signup?mode=login"
              className="text-small font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg px-3 py-2"
            >
              Sign In
            </Link>
            <Button asChild size="sm" className="font-medium">
              <Link to="/login-/-signup?mode=signup">Get Started Free</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 py-24 md:py-32 lg:py-40">
          <div className="mx-auto max-w-4xl text-center animate-slide-up">
            <h1 className="text-hero font-bold tracking-tight md:text-hero-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              One workspace for creators
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Centralize assets, research, and multi-platform publishing. From idea to published content—faster, with full traceability.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-base px-8 py-6 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" asChild>
                <Link to="/login-/-signup?mode=signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8 py-6 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" asChild>
                <Link to="/login-/-signup?mode=login">Sign In</Link>
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
            <Button asChild size="lg" className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
              <Link to="/login-/-signup?mode=signup">
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
            <Link to="/privacy-policy" className="text-small text-muted-foreground hover:text-foreground transition-colors duration-200">Privacy Policy</Link>
            <Link to="/terms" className="text-small text-muted-foreground hover:text-foreground transition-colors duration-200">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
