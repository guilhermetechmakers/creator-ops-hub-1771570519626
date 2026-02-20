import { cn } from '@/lib/utils'

export interface FullTermsOfServiceTextProps {
  className?: string
}

const TERMS_SECTIONS = [
  {
    title: 'Agreement to Terms',
    content:
      'By accessing or using Creator Ops Hub ("we," "our," or "us"), you agree to be bound by these Terms of Service. If you do not agree, do not use the platform. These terms govern platform usage, content ownership, AI usage, data handling, Google integration scopes, and your rights.',
  },
  {
    title: 'Platform Usage',
    content:
      'You agree to use Creator Ops Hub in compliance with applicable laws and not to misuse the platform or its AI features for harmful, deceptive, or illegal purposes. You will not attempt to reverse-engineer, disrupt, or compromise the service. You are responsible for all activity under your account.',
  },
  {
    title: 'Content Ownership',
    content:
      'You retain ownership of content you create (drafts, research, assets). By using our platform, you grant us a limited license to store, process, and display your content solely to provide our services. We do not claim ownership of your creative work. You are responsible for ensuring you have rights to any content you upload or publish.',
  },
  {
    title: 'AI Usage Disclaimers',
    content:
      'Our AI research and content tools (including OpenClaw) are provided "as is." AI outputs may contain errors, inaccuracies, or biases. You are responsible for reviewing and verifying AI-generated content before use. We do not guarantee the accuracy, completeness, or suitability of AI outputs for any purpose. AI features are assistive tools—final decisions remain with you.',
  },
  {
    title: 'Data Handling',
    content:
      'We collect and process data as described in our Privacy Policy. By using Creator Ops Hub, you consent to our data practices. We use your data to deliver services, improve the platform, and comply with legal obligations. We do not sell your personal information.',
  },
  {
    title: 'Google Integration Scopes',
    content:
      'When you connect your Google account, we request specific scopes (Calendar, Gmail, YouTube) to enable features. We only access data necessary for the functionality you use. You can revoke access at any time from Google account settings or our Integrations page. Your use of Google integrations is subject to Google\'s terms and policies.',
  },
  {
    title: 'AI Research Retention',
    content:
      'When you use AI research features, we process your queries to generate insights. Research outputs are stored in your account. We may retain anonymized, aggregated data (stripped of personally identifiable information) for model improvement and analytics. Individual research sessions are not shared with third parties or used for advertising.',
  },
  {
    title: 'Your Rights',
    content:
      'You have the right to access, correct, export, or delete your personal data. You can manage your data in Settings or contact us to exercise your rights. If you are in the EU/EEA or UK, you have additional rights under GDPR. Account termination does not affect rights you had before termination.',
  },
  {
    title: 'Contact',
    content:
      'For questions about these Terms of Service, contact us at legal@creatoropshub.com. For privacy-related requests, contact privacy@creatoropshub.com. We will respond within 30 days.',
  },
]

export function FullTermsOfServiceText({ className }: FullTermsOfServiceTextProps) {
  return (
    <article
      className={cn(
        'prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-muted-foreground prose-p:leading-relaxed',
        className
      )}
    >
      {TERMS_SECTIONS.map((section, index) => (
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
          </p>
        </section>
      ))}
    </article>
  )
}
