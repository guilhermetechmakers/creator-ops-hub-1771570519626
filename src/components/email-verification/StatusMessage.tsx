import { Clock, CheckCircle2, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export type VerificationStatus = 'pending' | 'verified' | 'checking'

export interface StatusMessageProps {
  status: VerificationStatus
  email?: string
  className?: string
}

export function StatusMessage({ status, email, className }: StatusMessageProps) {
  if (status === 'checking') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-4 py-6',
          className
        )}
        role="status"
        aria-live="polite"
        aria-label="Checking verification status"
      >
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          <span className="text-small">Checking verification status...</span>
        </div>
        <div className="w-full space-y-2">
          <Skeleton className="h-3 w-full" shimmer />
          <Skeleton className="h-3 w-4/5" shimmer />
          <Skeleton className="h-3 w-3/5" shimmer />
        </div>
      </div>
    )
  }

  if (status === 'verified') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3 py-6 animate-fade-in',
          className
        )}
        role="status"
        aria-live="polite"
        aria-label="Email verified"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20 text-success">
          <CheckCircle2 className="h-6 w-6" aria-hidden />
        </div>
        <span className="text-small font-medium text-success">
          Verified! Redirecting to dashboard...
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3 transition-all duration-200 hover:border-primary/30',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label="Verification pending"
    >
      <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-small font-medium text-foreground">
          Verification status
        </p>
        <p className="text-micro text-muted-foreground mt-1">
          Pending — click the link in your email to verify.
        </p>
        {email && (
          <p
            className="text-micro text-primary mt-2 font-medium truncate"
            title={email}
          >
            {email}
          </p>
        )}
      </div>
    </div>
  )
}
