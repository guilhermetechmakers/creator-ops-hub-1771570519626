import { cn } from '@/lib/utils'

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong'

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

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return 'weak'
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  if (score <= 1) return 'weak'
  if (score <= 2) return 'fair'
  if (score <= 4) return 'good'
  return 'strong'
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
