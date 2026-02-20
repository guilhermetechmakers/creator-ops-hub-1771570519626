import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface ForgotPasswordTermsLinksProps {
  /** Show forgot password link (typically for login mode) */
  showForgotPassword?: boolean
  className?: string
}

export function ForgotPasswordTermsLinks({
  showForgotPassword = true,
  className,
}: ForgotPasswordTermsLinksProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {showForgotPassword && (
        <Link
          to="/forgot-password"
          className="block text-small text-primary hover:underline transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          Forgot password?
        </Link>
      )}
      <p className="text-micro text-muted-foreground">
        By continuing, you agree to our{' '}
        <Link
          to="/terms"
          className="text-primary hover:underline transition-colors duration-200"
        >
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link
          to="/privacy"
          className="text-primary hover:underline transition-colors duration-200"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}
