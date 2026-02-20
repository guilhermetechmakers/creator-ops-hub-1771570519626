import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CTAGoToDashboardProps {
  className?: string
}

export function CTAGoToDashboard({ className }: CTAGoToDashboardProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <Button
        variant="outline"
        className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        asChild
      >
        <Link to="/dashboard">
          Go to dashboard
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
        </Link>
      </Button>
      <Link
        to="/login-/-signup?mode=login"
        className="text-center text-small text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
      >
        Back to sign in
      </Link>
    </div>
  )
}
