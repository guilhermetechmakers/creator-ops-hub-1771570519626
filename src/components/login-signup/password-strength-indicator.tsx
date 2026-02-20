import { cn } from '@/lib/utils'
import type { PasswordStrength } from '@/lib/password-utils'

export type { PasswordStrength } from '@/lib/password-utils'

export interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength
  className?: string
}

const strengthConfig: Record<
  PasswordStrength,
  { label: string; color: string; width: string }
> = {
  weak: { label: 'Weak', color: 'bg-destructive', width: 'w-1/4' },
  fair: { label: 'Fair', color: 'bg-warning', width: 'w-1/2' },
  good: { label: 'Good', color: 'bg-primary/80', width: 'w-3/4' },
  strong: { label: 'Strong', color: 'bg-success', width: 'w-full' },
}

export function PasswordStrengthIndicator({
  strength,
  className,
}: PasswordStrengthIndicatorProps) {
  const config = strengthConfig[strength]
  return (
    <div className={cn('space-y-1', className)}>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            config.color,
            config.width
          )}
          role="progressbar"
          aria-valuenow={
            strength === 'weak' ? 25 : strength === 'fair' ? 50 : strength === 'good' ? 75 : 100
          }
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Password strength: ${config.label}`}
        />
      </div>
      <p className="text-micro text-muted-foreground">{config.label}</p>
    </div>
  )
}
