import { cn } from '@/lib/utils'

export interface FullPrivacyPolicyTextProps {
  className?: string
}

const POLICY_SECTIONS = [
  {
    title: 'Introduction',
    content:
      'Creator Ops Hub ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy describes how we collect, use, retain, and protect your information when you use our platform, including our Google integration, AI research features, and content creation tools.',
  },
  {
    title: 'Data We Collect',
    content:
      'We collect information you provide directly (account details, profile information, content you create), data from connected services (Google Calendar, Gmail, YouTube when you authorize integrations), usage data (how you interact with the platform), and technical data (device, browser, IP address). Our AI research feature may process your queries and retain anonymized, aggregated insights for service improvement.',
  },
  {
    title: 'Google Integration Scopes',
    content:
      'When you connect your Google account, we request specific scopes to enable features: Calendar access for scheduling, Gmail for email-based workflows, and YouTube for publishing. We only access data necessary for the features you use. We do not read, store, or share your emails, calendar events, or YouTube data beyond what is required to deliver the requested functionality. You can revoke access at any time from your Google account settings or our Integrations page.',
  },
  {
    title: 'How We Use Your Data',
    content:
      'Your data is used to deliver and improve Creator Ops Hub services, including research, content creation, scheduling, and publishing. We use it to personalize your experience, communicate with you about your account, ensure security, and comply with legal obligations. We do not sell your personal information to third parties.',
  },
  {
    title: 'AI Research Retention',
    content:
      'When you use our AI research features (OpenClaw), we process your queries to generate insights and citations. Research outputs are stored in your account for your reference. We may retain anonymized, aggregated data (stripped of personally identifiable information) for model improvement, analytics, and service optimization. Individual research sessions are not shared with third parties or used for advertising.',
  },
  {
    title: 'Data Retention',
    content:
      'We retain your data for as long as your account is active or as needed to provide services. After account deletion, we delete or anonymize your personal data within 90 days, except where retention is required by law. Aggregated or anonymized data may be retained indefinitely for analytics.',
  },
  {
    title: 'Your Rights',
    content:
      'You have the right to access, correct, export, or delete your personal data. You can manage your data in Settings, request a data export, or contact us to exercise your rights. If you are in the EU/EEA or UK, you have additional rights under GDPR, including the right to object, restrict processing, and lodge a complaint with a supervisory authority.',
  },
  {
    title: 'Contact',
    content:
      'For privacy-related questions, data requests, or to exercise your rights, contact us at ',
    contactEmail: 'privacy@creatoropshub.com',
    contentSuffix: '. We will respond within 30 days.',
  },
]

export function FullPrivacyPolicyText({ className }: FullPrivacyPolicyTextProps) {
  return (
    <article
      className={cn(
        'prose dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-links:text-primary prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground',
        className
      )}
    >
      {POLICY_SECTIONS.map((section, index) => {
        const hasContactEmail = 'contactEmail' in section && section.contactEmail
        return (
          <section
            key={section.title}
            className="animate-slide-up opacity-0"
            style={{
              animationDelay: `${index * 80}ms`,
              animationFillMode: 'forwards',
            }}
          >
            <h2 className="text-h3 font-semibold mt-8 first:mt-0 text-foreground">
              {section.title}
            </h2>
            <p className="mt-2 text-body text-muted-foreground leading-relaxed">
              {section.content}
              {hasContactEmail ? (
                <>
                  <a
                    href={`mailto:${section.contactEmail}`}
                    className="text-primary hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                    aria-label="Email privacy team"
                  >
                    {section.contactEmail}
                  </a>
                  {section.contentSuffix ?? ''}
                </>
              ) : null}
            </p>
          </section>
        )
      })}
    </article>
  )
}
