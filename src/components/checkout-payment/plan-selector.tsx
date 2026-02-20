import { Check, Zap, Crown, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PlanTier } from '@/types/checkout'

export interface PlanSelectorProps {
  currentPlanId?: string
  tiers?: PlanTier[]
  billingCycle?: 'monthly' | 'yearly'
  onSelectPlan?: (tier: PlanTier) => void
  isLoading?: boolean
}

const DEFAULT_TIERS: PlanTier[] = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    seats: 3,
    features: ['3 team seats', 'Basic analytics', '1 social account', 'Community support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 29,
    priceYearly: 290,
    seats: 10,
    features: ['10 team seats', 'Advanced analytics', '5 social accounts', 'Priority support', 'Content calendar', 'AI writing assistant'],
    popular: true,
  },
  {
    id: 'team',
    name: 'Team',
    priceMonthly: 79,
    priceYearly: 790,
    seats: 25,
    features: ['25 team seats', 'Full analytics suite', 'Unlimited accounts', 'Dedicated support', 'Custom branding', 'API access', 'Advanced workflows'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 199,
    priceYearly: 1990,
    seats: 100,
    features: ['100+ seats', 'Enterprise analytics', 'SSO & SAML', 'Custom integrations', 'SLA guarantee', 'Onboarding & training'],
  },
]

const TIER_ICONS = {
  free: Sparkles,
  pro: Zap,
  team: Crown,
  enterprise: Crown,
}

export function PlanSelector({
  currentPlanId = 'free',
  tiers = DEFAULT_TIERS,
  billingCycle = 'monthly',
  onSelectPlan,
  isLoading = false,
}: PlanSelectorProps) {
  return (
    <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-primary/5 to-transparent transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Plan selector
        </CardTitle>
        <CardDescription>
          Current plan and upgradable tiers. Choose the plan that fits your needs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-xl border bg-muted/50"
                aria-hidden
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier) => {
              const Icon = TIER_ICONS[tier.id as keyof typeof TIER_ICONS] ?? Zap
              const isCurrent = currentPlanId === tier.id
              const price =
                billingCycle === 'yearly' ? tier.priceYearly : tier.priceMonthly

              return (
                <Card
                  key={tier.id}
                  className={cn(
                    'relative cursor-pointer overflow-hidden transition-all duration-300',
                    'hover:scale-[1.02] hover:shadow-elevated hover:border-primary/30',
                    isCurrent && 'ring-2 ring-primary',
                    tier.popular && 'border-primary/30'
                  )}
                  onClick={() => onSelectPlan?.(tier)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelectPlan?.(tier)
                    }
                  }}
                  aria-pressed={isCurrent}
                  aria-label={`Select ${tier.name} plan`}
                >
                  {tier.popular && (
                    <div className="absolute right-0 top-0">
                      <Badge
                        variant="default"
                        className="rounded-bl-lg rounded-tr-none rounded-tl-lg rounded-br-none px-2 py-0.5 text-xs"
                      >
                        Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-h3">{tier.name}</CardTitle>
                    </div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-bold">
                        {price === 0 ? 'Free' : `$${price}`}
                      </span>
                      {price > 0 && (
                        <span className="text-small text-muted-foreground">
                          /{billingCycle === 'yearly' ? 'mo billed yearly' : 'month'}
                        </span>
                      )}
                    </div>
                    <CardDescription className="text-small">
                      {tier.seats} seat{tier.seats !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {tier.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-small"
                        >
                          <Check className="h-4 w-4 shrink-0 text-success" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {isCurrent && (
                      <Badge
                        variant="secondary"
                        className="mt-4 w-full justify-center py-1"
                      >
                        Current plan
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
