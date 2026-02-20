import { useEffect } from 'react'
import { SearchableDocs } from '@/components/help-and-about/searchable-docs'
import { FAQ } from '@/components/help-and-about/faq'
import { ContactForm } from '@/components/help-and-about/contact-form'
import { Changelog } from '@/components/help-and-about/changelog'
import { CommunityLinks } from '@/components/help-and-about/community-links'

export function HelpAndAboutPage() {
  useEffect(() => {
    document.title = 'Help & About | Creator Ops Hub'
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-h1 font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Help & About
        </h1>
        <p className="text-muted-foreground mt-1">
          Documentation hub, FAQs, contact support, and product changelog
        </p>
      </div>

      <section>
        <SearchableDocs />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <FAQ />
        <ContactForm />
      </section>

      <section>
        <Changelog />
      </section>

      <section>
        <CommunityLinks />
      </section>
    </div>
  )
}

export default HelpAndAboutPage
