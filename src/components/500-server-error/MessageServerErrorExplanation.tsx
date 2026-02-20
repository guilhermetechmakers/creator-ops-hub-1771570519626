import { ServerCrash } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function MessageServerErrorExplanation() {
  return (
    <Card
      role="alert"
      aria-labelledby="error-code-heading"
      aria-describedby="error-description"
      className={cn(
        'text-center animate-slide-up opacity-0 border-destructive/20 bg-destructive/5',
        'transition-all duration-300 hover:shadow-card-hover'
      )}
      style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}
    >
      <CardHeader className="space-y-4 p-6 pb-2 sm:p-8 sm:pb-4">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 sm:h-16 sm:w-16">
            <ServerCrash className="h-7 w-7 text-destructive sm:h-8 sm:w-8" aria-hidden />
          </div>
        </div>
        <div className="space-y-2">
          <h1
            id="error-code-heading"
            className="text-hero font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent sm:text-hero-lg"
          >
            500
          </h1>
          <h2 className="text-h2 font-semibold text-foreground">
            Server error
          </h2>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
        <p
          id="error-description"
          className="text-body text-muted-foreground max-w-md mx-auto leading-relaxed"
        >
          Something went wrong on our end. We&apos;re working to fix it. Please try again in a moment, or head back to the dashboard.
        </p>
      </CardContent>
    </Card>
  )
}
