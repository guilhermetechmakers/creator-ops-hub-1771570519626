import { Link } from 'react-router-dom'
import { Lock, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePremiumAccess } from '@/hooks/use-premium-access'

export interface PremiumGateProps {
  children: React.ReactNode
  featureName?: string
}

/**
 * Wraps premium features. When user lacks premium access, shows upgrade CTA.
 * When user has premium or loading, renders children.
 */
export function PremiumGate({ children, featureName = 'this feature' }: PremiumGateProps) {
  const { hasPremiumAccess, isLoading } = usePremiumAccess()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!hasPremiumAccess) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-h1 font-bold">Upgrade Required</h1>
          <p className="text-muted-foreground mt-1">
            {featureName} is available on Pro, Team, or Enterprise plans
          </p>
        </div>
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-primary/[0.03] to-transparent">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <p className="mt-6 font-semibold text-h3">Unlock {featureName}</p>
            <p className="mt-2 text-small text-muted-foreground max-w-sm">
              Upgrade your plan to access advanced analytics, integrations, and more.
            </p>
            <Button
              size="lg"
              className="mt-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-[1.02]"
              asChild
            >
              <Link to="/dashboard/checkout-/-payment">
                Upgrade plan
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="mt-4" asChild>
              <Link to="/dashboard/settings">Back to Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
