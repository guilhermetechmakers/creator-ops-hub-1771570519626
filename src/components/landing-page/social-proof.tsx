import { Link } from 'react-router-dom'
import { BarChart3, Building2, MessageSquareQuote, Quote, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorState } from '@/components/ui/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface Testimonial {
  quote: string
  author: string
  role: string
  avatar: string
}

export interface Metric {
  value: string
  label: string
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    quote: 'Creator Ops Hub transformed how we manage content. From research to publishing, everything is in one place.',
    author: 'Sarah M.',
    role: 'Content Creator',
    avatar: 'SM',
  },
  {
    quote: 'The editorial calendar alone saved us 10+ hours per week. The AI research feature is a game-changer.',
    author: 'James K.',
    role: 'Agency Lead',
    avatar: 'JK',
  },
  {
    quote: 'Finally, a tool that understands creator workflows. Our team ships content 3x faster now.',
    author: 'Alex T.',
    role: 'Solo Creator',
    avatar: 'AT',
  },
]

const DEFAULT_METRICS: Metric[] = [
  { value: '10K+', label: 'Active creators' },
  { value: '500K+', label: 'Content pieces published' },
  { value: '4.9', label: 'Average rating' },
]

const DEFAULT_LOGOS = ['Creator Co', 'Studio X', 'Agency Pro', 'Content Lab', 'Media Hub']

export interface SocialProofProps {
  testimonials?: Testimonial[]
  metrics?: Metric[]
  logos?: string[]
  /** When true, shows skeleton loaders instead of content */
  isLoading?: boolean
  /** When set, shows error state with retry option */
  error?: Error | string | null
  /** Called when user clicks retry in error state */
  onRetry?: () => void
}

