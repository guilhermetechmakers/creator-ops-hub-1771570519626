import { Link } from 'react-router-dom'
import { ArrowRight, Check, Zap, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    features: ['3 team seats', 'Basic analytics', '1 social account'],
    icon: Check,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    features: ['10 team seats', 'Advanced analytics', '5 social accounts', 'AI assistant'],
    icon: Zap,
    popular: true,
  },
  {
    name: 'Team',
    price: '$79',
    period: '/month',
    features: ['25 team seats', 'Full analytics', 'Unlimited accounts', 'API access'],
    icon: Crown,
  },
]

export function PricingTeaser() {
  return (
    <section className="container mx-auto px-4 py-24">
      <h2 className="text-h2 font-bold text-center mb-4 animate-slide-up">Simple, transparent pricing</h2>
      <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16 animate-slide-up" style={{ animationDelay: '50ms' }}>
        Start free, scale as you grow. No hidden fees.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {tiers.map(({ name, price, period, features, icon: Icon, popular }, i) => (
          <Card
            key={name}
            className={cn(
              'animate-slide-up opacity-0 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-card-hover',
              popular && 'border-2 border-primary shadow-lg ring-2 ring-primary/20'
            )}
            style={{ animationDelay: `${(i + 1) * 100}ms`, animationFillMode: 'forwards' }}
          >
            {popular && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
            )}
            <CardHeader>
              {popular && (
                <span className="absolute top-4 right-4 text-micro font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  Popular
                </span>
              )}
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                {name}
              </CardTitle>
              <div className="flex items-baseline gap-1">
                <span className="text-h1 font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {price}
                </span>
                <span className="text-muted-foreground">{period}</span>
              </div>
              <CardDescription>Everything you need to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-small">
                    <Check className="h-4 w-4 text-success shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant={popular ? 'default' : 'outline'} className="w-full" size="lg">
                <Link to="/pricing" aria-label={`View ${name} pricing plan details`}>
                  View plans
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="text-center mt-10">
        <Button variant="link" asChild className="text-primary font-medium">
          <Link to="/pricing" aria-label="Compare all pricing plans">Compare all plans →</Link>
        </Button>
      </div>
    </section>
  )
}
