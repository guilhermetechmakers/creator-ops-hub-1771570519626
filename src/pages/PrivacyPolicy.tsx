import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FullPrivacyPolicyText } from '@/components/privacy-policy/full-privacy-policy-text'
import { PrivacyHighlights } from '@/components/privacy-policy/privacy-highlights'
import { DownloadPrintOption } from '@/components/privacy-policy/download-print-option'

export function PrivacyPolicyPage() {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = 'Privacy Policy | Creator Ops Hub'
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header - matches landing style */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md no-print">
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

      {/* Main content */}
      <main className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
        {/* Back link */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-8 -ml-2 text-muted-foreground hover:text-foreground transition-colors duration-200 no-print"
          asChild
        >
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </Button>

        {/* Title and meta */}
        <div className="animate-fade-in">
          <h1 className="text-hero font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mt-2 text-small">
            Last updated: February 2025
          </p>
        </div>

        {/* Highlights - data collected, usage, retention, contact */}
        <section className="mt-12 animate-fade-in">
          <h2 className="text-h2 font-bold text-foreground mb-6">
            At a glance
          </h2>
          <PrivacyHighlights />
        </section>

        {/* Download/Print actions */}
        <section className="mt-12 flex flex-wrap items-center gap-4 animate-fade-in no-print">
          <DownloadPrintOption contentRef={contentRef} />
        </section>

        {/* Full privacy policy text */}
        <section
          ref={contentRef}
          className="mt-16 pt-12 border-t border-border print:border-0"
        >
          <h2 className="text-h2 font-bold text-foreground mb-8">
            Full policy
          </h2>
          <FullPrivacyPolicyText />
        </section>

        {/* Footer CTA */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center animate-fade-in no-print">
          <p className="text-small text-muted-foreground">
            Questions? Contact us at{' '}
            <a
              href="mailto:privacy@creatoropshub.com"
              className="text-primary hover:underline transition-colors"
            >
              privacy@creatoropshub.com
            </a>
          </p>
          <Button variant="outline" asChild className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </main>

    </div>
  )
}
