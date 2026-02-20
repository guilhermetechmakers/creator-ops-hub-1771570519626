import {
  BarChart3,
  Users,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { WorkspacePlan, TeamMember } from '@/types/settings-preferences'

export interface AdminOverviewProps {
  plan?: WorkspacePlan | null
  members?: TeamMember[]
  /** Total member count (e.g. members.length + current user). Falls back to members.length when omitted. */
  memberCount?: number
  moderationAlerts?: number
  isLoading?: boolean
}

export function AdminOverview({
  plan,
  members = [],
  memberCount: memberCountProp,
  moderationAlerts = 0,
  isLoading = false,
}: AdminOverviewProps) {
  const usagePercent = plan?.usage_percent ?? (plan?.seats ? Math.round((plan.used_seats / plan.seats) * 100) : 0)
  const memberCount = memberCountProp ?? members.length
  const hasModerationAlerts = moderationAlerts > 0

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden transition-all duration-300 border-primary/5">
            <CardContent className="p-4">
              <Skeleton className="h-5 w-20 mb-2" shimmer />
              <Skeleton className="h-8 w-16 mb-1" shimmer />
              <Skeleton className="h-4 w-24" shimmer />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const metrics = [
    {
      label: 'Usage',
      value: `${usagePercent}%`,
      subtext: 'of plan capacity',
      icon: BarChart3,
      trend: usagePercent >= 90 ? 'high' : usagePercent >= 70 ? 'medium' : 'low',
    },
    {
      label: 'Team members',
      value: String(memberCount),
      subtext: memberCount === 1 ? 'member' : 'members',
      icon: Users,
      trend: 'neutral' as const,
    },
    {
      label: 'Billing',
      value: plan?.name ?? 'Free',
      subtext: plan?.current_period_end ? `Renews ${new Date(plan.current_period_end).toLocaleDateString()}` : 'Current plan',
      icon: CreditCard,
      trend: 'neutral' as const,
    },
    {
      label: 'Moderation',
      value: hasModerationAlerts ? String(moderationAlerts) : '0',
      subtext: hasModerationAlerts ? 'alerts need review' : 'No alerts',
      icon: AlertTriangle,
      trend: hasModerationAlerts ? ('high' as const) : ('low' as const),
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      {metrics.map((m) => {
        const Icon = m.icon
        return (
          <Card
            key={m.label}
            className={cn(
              'overflow-hidden transition-all duration-300 border-primary/5',
              'hover:shadow-card-hover hover:-translate-y-0.5',
              m.trend === 'high' && 'border-warning/30',
              m.trend === 'medium' && 'border-warning/10'
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-small font-medium text-muted-foreground flex items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    {m.label}
                  </p>
                  <p className="text-h3 font-bold mt-1 truncate">{m.value}</p>
                  <p className="text-micro text-muted-foreground mt-0.5">{m.subtext}</p>
                </div>
                {m.trend === 'high' && (
                  <Badge variant="outline" className="text-warning shrink-0 text-micro">
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                    Alert
                  </Badge>
                )}
                {m.trend === 'low' && m.label === 'Usage' && (
                  <Badge variant="secondary" className="shrink-0 text-micro">
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                    OK
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
