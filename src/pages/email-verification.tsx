import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Mail, ArrowLeft } from 'lucide-react'
import {
  StatusMessage,
  ResendButton,
  TimerOrRateLimitNotice,
  CTAGoToDashboard,
  SecurityGuidance,
  type VerificationStatus,
} from '@/components/email-verification'
import { resendVerificationEmail } from '@/lib/email-verification-ops'
import { supabase } from '@/lib/supabase'

const RESEND_COOLDOWN_SEC = 60

const SUPABASE_CONFIGURED =
  typeof import.meta.env.VITE_SUPABASE_URL === 'string' &&
  import.meta.env.VITE_SUPABASE_URL.length > 0 &&
  typeof import.meta.env.VITE_SUPABASE_ANON_KEY === 'string' &&
  import.meta.env.VITE_SUPABASE_ANON_KEY.length > 0

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
    const metaDesc = document.querySelector('meta[name="description"]')
    const content =
      'Verify your Creator Ops Hub email address. Check your inbox for the verification link or resend if needed.'
    if (metaDesc) {
      metaDesc.setAttribute('content', content)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = content
      document.head.appendChild(meta)
    }
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
      const {
        data: { session },
      } = await supabase.auth.getSession()
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

  const statusDescription =
    status === 'checking'
      ? 'Checking verification status...'
      : status === 'verified'
        ? 'Your email has been verified.'
        : "We've sent a verification link to your email. Click the link to activate your account."

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <Link
        to="/"
        className="absolute top-4 left-4 z-10 flex items-center gap-2 text-small text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg px-3 py-2 min-h-[44px]"
        aria-label="Back to home"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
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

      <Card className="relative w-full max-w-md animate-fade-in shadow-card border-2 border-primary/10 overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:shadow-lg hover:border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
        <CardHeader className="relative text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 text-primary shadow-sm">
            <Mail className="h-7 w-7" aria-hidden />
          </div>
          <CardTitle className="text-h2 font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Verify your email
          </CardTitle>
          <CardDescription className="text-body">
            {statusDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-6">
          <StatusMessage status={status} email={email} />

          {status === 'pending' && (
            <>
              <TimerOrRateLimitNotice
                cooldownSeconds={resendCooldown}
                isResending={isResending}
              />
              <ResendButton
                onClick={handleResend}
                isResending={isResending}
                cooldownSeconds={resendCooldown}
              />
              <Button
                variant="outline"
                className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                onClick={checkVerificationStatus}
              >
                I&apos;ve verified — check again
              </Button>
            </>
          )}

          <SecurityGuidance />

          <CTAGoToDashboard />
        </CardContent>
      </Card>
    </div>
  )
}

export default EmailVerificationPage
