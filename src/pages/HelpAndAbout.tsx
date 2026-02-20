import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
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
        aria-label="Searchable documentation"
      >
        <SearchableDocs />
      </section>

      <section
        id="contact"
        className="grid gap-6 lg:grid-cols-2 animate-fade-in"
        style={{ animationDelay: '100ms', animationFillMode: 'both' }}
        aria-label="FAQ and contact"
      >
        <FAQ />
        <ContactForm />
      </section>

      <section
        className="animate-fade-in"
        style={{ animationDelay: '200ms', animationFillMode: 'both' }}
        aria-label="Changelog"
      >
        <Changelog />
      </section>

      <section
        className="animate-fade-in"
        style={{ animationDelay: '300ms', animationFillMode: 'both' }}
        aria-label="Community links"
      >
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
          className="hover:text-foreground transition-colors duration-200 flex items-center gap-1"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Help & About</span>
      </nav>

      <div className="animate-fade-in">
        <h1 className="text-h1 font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Help & About
        </h1>
        <p className="text-muted-foreground mt-1">
          Documentation hub, FAQs, contact support, and product changelog
        </p>
      </div>

      <HelpAndAboutContent />
    </div>
  )
}

export default HelpAndAboutPage
