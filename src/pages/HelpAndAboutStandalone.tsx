import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { HelpAndAboutContent } from '@/pages/HelpAndAbout'

const SEO_META = {
  title: 'Help & About | Creator Ops Hub',
  description:
    'Documentation hub, FAQs, contact support, and product changelog. Get started with onboarding guides, API docs, and OpenClaw credits.',
}

export function HelpAndAboutStandalonePage() {
  useEffect(() => {
    const prevTitle = document.title
    const prevMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content
    document.title = SEO_META.title
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = SEO_META.description
    return () => {
      document.title = prevTitle
      if (meta) meta.content = prevMeta ?? ''
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
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

      <main
        className="container mx-auto max-w-4xl px-4 py-12 md:py-16"
        role="main"
        aria-label="Help and About content"
      >
        <div className="animate-fade-in">
          <h1 className="text-hero font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Help & About
          </h1>
          <p className="text-muted-foreground mt-2 text-small">
            Documentation hub, FAQs, contact support, and product changelog
          </p>
        </div>

        <div className="mt-12 space-y-8">
          <HelpAndAboutContent />
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center animate-fade-in">
          <p className="text-small text-muted-foreground">
            Need more help?{' '}
            <Link
              to="/dashboard/help-and-about"
              className="text-primary hover:underline transition-colors"
            >
              Sign in to submit a support ticket
            </Link>
          </p>
          <Button variant="outline" asChild className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}

export default HelpAndAboutStandalonePage
