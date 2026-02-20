import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchableDocs } from '@/components/help-and-about/searchable-docs'
import { FAQ } from '@/components/help-and-about/faq'
import { ContactForm } from '@/components/help-and-about/contact-form'
import { Changelog } from '@/components/help-and-about/changelog'
import { CommunityLinks } from '@/components/help-and-about/community-links'

const SEO_META = {
  title: 'Help & About | Creator Ops Hub',
  description:
    'Documentation hub, FAQs, contact support, and product changelog. Get started with onboarding guides, API docs, and OpenClaw credits.',
}

export function HelpAndAboutContent() {
  return (
    <div className="space-y-8">
      <section
        className="animate-fade-in"
        style={{ animationDelay: '0ms', animationFillMode: 'both' }}
        aria-labelledby="section-docs"
      >
        <h2 id="section-docs" className="sr-only">
          Searchable Documentation
        </h2>
        <SearchableDocs />
      </section>

      <section
        id="contact"
        className="grid gap-6 lg:grid-cols-2 animate-fade-in"
        style={{ animationDelay: '100ms', animationFillMode: 'both' }}
        aria-labelledby="section-faq-contact"
      >
        <h2 id="section-faq-contact" className="sr-only">
          FAQ and Contact
        </h2>
        <FAQ />
        <ContactForm />
      </section>

      <section
        className="animate-fade-in"
        style={{ animationDelay: '200ms', animationFillMode: 'both' }}
        aria-labelledby="section-changelog"
      >
        <h2 id="section-changelog" className="sr-only">
          Changelog
        </h2>
        <Changelog />
      </section>

      <section
        className="animate-fade-in"
        style={{ animationDelay: '300ms', animationFillMode: 'both' }}
        aria-labelledby="section-community"
      >
        <h2 id="section-community" className="sr-only">
          Community
        </h2>
        <CommunityLinks />
      </section>
    </div>
  )
}

export function HelpAndAboutPage() {
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
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-small text-muted-foreground animate-fade-in"
      >
        <Link
          to="/dashboard"
          className="hover:text-foreground transition-colors duration-200 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          <Home className="h-4 w-4" aria-hidden />
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="text-foreground font-medium">Help & About</span>
      </nav>

      <Card className="animate-fade-in border-primary/10 bg-gradient-to-br from-card to-primary/5 transition-all duration-300 hover:shadow-card-hover hover:border-primary/20 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle
            as="h1"
            className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          >
            Help & About
          </CardTitle>
          <CardDescription className="text-body mt-1">
            Documentation hub, FAQs, contact support, and product changelog
          </CardDescription>
        </CardHeader>
      </Card>

      <HelpAndAboutContent />
    </div>
  )
}

export default HelpAndAboutPage
