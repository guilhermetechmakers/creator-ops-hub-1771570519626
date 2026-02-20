import { BarChart3, Building2, MessageSquareQuote, Quote, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

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
}

function MetricsEmptyState() {
  return (
    <Card className="col-span-full animate-fade-in border-dashed border-2 border-muted-foreground/20 bg-muted/30">
      <CardContent className="flex flex-col items-center justify-center gap-4 p-8 sm:p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <BarChart3 className="h-7 w-7 text-primary/60" aria-hidden />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground text-base sm:text-lg">Metrics coming soon</h3>
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
    <Card className="col-span-full animate-fade-in border-dashed border-2 border-muted-foreground/20 bg-muted/30">
      <CardContent className="flex flex-col items-center justify-center gap-4 p-8 sm:p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <MessageSquareQuote className="h-7 w-7 text-primary/60" aria-hidden />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground text-base sm:text-lg">Hear from creators soon</h3>
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
    <div className="animate-fade-in rounded-xl border border-dashed border-muted-foreground/20 bg-muted/30 px-6 py-10 sm:px-8 sm:py-12">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="h-7 w-7 text-primary/60" aria-hidden />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground text-base sm:text-lg">Join our growing community</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            We&apos;re building a network of creator teams. Partner with us and get featured here.
          </p>
        </div>
      </div>
    </div>
  )
}

export function SocialProof({ testimonials = DEFAULT_TESTIMONIALS, metrics = DEFAULT_METRICS, logos = DEFAULT_LOGOS }: SocialProofProps) {
  const hasMetrics = metrics.length > 0
  const hasTestimonials = testimonials.length > 0
  const hasLogos = logos.length > 0

  return (
    <section className="container mx-auto px-4 py-24" aria-labelledby="social-proof-heading">
      <h2 id="social-proof-heading" className="text-h2 font-bold text-center mb-4 animate-slide-up">Loved by creators</h2>
      <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16 animate-slide-up" style={{ animationDelay: '50ms' }}>
        Join thousands of creators and teams who ship content faster with Creator Ops Hub.
      </p>

      {/* Metrics row - card-based layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 mb-20">
        {hasMetrics ? (
          metrics.map(({ value, label }, i) => (
            <Card
              key={label}
              className="text-center animate-slide-up opacity-0 transition-all duration-300 hover:shadow-card-hover hover:scale-[1.02]"
              style={{ animationDelay: `${(i + 1) * 80}ms`, animationFillMode: 'forwards' }}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {hasTestimonials ? (
          testimonials.map(({ quote, author, role, avatar }, i) => (
            <Card
              key={author}
              className="animate-slide-up opacity-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-card-hover"
              style={{ animationDelay: `${(i + 1) * 100}ms`, animationFillMode: 'forwards' }}
            >
              <CardContent className="pt-6">
                <Quote className="h-8 w-8 text-primary/30 mb-4" />
                <p className="text-body text-foreground mb-6 leading-relaxed">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-small">
                    {avatar}
                  </div>
                  <div>
                    <div className="font-medium text-small">{author}</div>
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
      <div className="border-t pt-12">
        <p className="text-center text-micro text-muted-foreground mb-8 uppercase tracking-wider">
          Trusted by teams at
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {hasLogos ? (
            logos.map((name, i) => (
              <div
                key={name}
                className="text-muted-foreground font-semibold text-h3 hover:text-foreground transition-colors animate-fade-in opacity-0"
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
