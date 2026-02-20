import { Quote, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
const testimonials = [
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
] as const

const metrics = [
  { value: '10K+', label: 'Active creators' },
  { value: '500K+', label: 'Content pieces published' },
  { value: '4.9', label: 'Average rating' },
] as const

const logos = ['Creator Co', 'Studio X', 'Agency Pro', 'Content Lab', 'Media Hub']

export function SocialProof() {
  return (
    <section className="container mx-auto px-4 py-24">
      <h2 className="text-h2 font-bold text-center mb-4 animate-slide-up">Loved by creators</h2>
      <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16 animate-slide-up" style={{ animationDelay: '50ms' }}>
        Join thousands of creators and teams who ship content faster with Creator Ops Hub.
      </p>

      {/* Metrics row */}
      <div className="flex flex-wrap justify-center gap-12 md:gap-20 mb-20">
        {metrics.map(({ value, label }, i) => (
          <div
            key={label}
            className="text-center animate-slide-up opacity-0"
            style={{ animationDelay: `${(i + 1) * 80}ms`, animationFillMode: 'forwards' }}
          >
            <div className="text-h1 font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {value}
            </div>
            <div className="text-small text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {testimonials.map(({ quote, author, role, avatar }, i) => (
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
        ))}
      </div>

      {/* Logo row */}
      <div className="border-t pt-12">
        <p className="text-center text-micro text-muted-foreground mb-8 uppercase tracking-wider">
          Trusted by teams at
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {logos.map((name, i) => (
            <div
              key={name}
              className="text-muted-foreground font-semibold text-h3 hover:text-foreground transition-colors animate-fade-in opacity-0"
              style={{ animationDelay: `${(i + 1) * 50}ms`, animationFillMode: 'forwards' }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
