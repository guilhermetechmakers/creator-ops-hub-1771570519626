import { FileQuestion } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function MessageNotfoundExplanation() {
  return (
    <Card
      className={cn(
        'text-center border-0 shadow-none bg-transparent',
        'animate-slide-up opacity-0'
      )}
      style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}
    >
      <CardHeader className="flex flex-col-reverse gap-4 p-0">
        <h1 className="text-h2 md:text-h1 font-semibold text-foreground">
          Page not found
        </h1>
        <h2 className="text-hero md:text-hero-lg font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          404
        </h2>
      </CardHeader>
      <CardContent className="p-0 pt-3 md:pt-4">
        <CardDescription
          className={cn(
            'text-body text-muted-foreground max-w-md mx-auto leading-relaxed',
            'md:text-base'
          )}
        >
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved. Try searching below or head back to the dashboard.
        </CardDescription>
      </CardContent>
      {/* Icon for empty state - visually reinforces the message */}
      <div
        className="flex justify-center mt-6 md:mt-8"
        aria-hidden="true"
      >
        <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-muted/50">
          <FileQuestion className="h-7 w-7 md:h-8 md:w-8 text-muted-foreground" />
        </div>
      </div>
    </Card>
  )
}
