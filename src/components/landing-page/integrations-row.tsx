import {
  Globe,
  Instagram,
  Share2,
  Video,
  CreditCard,
  Wallet,
  PlugZap,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface IntegrationItem {
  name: string
}

const DEFAULT_INTEGRATIONS: IntegrationItem[] = [
  { name: 'Google' },
  { name: 'Instagram' },
  { name: 'X' },
  { name: 'YouTube' },
  { name: 'Stripe' },
  { name: 'PayPal' },
]

const INTEGRATION_ICONS: Record<string, LucideIcon> = {
  Google: Globe,
  Instagram,
  X: Share2,
  YouTube: Video,
  Stripe: CreditCard,
  PayPal: Wallet,
}

export interface IntegrationsRowProps {
  integrations?: IntegrationItem[]
  isLoading?: boolean
  hasError?: boolean
}

/** Empty state when integrations list is empty - per Design Reference: icon, helpful copy, CTA */
function IntegrationsEmptyState() {
  return (
    <Card
      className="overflow-hidden border-2 border-dashed border-muted bg-muted/5 animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <CardContent className="flex flex-col items-center justify-center gap-6 py-12 sm:py-16 px-6 sm:px-8 min-h-[200px] sm:min-h-[240px]">
        <div
          className="rounded-2xl bg-muted/50 p-6 sm:p-8 ring-1 ring-muted/80 transition-transform duration-200 hover:scale-[1.02]"
          aria-hidden
        >
          <PlugZap className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/70 mx-auto" />
        </div>
        <div id="integrations-empty-description" className="text-center space-y-2 max-w-sm">
          <h3 className="text-body font-semibold text-foreground">
            Integrations coming soon
          </h3>
          <p className="text-small text-muted-foreground leading-relaxed">
            We&apos;re connecting with the tools you use. Google, Instagram, YouTube,
            Stripe, and more will be available shortly. Check back for updates.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/** Loading skeleton for integrations grid */
function IntegrationsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-4 flex flex-col items-center gap-3 pt-4">
            <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
            <div className="h-4 w-16 rounded bg-muted animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function IntegrationsRow({
  integrations = DEFAULT_INTEGRATIONS,
  isLoading = false,
  hasError = false,
}: IntegrationsRowProps) {
  const isEmpty = !integrations || integrations.length === 0

  return (
    <section
      className="border-y bg-muted/30 py-12 sm:py-16"
      aria-labelledby="integrations-heading"
      aria-describedby={isEmpty ? 'integrations-empty-description' : undefined}
    >
      <div className="container mx-auto px-4">
        <p
          id="integrations-heading"
          className="text-center text-small font-medium text-muted-foreground mb-8 sm:mb-10 uppercase tracking-wider"
        >
          Integrates with the tools you use
        </p>

        {hasError ? (
          <div
            role="alert"
            className="flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center"
          >
            <p className="text-small text-muted-foreground">
              Unable to load integrations. Please try again later.
            </p>
          </div>
        ) : isLoading ? (
          <IntegrationsLoadingSkeleton />
        ) : isEmpty ? (
          <IntegrationsEmptyState />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
            {integrations.map(({ name }, i) => (
              <IntegrationLogo key={name} name={name} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

interface IntegrationLogoProps {
  name: string
  index: number
}

function IntegrationLogo({ name, index }: IntegrationLogoProps) {
  const Icon = INTEGRATION_ICONS[name]

  return (
    <Card
      className={cn(
        'group flex flex-col items-center justify-center gap-2 p-4',
        'animate-fade-in opacity-0 transition-all duration-300',
        'hover:shadow-card-hover hover:scale-[1.02]',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
      )}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      <CardContent className="p-4 flex flex-col items-center gap-2 pt-4">
        <span aria-hidden className="flex items-center justify-center">
          {Icon ? (
            <Icon
              className="h-10 w-10 text-muted-foreground transition-colors group-hover:text-foreground"
              aria-hidden
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-semibold text-small">
              {name[0]}
            </div>
          )}
        </span>
        <span className="text-micro text-muted-foreground">{name}</span>
      </CardContent>
    </Card>
  )
}
