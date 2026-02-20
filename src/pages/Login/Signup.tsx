import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
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

  const handleEmailSubmit = async (data: LoginFormData | SignupFormData) => {
    setIsSubmitting(true)
    try {
      if (mode === 'login') {
        await login(data as LoginFormData)
        toast.success('Welcome back!')
        navigate('/dashboard', { replace: true })
      } else {
        await signup(data as SignupFormData)
        toast.success('Account created! Please verify your email.')
        navigate('/verify-email', { replace: true })
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      </div>

      <Card className="relative w-full max-w-md animate-fade-in shadow-card border-border overflow-hidden">
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
