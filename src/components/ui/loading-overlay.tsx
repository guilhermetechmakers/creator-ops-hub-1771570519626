import { useLoading } from '@/contexts/loading-context'
import { cn } from '@/lib/utils'

interface LoadingOverlayProps {
  className?: string
}

export function LoadingOverlay({ className }: LoadingOverlayProps) {
  const { isLoading, message } = useLoading()

  if (!isLoading) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message ?? 'Loading'}
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm',
        'animate-fade-in',
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"
            style={{ animationDuration: '0.8s' }}
          />
        </div>
        {message && (
          <p className="text-sm font-medium text-muted-foreground animate-fade-in">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
