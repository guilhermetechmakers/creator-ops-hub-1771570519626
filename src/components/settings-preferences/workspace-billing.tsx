import { Link } from 'react-router-dom'
import { CreditCard, Users, BarChart3, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { WorkspacePlan } from '@/types/settings-preferences'

export interface WorkspaceBillingProps {
  plan?: WorkspacePlan
  isLoading?: boolean
}

export function WorkspaceBilling({
  plan = {
    id: '1',
    name: 'Free',
    seats: 3,
    used_seats: 1,
    usage_percent: 33,
  },
  isLoading = false,
}: WorkspaceBillingProps) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden transition-all duration-300">
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-56 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-28" />
        </CardContent>
      </Card>
    )
  }

  const usagePercent = plan.usage_percent ?? (plan.seats ? Math.round((plan.used_seats / plan.seats) * 100) : 0)

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Workspace
        </CardTitle>
        <CardDescription>
          Billing, plan, seats, and usage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-card border">
          <div>
            <p className="font-medium">Current plan</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="font-semibold">
                {plan.name}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="transition-transform duration-200 hover:scale-[1.02]"
          >
            <Link to="/dashboard/integrations">
              Upgrade
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>

        {/* Seats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-small font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Seats
            </span>
            <span className="text-small text-muted-foreground">
              {plan.used_seats} / {plan.seats} used
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                usagePercent >= 90 ? 'bg-destructive' : usagePercent >= 70 ? 'bg-warning' : 'bg-primary'
              )}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Usage */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
          <BarChart3 className="h-4 w-4 text-primary" />
          <span className="text-small">
            Usage this period: {usagePercent}% of plan capacity
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
