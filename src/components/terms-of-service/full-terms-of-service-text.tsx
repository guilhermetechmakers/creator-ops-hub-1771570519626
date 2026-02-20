import { Link } from 'react-router-dom'
import { FileText, AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface TermsSection {
  title: string
  content: string
}

export interface FullTermsOfServiceTextProps {
  className?: string
  /** Sections to display. If empty, shows empty state. If undefined, uses default. */
  sections?: TermsSection[]
  /** Show loading skeleton */
  isLoading?: boolean
  /** Show error state with retry */
  error?: string | null
  /** Callback when retry is clicked */
  onRetry?: () => void
}

const DEFAULT_TERMS_SECTIONS: TermsSection[] = [
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

function TermsContentSkeleton() {
  return (
    <div className="space-y-8 mt-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" shimmer />
          <Skeleton className="h-4 w-full" shimmer />
          <Skeleton className="h-4 w-[80%]" shimmer />
        </div>
      ))}
    </div>
  )
}

function TermsEmptyState() {
  return (
    <Card
      role="status"
      aria-live="polite"
      aria-label="Terms of Service content unavailable"
      className="overflow-hidden border-dashed border-2 border-muted-foreground/20 animate-fade-in transition-all duration-300 hover:shadow-card-hover hover:border-muted-foreground/30"
    >
      <CardContent className="flex flex-col items-center justify-center gap-6 py-12 px-6 sm:py-16 sm:px-8">
        <div className="rounded-2xl bg-muted/50 p-6 sm:p-8 animate-float-subtle motion-reduce:animate-none">
          <FileText
            className="h-14 w-14 sm:h-16 sm:w-16 text-muted-foreground/70 mx-auto"
            aria-hidden
          />
        </div>
        <div className="text-center space-y-2">
          <p className="text-body font-semibold text-foreground">
            Terms of Service content is unavailable
          </p>
          <p className="text-small text-muted-foreground max-w-sm">
            We&apos;re unable to load the full terms at this time. Please check back later or
            contact us for assistance.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:flex-wrap justify-center">
          <Button
            variant="outline"
            size="sm"
            className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] min-h-[44px]"
            asChild
          >
            <a href="mailto:legal@creatoropshub.com">Contact us</a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] min-h-[44px] text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Back to home
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function TermsErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <Card
      role="alert"
      aria-live="assertive"
      aria-label="Error loading terms of service"
      className="overflow-hidden border-destructive/30 animate-fade-in"
    >
      <CardContent className="flex flex-col items-center justify-center gap-6 py-12 px-6 sm:py-16 sm:px-8">
        <div className="rounded-2xl bg-destructive/10 p-6 sm:p-8">
          <AlertCircle className="h-14 w-14 sm:h-16 sm:w-16 text-destructive mx-auto" aria-hidden />
        </div>
        <div className="text-center space-y-2">
          <p className="text-body font-semibold text-foreground">
            Something went wrong
          </p>
          <p className="text-small text-muted-foreground max-w-sm">
            We couldn&apos;t load the terms. Please try again.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] min-h-[44px]"
          onClick={onRetry ?? (() => window.location.reload())}
          aria-label="Retry loading terms of service"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </CardContent>
    </Card>
  )
}

/** Returns true if the section has meaningful content to display */
function hasContent(section: TermsSection): boolean {
  const hasTitle = typeof section.title === 'string' && section.title.trim().length > 0
  const hasBody = typeof section.content === 'string' && section.content.trim().length > 0
  return hasTitle && hasBody
}

export function FullTermsOfServiceText({
  className,
  sections: rawSections,
  isLoading = false,
  error = null,
  onRetry,
}: FullTermsOfServiceTextProps) {
  if (isLoading) {
    return (
      <article className={cn('max-w-none', className)} aria-busy="true" aria-label="Loading terms of service">
        <TermsContentSkeleton />
      </article>
    )
  }

  if (error) {
    return (
      <article className={cn('max-w-none', className)}>
        <TermsErrorState onRetry={onRetry} />
      </article>
    )
  }

  const sections = rawSections ?? DEFAULT_TERMS_SECTIONS
  const validSections = sections.filter(hasContent)

  if (validSections.length === 0) {
    return (
      <article className={cn('max-w-none', className)}>
        <TermsEmptyState />
      </article>
    )
  }

  return (
    <article
      className={cn(
        'prose max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground',
        className
      )}
    >
      {validSections.map((section, index) => (
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
