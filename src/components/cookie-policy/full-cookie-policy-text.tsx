import { cn } from '@/lib/utils'

export interface FullCookiePolicyTextProps {
  className?: string
}

const POLICY_SECTIONS = [
  {
    title: 'Introduction',
    content:
      'Creator Ops Hub ("we," "our," or "us") uses cookies and similar technologies to provide, secure, and improve our platform. This Cookie Policy describes the types of cookies we use, how we manage consent, and how long we retain cookie data. It complements our Privacy Policy and Terms of Service.',
  },
  {
    title: 'What Are Cookies',
    content:
      'Cookies are small text files stored on your device when you visit our website. They help us remember your preferences, keep you signed in, understand how you use our platform, and improve your experience. We use both first-party cookies (set by us) and third-party cookies (set by trusted partners).',
  },
  {
    title: 'Types of Cookies We Use',
    content:
      'Essential cookies are required for the platform to function (e.g., authentication, security). Functional cookies remember your preferences and settings. Analytics cookies help us understand usage patterns and improve our services. Marketing cookies (if used) help us measure the effectiveness of our campaigns. We only use non-essential cookies with your consent.',
  },
  {
    title: 'Data Collected via Cookies',
    content:
      'Cookies may collect session identifiers, authentication tokens, language and region preferences, and usage data (pages visited, features used). Our analytics cookies may collect anonymized information about how you interact with the platform. We do not use cookies to collect sensitive personal data beyond what is necessary for the features you use.',
  },
  {
    title: 'Google Integration and Cookies',
    content:
      'When you connect your Google account (Calendar, Gmail, YouTube), we use cookies to maintain your session and securely manage the integration. Cookie data related to Google integrations is used only to deliver the requested functionality. Our use of Google data is governed by our Privacy Policy and Google\'s policies. You can revoke access at any time.',
  },
  {
    title: 'AI Research and Cookie Data',
    content:
      'Our AI research features (OpenClaw) may use cookies to maintain your session and remember your preferences. Research outputs are stored in your account. We may retain anonymized, aggregated data from cookie analytics for service improvement. Individual sessions are not shared with third parties or used for advertising.',
  },
  {
    title: 'Consent Management',
    content:
      'We obtain your consent for non-essential cookies before they are set. You can manage your cookie preferences at any time through your browser settings or our cookie consent banner. Essential cookies do not require consent as they are necessary for the platform to function. Withdrawing consent for non-essential cookies may affect certain features.',
  },
  {
    title: 'Data Retention',
    content:
      'Session cookies are deleted when you close your browser. Persistent cookies may be retained for up to 12 months or as specified in our cookie settings. After account deletion, we remove or anonymize cookie-related data within 90 days, except where retention is required by law. Aggregated analytics data may be retained longer in anonymized form.',
  },
  {
    title: 'Your Rights',
    content:
      'You have the right to access, correct, or delete your personal data, including data collected via cookies. You can manage cookies through your browser settings, use our cookie preference center, or contact us to exercise your rights. If you are in the EU/EEA or UK, you have additional rights under GDPR, including the right to object and lodge a complaint.',
  },
  {
    title: 'Contact',
    content:
      'For cookie-related questions, consent management, or to exercise your rights, contact us at privacy@creatoropshub.com. We will respond within 30 days.',
  },
]

export function FullCookiePolicyText({ className }: FullCookiePolicyTextProps) {
  return (
    <article
      className={cn(
        'prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-muted-foreground prose-p:leading-relaxed',
        className
      )}
    >
      {POLICY_SECTIONS.map((section, index) => (
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
