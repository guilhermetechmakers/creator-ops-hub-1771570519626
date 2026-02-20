import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface PublicPageHeaderProps {
  className?: string
}

export function PublicPageHeader({ className }: PublicPageHeaderProps) {
  return (
    <Card
      role="banner"
      className={cn(
        'sticky top-0 z-50 w-full rounded-none border-x-0 border-t-0 shadow-none',
        'border-b border-border/40 bg-background/80 backdrop-blur-md no-print',
        className
      )}
    >
      <CardContent className="p-0">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-h3 font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
            aria-label="Creator Ops Hub - Return to home"
          >
            <Home className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            Creator Ops Hub
          </Link>
          <nav className="flex items-center gap-4" aria-label="Main navigation">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link
                to="/login-/-signup?mode=login"
                aria-label="Sign in to your Creator Ops Hub account"
              >
                Sign In
              </Link>
            </Button>
            <Button asChild size="sm" className="font-medium">
              <Link
                to="/login-/-signup?mode=signup"
                aria-label="Get started with Creator Ops Hub for free"
              >
                Get Started Free
              </Link>
            </Button>
          </nav>
        </div>
      </CardContent>
    </Card>
  )
}
