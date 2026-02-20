import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Mail,
  Shield,
  Lock,
  CheckCircle2,
  Clock,
  Loader2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react'
import { resendVerificationEmail } from '@/lib/email-verification-ops'
import { supabase } from '@/lib/supabase'

const RESEND_COOLDOWN_SEC = 60

const SUPABASE_CONFIGURED =
  typeof import.meta.env.VITE_SUPABASE_URL === 'string' &&
  import.meta.env.VITE_SUPABASE_URL.length > 0 &&
  typeof import.meta.env.VITE_SUPABASE_ANON_KEY === 'string' &&
  import.meta.env.VITE_SUPABASE_ANON_KEY.length > 0

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
    document.title = 'Verify your email | Creator Ops Hub'
  }, [])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [resendCooldown])

  const checkVerificationStatus = async () => {
    if (!SUPABASE_CONFIGURED) {
      setStatus('pending')
      return
    }
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <Link
        to="/"
        className="absolute top-4 left-4 z-10 flex items-center gap-2 text-small text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg px-3 py-2"
        aria-label="Back to home"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to home
      </Link>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-float-subtle" />
        <div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-accent/10 blur-3xl animate-float-subtle"
          style={{ animationDelay: '-2s' }}
        />
      </div>

      <Card className="relative w-full max-w-md animate-fade-in shadow-card border-border overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
        <CardHeader className="relative text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 text-primary shadow-sm">
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
            <div className="flex flex-col items-center justify-center gap-4 py-6">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                <span className="text-small">Checking verification status...</span>
              </div>
              <div className="w-full space-y-2">
                <Skeleton className="h-3 w-full" shimmer />
                <Skeleton className="h-3 w-4/5" shimmer />
                <Skeleton className="h-3 w-3/5" shimmer />
              </div>
            </div>
          )}

          {status === 'verified' && (
            <div className="flex flex-col items-center justify-center gap-3 py-6 animate-fade-in">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20 text-success">
                <CheckCircle2 className="h-6 w-6" aria-hidden />
              </div>
              <span className="text-small font-medium text-success">Verified! Redirecting to dashboard...</span>
            </div>
          )}

          {status === 'pending' && (
            <>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3 transition-all duration-200 hover:border-primary/30">
                <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-small font-medium text-foreground">Verification status</p>
                  <p className="text-micro text-muted-foreground mt-1">
                    Pending — click the link in your email to verify.
                  </p>
                  {email && (
                    <p className="text-micro text-primary mt-2 font-medium truncate" title={email}>
                      {email}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
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
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Sending...
                    </>
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" aria-hidden />
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

          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 transition-colors duration-200 hover:bg-muted/40">
            <p className="text-small font-medium text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary shrink-0" aria-hidden />
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
              className="text-center text-small text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
