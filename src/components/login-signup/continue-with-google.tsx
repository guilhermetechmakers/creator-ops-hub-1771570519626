import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Mail, Calendar } from 'lucide-react'

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
          <Loader2 className="h-5 w-5 mr-2 animate-spin" aria-hidden />
        ) : (
          <GoogleIcon className="h-5 w-5 mr-2" aria-hidden />
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

function GoogleIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
