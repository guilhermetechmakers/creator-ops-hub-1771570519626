import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PublicPageHeader } from '@/components/layout/public-page-header'
import { FullCookiePolicyText } from '@/components/cookie-policy/full-cookie-policy-text'
import { CookieHighlights } from '@/components/cookie-policy/cookie-highlights'
import { CookieDownloadPrintOption } from '@/components/cookie-policy/download-print-option'

export function CookiePolicyPage() {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = 'Cookie Policy | Creator Ops Hub'
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <PublicPageHeader />

      <main
        className="container mx-auto max-w-4xl px-4 py-12 md:py-16"
        role="main"
        aria-label="Cookie Policy content"
      >
        {/* Back link */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-8 -ml-2 text-muted-foreground hover:text-foreground transition-colors duration-200 no-print"
          asChild
        >
          <Link
            to="/"
            className="flex items-center gap-2"
            aria-label="Return to home page"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to home
          </Link>
        </Button>

        {/* Title and meta */}
        <div className="animate-fade-in">
          <h1 className="text-hero font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Cookie Policy
          </h1>
          <p className="text-muted-foreground mt-2 text-small">
            Last updated: February 2025
          </p>
        </div>

        {/* Highlights - data collected, usage, retention, contact */}
        <section className="mt-12 animate-fade-in" aria-labelledby="highlights-heading">
          <h2 id="highlights-heading" className="text-h2 font-bold text-foreground mb-6">
            At a glance
          </h2>
          <CookieHighlights />
        </section>

        {/* Download/Print actions */}
        <section
          className="mt-12 flex flex-wrap items-center gap-4 animate-fade-in no-print"
          aria-label="Download or print cookie policy"
        >
          <CookieDownloadPrintOption contentRef={contentRef} />
        </section>

        {/* Full cookie policy text */}
        <section
          ref={contentRef}
          className="mt-16 pt-12 border-t border-border print:border-0"
          aria-labelledby="full-policy-heading"
        >
          <h2 id="full-policy-heading" className="text-h2 font-bold text-foreground mb-8">
            Full policy
          </h2>
          <FullCookiePolicyText />
        </section>

        {/* Related legal links */}
        <div
          className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4 animate-fade-in no-print"
          role="navigation"
          aria-label="Related legal policies"
        >
          <p className="text-small text-muted-foreground w-full">
            Related policies:
          </p>
          <Button variant="outline" size="sm" asChild className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
            <Link to="/privacy-policy" aria-label="View privacy policy">
              Privacy Policy
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
            <Link to="/terms" aria-label="View terms of service">
              Terms of Service
            </Link>
          </Button>
        </div>

        {/* Footer CTA - uses shadcn Card */}
        <Card className="mt-16 border-border bg-muted/20 no-print animate-fade-in">
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pt-6 sm:pt-6">
            <p className="text-small text-muted-foreground">
              Questions? Contact us at{' '}
              <a
                href="mailto:privacy@creatoropshub.com"
                className="inline-flex items-center gap-1.5 text-primary hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                aria-label="Email Creator Ops Hub privacy team at privacy@creatoropshub.com"
              >
                <Mail className="h-4 w-4 shrink-0" aria-hidden />
                privacy@creatoropshub.com
              </a>
            </p>
            <Button variant="outline" asChild className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shrink-0">
              <Link to="/" aria-label="Return to home page">
                Back to home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
