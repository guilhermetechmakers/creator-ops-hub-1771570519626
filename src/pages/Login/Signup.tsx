import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import {
  ToggleLoginSignupSwitch,
  EmailPasswordForm,
  SocialOAuthButtons,
  ContinueWithGoogle,
  ForgotPasswordTermsLinks,
  SSOEnterpriseCTA,
  type LoginFormData,
  type SignupFormData,
} from '@/components/login-signup'
import { login, signup, signInWithGoogle } from '@/api/auth'
import { Apple, Mail } from 'lucide-react'

export function LoginSignupPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const modeParam = searchParams.get('mode')
  const invitationParam = searchParams.get('invitation') ?? searchParams.get('invite')
  const [mode, setMode] = useState<'login' | 'signup'>(
    modeParam === 'signup' ? 'signup' : 'login'
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (modeParam === 'signup') setMode('signup')
    else if (modeParam === 'login') setMode('login')
  }, [modeParam])

  const handleModeChange = (newMode: 'login' | 'signup') => {
    setMode(newMode)
    const next = new URLSearchParams(searchParams)
    next.set('mode', newMode)
    setSearchParams(next, { replace: true })
  }

  useEffect(() => {
    document.title = mode === 'login' ? 'Sign In | Creator Ops Hub' : 'Sign Up | Creator Ops Hub'
    const metaDesc = document.querySelector('meta[name="description"]')
    const content =
      mode === 'login'
        ? 'Sign in to Creator Ops Hub to manage your content workflow, assets, and publishing.'
        : 'Create your Creator Ops Hub account to streamline content creation and multi-platform publishing.'
    if (metaDesc) {
      metaDesc.setAttribute('content', content)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = content
      document.head.appendChild(meta)
    }
  }, [mode])

  const getPostLoginRedirect = () => {
    const redirect = searchParams.get('redirect')
    if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
      return redirect
    }
    return '/dashboard'
  }

  const handleEmailSubmit = async (data: LoginFormData | SignupFormData) => {
    setIsSubmitting(true)
    try {
      if (mode === 'login') {
        await toast.promise(login(data as LoginFormData), {
          loading: 'Signing in...',
          success: 'Welcome back!',
          error: (err) => (err instanceof Error ? err.message : 'Something went wrong'),
        })
        navigate(getPostLoginRedirect(), { replace: true })
      } else {
        await toast.promise(signup(data as SignupFormData), {
          loading: 'Creating account...',
          success: 'Account created! Please verify your email.',
          error: (err) => (err instanceof Error ? err.message : 'Something went wrong'),
        })
        const signupEmail = (data as SignupFormData).email
        try {
          sessionStorage.setItem('verify_email', signupEmail)
        } catch {
          /* ignore */
        }
        navigate('/verify-email', { replace: true, state: { email: signupEmail } })
      }
    } catch {
      /* Error handled by toast.promise */
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleContinue = async () => {
    const redirectTo = getPostLoginRedirect()
    try {
      sessionStorage.setItem('auth_redirect_after_login', redirectTo)
    } catch {
      /* ignore */
    }
    setIsSubmitting(true)
    const loadingToastId = toast.loading('Connecting with Google...', {
      description: 'You may be redirected to sign in',
    })
    try {
      await signInWithGoogle([
        'email',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/calendar',
      ])
      toast.dismiss(loadingToastId)
      toast.success('Signed in with Google')
      navigate(redirectTo, { replace: true })
    } catch (err) {
      toast.dismiss(loadingToastId)
      toast.error(err instanceof Error ? err.message : 'Google sign-in failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAppleContinue = async () => {
    toast.info('Apple Sign-In coming soon')
  }

  const handleSSORequest = () => {
    toast.info('Contact your administrator for SSO access')
  }

  const socialButtons = [
    {
      id: 'apple',
      label: 'Apple',
      icon: Apple,
      onClick: handleAppleContinue,
      disabled: isSubmitting,
    },
  ]

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden" aria-label={mode === 'login' ? 'Sign in to your account' : 'Create your account'}>
      <Link
        to="/"
        className="absolute top-4 left-4 z-10 flex items-center gap-2 text-small text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg px-3 py-2.5 min-h-[44px]"
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
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-accent/10 blur-3xl animate-float-subtle" style={{ animationDelay: '-2s' }} />
      </div>

      <Card className="relative w-full max-w-md animate-fade-in shadow-card border-2 border-primary/10 overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:shadow-lg hover:border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
        <CardHeader className="relative text-center space-y-4">
          <h1 className="text-h2 font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Creator Ops Hub
          </h1>
          <CardDescription className="text-body">
            {mode === 'login'
              ? 'Sign in to your account to continue'
              : 'Create your account to get started'}
          </CardDescription>
          <div className="flex justify-center">
            <ToggleLoginSignupSwitch mode={mode} onModeChange={handleModeChange} />
          </div>
          {invitationParam && (
            <div
              className="rounded-lg border border-primary/20 bg-primary/5 p-4 animate-fade-in flex items-start gap-3"
              role="status"
              aria-live="polite"
            >
              <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
              <div>
                <p className="text-small font-medium text-foreground">
                  You&apos;ve been invited to join Creator Ops Hub
                </p>
                <p className="text-micro text-muted-foreground mt-1">
                  Sign up or log in to accept your invitation and get started.
                </p>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="relative space-y-6">
          <div className="animate-slide-up" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
            <EmailPasswordForm
              mode={mode}
              onSubmit={handleEmailSubmit}
              isSubmitting={isSubmitting}
            />
          </div>

          <div className="relative animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-micro uppercase tracking-wider text-muted-foreground" role="separator" aria-label="Or continue with social sign-in">
              or continue with
            </div>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
            <ContinueWithGoogle
              onContinue={handleGoogleContinue}
              disabled={isSubmitting}
            />
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            <SocialOAuthButtons buttons={socialButtons} />
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '250ms', animationFillMode: 'both' }}>
            <ForgotPasswordTermsLinks showForgotPassword={mode === 'login'} />
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
            <SSOEnterpriseCTA onClick={handleSSORequest} />
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

export default LoginSignupPage
