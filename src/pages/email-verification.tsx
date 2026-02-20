import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  Mail,
  Shield,
  Lock,
  CheckCircle2,
  Clock,
  Loader2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'
import { resendVerificationEmail } from '@/lib/email-verification-ops'
import { supabase } from '@/lib/supabase'

const RESEND_COOLDOWN_SEC = 60

type VerificationStatus = 'pending' | 'verified' | 'checking'

export function EmailVerificationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState(() => {
    const fromState = (location.state as { email?: string } | null)?.email
    if (fromState) return fromState
    try {
      return sessionStorage.getItem('verify_email') ?? ''
    } catch {
      return ''
    }
  })
  const [status, setStatus] = useState<VerificationStatus>('pending')
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)


  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [resendCooldown])

  const checkVerificationStatus = async () => {
    setStatus('checking')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (user?.email_confirmed_at) {
        setStatus('verified')
        try {
          sessionStorage.removeItem('verify_email')
        } catch {
          /* ignore */
        }
        toast.success('Email verified! Redirecting to dashboard.')
        setTimeout(() => navigate('/dashboard', { replace: true }), 1500)
      } else {
        setStatus('pending')
        if (user?.email && !email) setEmail(user.email)
      }
    } catch {
      setStatus('pending')
    }
  }

  useEffect(() => {
    checkVerificationStatus()
  }, [])

  const handleResend = async () => {
    const targetEmail = email?.trim()
    if (!targetEmail) {
      toast.error('Email address is required to resend. Please sign up again.')
      navigate('/login-/-signup?mode=signup', { replace: true })
      return
    }
    if (resendCooldown > 0 || isResending) return
    setIsResending(true)
    try {
      await resendVerificationEmail(targetEmail)
      toast.success('Verification email sent. Check your inbox.')
      setResendCooldown(RESEND_COOLDOWN_SEC)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      </div>

      <Card className="relative w-full max-w-md animate-fade-in shadow-card border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
        <CardHeader className="relative text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Mail className="h-7 w-7" aria-hidden />
          </div>
          <CardTitle className="text-h2 font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Verify your email
          </CardTitle>
          <CardDescription className="text-body">
            {status === 'checking'
              ? 'Checking verification status...'
              : status === 'verified'
                ? 'Your email has been verified.'
                : "We've sent a verification link to your email. Click the link to activate your account."}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-6">
          {status === 'checking' && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground py-4">
              <Loader2 className="h-5 w-5 animate-pulse" aria-hidden />
              <span className="text-small">Checking...</span>
            </div>
          )}

          {status === 'verified' && (
            <div className="flex items-center justify-center gap-2 text-success py-4">
              <CheckCircle2 className="h-6 w-6" aria-hidden />
              <span className="text-small font-medium">Verified! Redirecting...</span>
            </div>
          )}

          {status === 'pending' && (
            <>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="text-small font-medium text-foreground">Verification status</p>
                  <p className="text-micro text-muted-foreground mt-1">
                    Pending — click the link in your email to verify.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleResend}
                  disabled={isResending || resendCooldown > 0}
                  aria-label={
                    resendCooldown > 0
                      ? `Resend available in ${resendCooldown} seconds`
                      : 'Resend verification email'
                  }
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-pulse" aria-hidden />
                      Sending...
                    </>
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" aria-hidden />
                      Resend verification email
                    </>
                  )}
                </Button>
                <p className="text-micro text-muted-foreground text-center">
                  Didn&apos;t receive the email? Check your spam folder or try again in a few minutes.
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                onClick={checkVerificationStatus}
              >
                I&apos;ve verified — check again
              </Button>
            </>
          )}

          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <p className="text-small font-medium text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" aria-hidden />
              Security guidance
            </p>
            <ul className="text-micro text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
                <span>Never share your verification link — it&apos;s unique to your account.</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
                <span>Links expire after 24 hours. Request a new one if needed.</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
                <span>If you didn&apos;t sign up, you can safely ignore the email.</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
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
              className="text-center text-small text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
