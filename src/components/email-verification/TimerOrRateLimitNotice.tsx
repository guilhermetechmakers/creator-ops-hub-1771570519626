import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TimerOrRateLimitNoticeProps {
  cooldownSeconds: number
  isResending: boolean
  className?: string
}

export function TimerOrRateLimitNotice({
  cooldownSeconds,
  isResending,
  className,
}: TimerOrRateLimitNoticeProps) {
  if (cooldownSeconds <= 0 && !isResending) {
    return null
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-muted bg-muted/30 px-4 py-3 flex items-center gap-3 transition-colors duration-200',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={
        cooldownSeconds > 0
          ? `Rate limit: resend available in ${cooldownSeconds} seconds`
          : 'Sending verification email'
      }
    >
      <Clock className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
      <p className="text-micro text-muted-foreground">
        {isResending ? (
          'Sending verification email...'
        ) : (
          <>
            Rate limit: Please wait{' '}
            <span className="font-medium text-foreground">{cooldownSeconds}s</span>{' '}
            before requesting another email.
          </>
        )}
      </p>
    </div>
  )
}
