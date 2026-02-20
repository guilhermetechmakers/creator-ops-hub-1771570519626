import { Link } from 'react-router-dom'
import { LayoutDashboard, MessageCircle, ArrowRight, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CTAGoToDashboardOrContactSupportProps {
  onRetry?: () => void
}

export function CTAGoToDashboardOrContactSupport({
  onRetry,
}: CTAGoToDashboardOrContactSupportProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  return (
    <div
      className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center animate-slide-up opacity-0"
      style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
    >
      <Button
        type="button"
        onClick={handleRetry}
        size="lg"
        variant="outline"
        className={cn(
          'border-2 hover:border-primary/50 hover:bg-primary/5',
          'transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
          'px-6 py-6 text-base font-medium'
        )}
      >
        <RotateCcw className="h-5 w-5 mr-2" />
        Try again
      </Button>
      <Button
        asChild
        size="lg"
        className={cn(
          'bg-gradient-to-r from-primary to-accent text-primary-foreground',
          'shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]',
          'transition-all duration-200 px-6 py-6 text-base font-medium'
        )}
      >
        <Link to="/dashboard">
          <LayoutDashboard className="h-5 w-5 mr-2" />
          Go to Dashboard
          <ArrowRight className="h-5 w-5 ml-2" />
        </Link>
      </Button>
      <Button
        asChild
        variant="outline"
        size="lg"
        className={cn(
          'border-2 hover:border-primary/50 hover:bg-primary/5',
          'transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
          'px-6 py-6 text-base font-medium'
        )}
      >
        <Link to="/dashboard/help-and-about">
          <MessageCircle className="h-5 w-5 mr-2" />
          Contact Support
        </Link>
      </Button>
    </div>
  )
}
