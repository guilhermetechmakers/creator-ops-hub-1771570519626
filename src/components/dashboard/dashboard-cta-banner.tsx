import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DashboardCtaBannerProps {
  title?: string
  description?: string
  ctaText?: string
  onCtaClick?: () => void
  className?: string
}

export function DashboardCtaBanner({
  title = 'Upgrade or add seats',
  description = 'Unlock unlimited research credits and team features. Add seats for your team.',
  ctaText = 'Upgrade or add seats',
  onCtaClick,
  className,
}: DashboardCtaBannerProps) {
  return (
    <Card
      className={cn(
        'bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-primary/20 overflow-hidden',
        'transition-all duration-300 hover:shadow-card-hover hover:shadow-primary/5',
        className
      )}
    >
      <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-small text-muted-foreground">{description}</p>
          </div>
        </div>
        {onCtaClick ? (
          <Button
            onClick={onCtaClick}
            className="hover:scale-[1.02] active:scale-[0.98] transition-transform shrink-0"
            aria-label={ctaText}
          >
            {ctaText}
          </Button>
        ) : (
          <Button
            asChild
            className="hover:scale-[1.02] active:scale-[0.98] transition-transform shrink-0"
            aria-label={ctaText}
          >
            <Link to="/dashboard/checkout-/-payment">{ctaText}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
