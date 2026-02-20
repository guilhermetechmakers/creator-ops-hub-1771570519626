import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Building2 } from 'lucide-react'

export interface SSOEnterpriseCTAProps {
  onClick?: () => void
  className?: string
}

export function SSOEnterpriseCTA({ onClick, className }: SSOEnterpriseCTAProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-dashed border-input bg-muted/30 p-4 text-center',
        className
      )}
    >
      <p className="text-small font-medium text-foreground mb-1">
        SSO / Enterprise access
      </p>
      <p className="text-micro text-muted-foreground mb-3">
        Sign in with your organization&apos;s credentials
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        onClick={onClick}
        aria-label="Request SSO or Enterprise access"
      >
        <Building2 className="h-4 w-4 mr-2" aria-hidden />
        Request access
      </Button>
    </div>
  )
}
