import { Button } from '@/components/ui/button'
import { RefreshCw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ResendButtonProps {
  onClick: () => void
  isResending: boolean
  cooldownSeconds: number
  disabled?: boolean
  className?: string
}

export function ResendButton({
  onClick,
  isResending,
  cooldownSeconds,
  disabled = false,
  className,
}: ResendButtonProps) {
  const isDisabled = disabled || isResending || cooldownSeconds > 0

  return (
    <div className="space-y-3">
      <Button
        className={cn(
          'w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
          className
        )}
        onClick={onClick}
        disabled={isDisabled}
        aria-label={
          cooldownSeconds > 0
            ? `Resend available in ${cooldownSeconds} seconds`
            : 'Resend verification email'
        }
      >
        {isResending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Sending...
          </>
        ) : cooldownSeconds > 0 ? (
          `Resend in ${cooldownSeconds}s`
        ) : (
          <>
            <RefreshCw className="h-4 w-4" aria-hidden />
            Resend verification email
          </>
        )}
      </Button>
      <p className="text-micro text-muted-foreground text-center">
        Didn&apos;t receive the email? Check your spam folder or try again in a
        few minutes.
      </p>
    </div>
  )
}
