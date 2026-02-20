import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageNotfoundExplanation } from '@/components/404-not-found/MessageNotfoundExplanation'
import { Searchboxandsuggestedlinks } from '@/components/404-not-found/Searchboxandsuggestedlinks'
import { CTAGoToDashboardOrContactSupport } from '@/components/404-not-found/CTAGoToDashboardOrContactSupport'
import { cn } from '@/lib/utils'

export function NotFoundPage() {
  useEffect(() => {
    document.title = '404 Not Found | Creator Ops Hub'
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Subtle animated gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent" />
      </div>

      {/* Header with back to home */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            to="/"
            className="text-h3 font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
          >
            Creator Ops Hub
          </Link>
          <Link
            to="/dashboard"
            className="text-small font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg px-3 py-2"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24">
        <div className={cn('w-full max-w-2xl space-y-10')}>
          <MessageNotfoundExplanation />
          <Searchboxandsuggestedlinks />
          <CTAGoToDashboardOrContactSupport />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center">
          <Link
            to="/"
            className="text-small text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Return to home
          </Link>
        </div>
      </footer>
    </div>
  )
}

export default NotFoundPage
