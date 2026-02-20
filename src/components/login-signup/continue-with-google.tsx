import { useState } from 'react'
import { Loader2, Chromium, Mail, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ContinueWithGoogleProps {
  onContinue: () => void | Promise<void>
  disabled?: boolean
  className?: string
}

export function ContinueWithGoogle({
  onContinue,
  disabled = false,
  className,
}: ContinueWithGoogleProps) {
  const [showConsent, setShowConsent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (!showConsent) {
      setShowConsent(true)
      return
    }
    setIsLoading(true)
    try {
      await onContinue()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {showConsent && (
        <div
          className="rounded-lg border border-primary/20 bg-primary/5 p-4 animate-fade-in"
          role="alert"
          aria-live="polite"
        >
          <p className="text-small font-medium text-foreground mb-2">
            Gmail + Calendar access
          </p>
          <p className="text-small text-muted-foreground mb-3">
            By continuing, you grant Creator Ops Hub access to read your Gmail
            and Google Calendar for scheduling and content workflows.
          </p>
          <div className="flex items-center gap-4 text-small text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" aria-hidden />
              Gmail
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" aria-hidden />
              Google Calendar
            </span>
          </div>
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:border-primary/50 hover:bg-primary/5 border-2"
        onClick={handleClick}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        aria-label={
          isLoading
            ? 'Connecting with Google'
            : showConsent
              ? 'Confirm and continue with Google (Gmail + Calendar)'
              : 'Continue with Google (Gmail + Calendar)'
        }
      >
        {isLoading ? (
          <Loader2
            className="h-5 w-5 mr-2 animate-spin"
            aria-hidden
          />
        ) : (
          <Chromium
            className="h-5 w-5 mr-2 shrink-0"
            role="img"
            aria-label="Google"
          />
        )}
        {isLoading
          ? 'Connecting...'
          : showConsent
            ? 'Confirm & continue with Google'
            : 'Continue with Google (Gmail + Calendar)'}
      </Button>
    </div>
  )
}
