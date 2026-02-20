import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PublicPageHeader } from '@/components/layout/public-page-header'
import { FullPrivacyPolicyText } from '@/components/privacy-policy/full-privacy-policy-text'
import { PrivacyHighlights } from '@/components/privacy-policy/privacy-highlights'
import { DownloadPrintOption } from '@/components/privacy-policy/download-print-option'

const SEO_META = {
  title: 'Privacy Policy | Creator Ops Hub',
  description:
    'Learn how Creator Ops Hub handles your data, Google integration scopes, AI research retention, and your privacy rights.',
}

export function PrivacyPolicyPage() {
  const contentRef = useRef<HTMLDivElement>(null)

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
      <PublicPageHeader />

      <main
        className="container mx-auto max-w-4xl px-4 py-12 md:py-16"
        role="main"
        aria-label="Privacy Policy content"
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
            Privacy Policy
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
          <PrivacyHighlights />
        </section>

        {/* Download/Print actions */}
        <section
          className="mt-12 flex flex-wrap items-center gap-4 animate-fade-in no-print"
          aria-label="Download or print privacy policy"
        >
          <DownloadPrintOption contentRef={contentRef} />
        </section>

        {/* Full privacy policy text */}
        <section
          ref={contentRef}
          className="mt-16 pt-12 border-t border-border print:border-0"
          aria-labelledby="full-policy-heading"
        >
          <h2 id="full-policy-heading" className="text-h2 font-bold text-foreground mb-8">
            Full policy
          </h2>
          <FullPrivacyPolicyText />
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
            <Link to="/cookie-policy" aria-label="View cookie policy">
              Cookie Policy
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

export default PrivacyPolicyPage