function MetricsEmptyState() {
  return (
    <Card className="col-span-full animate-fade-in border-2 border-dashed border-border bg-muted/30">
      <CardContent className="flex flex-col items-center justify-center gap-4 p-6 text-center sm:p-8 sm:gap-6 md:p-12">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <BarChart3 className="h-7 w-7 text-primary" aria-hidden />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-base text-foreground sm:text-lg">Metrics coming soon</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            We&apos;re tracking our growth and impact. Check back soon to see how creators are succeeding with Creator Ops Hub.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function TestimonialsEmptyState() {
  return (
    <Card className="col-span-full animate-fade-in border-2 border-dashed border-border bg-muted/30">
      <CardContent className="flex flex-col items-center justify-center gap-4 p-6 text-center sm:p-8 sm:gap-6 md:p-12">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <MessageSquareQuote className="h-7 w-7 text-primary" aria-hidden />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-base text-foreground sm:text-lg">Hear from creators soon</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            We&apos;re collecting testimonials from our community. Be the first to share your experience and help others discover Creator Ops Hub.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function LogosEmptyState() {
  return (
    <div className="animate-fade-in w-full rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-10 sm:px-8 sm:py-12">
      <div className="flex flex-col items-center justify-center gap-4 text-center sm:gap-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="h-7 w-7 text-primary" aria-hidden />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-base text-foreground sm:text-lg">Join our growing community</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            We&apos;re building a network of creator teams. Partner with us and get featured here.
          </p>
        </div>
        <Button asChild size="lg" className="mt-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
          <Link to="/login-/-signup?mode=signup" aria-label="Partner with Creator Ops Hub and get featured">
            Partner with us
          </Link>
        </Button>
      </div>
    </div>
  )
}

function MetricsSkeleton() {
  return (
    <div className="col-span-full grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 md:gap-8">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-6 sm:p-8">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="mt-2 h-4 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TestimonialsSkeleton() {
  return (
    <div className="col-span-full grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <Skeleton className="h-6 w-8" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
            <Skeleton className="mt-2 h-4 w-1/2" />
            <div className="mt-6 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function LogosSkeleton() {
  return (
    <div className="flex flex-wrap justify-center gap-6 md:gap-12">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-6 w-24" />
      ))}
    </div>
  )
}

export function SocialProof({
  testimonials = DEFAULT_TESTIMONIALS,
  metrics = DEFAULT_METRICS,
  logos = DEFAULT_LOGOS,
  isLoading = false,
  error = null,
  onRetry,
}: SocialProofProps) {
  const hasMetrics = metrics.length > 0
  const hasTestimonials = testimonials.length > 0
  const hasLogos = logos.length > 0
  const hasError = Boolean(error)

  const errorMessage = typeof error === 'string' ? error : error?.message

  if (hasError) {
    return (
      <section className="container mx-auto px-4 py-24" aria-labelledby="social-proof-heading">
        <h2 id="social-proof-heading" className="sr-only">
          Social proof
        </h2>
        <ErrorState
          title="Couldn&apos;t load social proof"
          description={errorMessage ?? 'We couldn&apos;t load testimonials and metrics. Please try again.'}
          onRetry={onRetry}
          retryLabel="Try again"
          buttonAriaLabel="Retry loading social proof"
          className="max-w-md mx-auto"
        />
      </section>
    )
  }

  return (
    <section className="container mx-auto px-4 py-16 sm:py-20 md:py-24" aria-labelledby="social-proof-heading">
      <h2 id="social-proof-heading" className="text-h2 font-bold text-center mb-4 animate-slide-up text-foreground">
        Loved by creators
      </h2>
      <p
        className="text-muted-foreground text-center max-w-2xl mx-auto mb-12 sm:mb-16 animate-slide-up"
        style={{ animationDelay: '50ms' }}
      >
        Join thousands of creators and teams who ship content faster with Creator Ops Hub.
      </p>

      {/* Metrics row - card-based layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12 sm:mb-16 md:mb-20">
        {isLoading ? (
          <MetricsSkeleton />
        ) : hasMetrics ? (
          metrics.map(({ value, label }, i) => (
            <Card
              key={label}
              className={cn(
                'text-center transition-all duration-300 hover:shadow-card-hover hover:scale-[1.02]',
                !isLoading && 'animate-slide-up opacity-0'
              )}
              style={!isLoading ? { animationDelay: `${(i + 1) * 80}ms`, animationFillMode: 'forwards' } : undefined}
            >
              <CardContent className="p-6 sm:p-8">
                <div className="text-h1 font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {value}
                </div>
                <div className="text-small text-muted-foreground mt-1">{label}</div>
              </CardContent>
            </Card>
          ))
        ) : (
          <MetricsEmptyState />
        )}
      </div>

      {/* Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 sm:mb-16 md:mb-20">
        {isLoading ? (
          <TestimonialsSkeleton />
        ) : hasTestimonials ? (
          testimonials.map(({ quote, author, role, avatar }, i) => (
            <Card
              key={author}
              className={cn(
                'transition-all duration-300 hover:scale-[1.02] hover:shadow-card-hover',
                !isLoading && 'animate-slide-up opacity-0'
              )}
              style={!isLoading ? { animationDelay: `${(i + 1) * 100}ms`, animationFillMode: 'forwards' } : undefined}
            >
              <CardContent className="pt-6">
                <Quote className="h-8 w-8 text-primary/30 mb-4" aria-hidden />
                <p className="text-body text-foreground mb-6 leading-relaxed">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-2 mb-2" aria-hidden>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-small">
                    {avatar}
                  </div>
                  <div>
                    <div className="font-medium text-small text-foreground">{author}</div>
                    <div className="text-micro text-muted-foreground">{role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <TestimonialsEmptyState />
        )}
      </div>

      {/* Logo row */}
      <div className="border-t border-border pt-8 sm:pt-12">
        <p className="text-center text-micro text-muted-foreground mb-6 sm:mb-8 uppercase tracking-wider">
          Trusted by teams at
        </p>
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-12">
          {isLoading ? (
            <LogosSkeleton />
          ) : hasLogos ? (
            logos.map((name, i) => (
              <div
                key={name}
                className="text-muted-foreground font-semibold text-h3 transition-colors animate-fade-in opacity-0 hover:text-foreground"
                style={{ animationDelay: `${(i + 1) * 50}ms`, animationFillMode: 'forwards' }}
              >
                {name}
              </div>
            ))
          ) : (
            <div className="w-full">
              <LogosEmptyState />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
