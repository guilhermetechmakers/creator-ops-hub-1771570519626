import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  retryLabel?: string
  /** Accessible label for the retry/action button (e.g. "Navigate to integrations page") */
  buttonAriaLabel?: string
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We couldn\'t load this content. Please try again.',
  onRetry,
  retryLabel = 'Try again',
  buttonAriaLabel,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center',
        'animate-fade-in',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          aria-label={buttonAriaLabel ?? retryLabel}
          className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
