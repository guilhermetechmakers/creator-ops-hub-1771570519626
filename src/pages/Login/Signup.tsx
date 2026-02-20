import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Apple } from 'lucide-react'

export function LoginSignupPage() {
  const [searchParams] = useSearchParams()
  const modeParam = searchParams.get('mode')
  const [mode, setMode] = useState<'login' | 'signup'>(
    modeParam === 'signup' ? 'signup' : 'login'
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (modeParam === 'signup') setMode('signup')
    else if (modeParam === 'login') setMode('login')
  }, [modeParam])

  useEffect(() => {
    document.title = mode === 'login' ? 'Sign In | Creator Ops Hub' : 'Sign Up | Creator Ops Hub'
  }, [mode])

  const handleEmailSubmit = async (data: LoginFormData | SignupFormData) => {
    setIsSubmitting(true)
    try {
      if (mode === 'login') {
        await login(data as LoginFormData)
        toast.success('Welcome back!')
        navigate('/dashboard', { replace: true })
      } else {
        await signup(data as SignupFormData)
        const signupEmail = (data as SignupFormData).email
        try {
          sessionStorage.setItem('verify_email', signupEmail)
        } catch {
          /* ignore */
        }
        toast.success('Account created! Please verify your email.')
        navigate('/verify-email', { replace: true, state: { email: signupEmail } })
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleContinue = async () => {
    setIsSubmitting(true)
    try {
      await signInWithGoogle([
        'email',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/calendar',
      ])
      toast.success('Signed in with Google')
      navigate('/dashboard', { replace: true })
    } catch (err) {
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
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-accent/10 blur-3xl animate-float-subtle" style={{ animationDelay: '-2s' }} />
      </div>

      <Card className="relative w-full max-w-md animate-fade-in shadow-card border-border overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
        <CardHeader className="relative text-center space-y-4">
          <CardTitle className="text-h2 font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Creator Ops Hub
          </CardTitle>
          <CardDescription className="text-body">
            {mode === 'login'
              ? 'Sign in to your account to continue'
              : 'Create your account to get started'}
          </CardDescription>
          <div className="flex justify-center">
            <ToggleLoginSignupSwitch mode={mode} onModeChange={setMode} />
          </div>
        </CardHeader>
        <CardContent className="relative space-y-6">
          <EmailPasswordForm
            mode={mode}
            onSubmit={handleEmailSubmit}
            isSubmitting={isSubmitting}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-micro uppercase tracking-wider text-muted-foreground">
              or continue with
            </div>
          </div>

          <ContinueWithGoogle
            onContinue={handleGoogleContinue}
            disabled={isSubmitting}
          />

          <SocialOAuthButtons buttons={socialButtons} />

          <ForgotPasswordTermsLinks showForgotPassword={mode === 'login'} />

          <SSOEnterpriseCTA onClick={handleSSORequest} />
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginSignupPage
