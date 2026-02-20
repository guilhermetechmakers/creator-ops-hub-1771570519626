import { Check, Zap, Crown, Sparkles, LayoutGrid, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { PlanTier } from '@/types/checkout'

export interface PlanSelectorProps {
  currentPlanId?: string
  tiers?: PlanTier[]
  billingCycle?: 'monthly' | 'yearly'
  onSelectPlan?: (tier: PlanTier) => void
  isLoading?: boolean
  /** Called when user clicks refresh in empty state */
  onRefresh?: () => void
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
  onRefresh,
}: PlanSelectorProps) {
  const hasTiers = tiers.length > 0

  return (
    <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-primary/5 via-primary/[0.03] to-transparent transition-all duration-300 hover:shadow-card-hover hover:border-primary/20">
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
              <Skeleton key={i} className="h-64 rounded-xl" shimmer aria-hidden />
            ))}
          </div>
        ) : !hasTiers ? (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 p-8 py-12 text-center animate-fade-in"
          >
            <div className="flex h-14 w-14 min-w-[3.5rem] items-center justify-center rounded-full bg-primary/10">
              <LayoutGrid className="h-7 w-7 text-primary" aria-hidden />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">No plans available</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Plans are not available at the moment. Please check back later or contact support for assistance.
              </p>
            </div>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                aria-label="Refresh plans"
                className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                <RefreshCw className="h-4 w-4 mr-2" aria-hidden />
                Refresh
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier, idx) => {
              const Icon = TIER_ICONS[tier.id as keyof typeof TIER_ICONS] ?? Zap
              const isCurrent = currentPlanId === tier.id
              const price =
                billingCycle === 'yearly' ? tier.priceYearly : tier.priceMonthly

              return (
                <Card
                  key={tier.id}
                  className={cn(
                    'relative cursor-pointer overflow-hidden transition-all duration-300 animate-slide-up',
                    'hover:scale-[1.02] hover:shadow-elevated hover:border-primary/30',
                    isCurrent && 'ring-2 ring-primary',
                    tier.popular && 'border-primary/30'
                  )}
                  style={{
                    animationDelay: `${idx * 75}ms`,
                    animationFillMode: 'both',
                  }}
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
