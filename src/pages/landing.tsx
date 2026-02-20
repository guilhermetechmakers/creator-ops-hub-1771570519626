import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  HeroSection,
  FeatureHighlights,
  UseCases,
  PricingTeaser,
  IntegrationsRow,
  SocialProof,
  LandingFooter,
} from '@/components/landing-page'

export function LandingPage() {
  useEffect(() => {
    document.title = 'Creator Ops Hub | One workspace for creators'
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Centralize assets, research, and multi-platform publishing. From idea to published content—faster, with full traceability.')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Centralize assets, research, and multi-platform publishing. From idea to published content—faster, with full traceability.'
      document.head.appendChild(meta)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            to="/"
            className="text-h3 font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent transition-opacity hover:opacity-90"
            aria-label="Creator Ops Hub - Return to home"
          >
            Creator Ops Hub
          </Link>
          <nav className="flex items-center gap-4" aria-label="Main navigation">
            <Link
              to="/login-/-signup?mode=login"
              className="text-small font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg px-3 py-2"
              aria-label="Sign in to your Creator Ops Hub account"
            >
              Sign In
            </Link>
            <Button asChild size="sm" className="font-medium">
              <Link to="/login-/-signup?mode=signup" aria-label="Get started with Creator Ops Hub for free">
                Get Started Free
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <HeroSection />
        <FeatureHighlights />
        <UseCases />
        <PricingTeaser />
        <IntegrationsRow />
        <SocialProof />

        {/* CTA Banner */}
        <section className="container mx-auto px-4 py-24" aria-labelledby="cta-heading">
          <Card className="max-w-4xl mx-auto border-2 border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10 transition-all duration-300 hover:shadow-card-hover hover:scale-[1.01]">
            <CardContent className="p-8 sm:p-12 text-center">
              <h2 id="cta-heading" className="text-h2 font-bold mb-4">Ready to streamline your content workflow?</h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join creators and teams who ship faster with Creator Ops Hub.
              </p>
              <Button asChild size="lg" className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                <Link to="/login-/-signup?mode=signup" aria-label="Start your free trial of Creator Ops Hub">
                  Start free trial
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
