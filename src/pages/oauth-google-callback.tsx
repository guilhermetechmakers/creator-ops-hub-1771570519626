import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { ErrorState } from '@/components/ui/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''
const SUCCESS_REDIRECT_DELAY_MS = 800

export function OAuthGoogleCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const handleRetry = useCallback(() => {
    setStatus('loading')
    setErrorMessage('')
    navigate('/login-/-signup', { replace: true })
  }, [navigate])

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const errorParam = searchParams.get('error')
    const hasHash = typeof window !== 'undefined' && window.location.hash?.length > 0

    if (errorParam) {
      const msg = searchParams.get('error_description') ?? 'OAuth authorization was denied or failed.'
      setErrorMessage(msg)
      setStatus('error')
      toast.error(msg)
      return
    }

    if (!SUPABASE_URL) {
      const msg = 'OAuth is not configured. Please contact support.'
      setErrorMessage(msg)
      setStatus('error')
      toast.error(msg)
      return
    }

    const run = async () => {
      try {
        const getRedirect = () => {
          try {
            const stored = sessionStorage.getItem('auth_redirect_after_login')
            if (stored && stored.startsWith('/') && !stored.startsWith('//')) return stored
            sessionStorage.removeItem('auth_redirect_after_login')
          } catch {
            /* ignore */
          }
          return '/dashboard'
        }

        // Handle hash-based redirect (implicit flow) - Supabase client parses hash on load
        if (hasHash && !code) {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.access_token) {
            localStorage.setItem('access_token', session.access_token)
            if (session.refresh_token) {
              localStorage.setItem('refresh_token', session.refresh_token)
            }
            setStatus('success')
            toast.success('Signed in with Google')
            setTimeout(() => navigate(getRedirect(), { replace: true }), SUCCESS_REDIRECT_DELAY_MS)
            return
          }
        }

        // Handle PKCE flow with code in query
        if (!code) {
          const msg = 'Invalid OAuth callback - missing authorization code.'
          setErrorMessage(msg)
          setStatus('error')
          toast.error(msg)
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token && state) {
          const { data, error } = await supabase.functions.invoke('google-oauth-callback', {
            body: { code, state },
            headers: { Authorization: `Bearer ${session.access_token}` },
          })
          if (error) throw new Error(error.message)
          setStatus('success')
          toast.success('Google connected successfully')
          setTimeout(
            () => navigate(data?.redirect ?? '/dashboard/integrations', { replace: true }),
            SUCCESS_REDIRECT_DELAY_MS
          )
          return
        }

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) throw new Error(error.message)
        if (data.session) {
          localStorage.setItem('access_token', data.session.access_token)
          if (data.session.refresh_token) {
            localStorage.setItem('refresh_token', data.session.refresh_token)
          }
        }
        setStatus('success')
        toast.success('Signed in with Google')
        setTimeout(() => navigate(getRedirect(), { replace: true }), SUCCESS_REDIRECT_DELAY_MS)
      } catch (err) {
        const msg = (err as Error).message ?? 'Connection failed. Please try again.'
        setErrorMessage(msg)
        setStatus('error')
        toast.error(msg)
      }
    }

    run()
  }, [searchParams, navigate])

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6"
      role="main"
      aria-label="Google OAuth callback"
    >
      <div className="w-full max-w-md">
        {status === 'loading' && (
          <Card
            className="overflow-hidden border-2 border-primary/10 shadow-card animate-fade-in transition-all duration-300"
            aria-live="polite"
            aria-busy="true"
            aria-label="Completing Google sign-in"
          >
            <CardHeader className="space-y-4 pb-4">
              <div className="flex items-center justify-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"
                  aria-hidden
                >
                  <Loader2
                    className="h-6 w-6 animate-spin text-primary"
                    aria-hidden
                  />
                </div>
                <Skeleton className="h-6 w-32" shimmer />
              </div>
              <Skeleton className="h-4 w-full" shimmer />
              <Skeleton className="h-4 w-3/4 mx-auto" shimmer />
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" shimmer />
                <Skeleton className="h-3 w-5/6" shimmer />
                <Skeleton className="h-3 w-4/5" shimmer />
              </div>
              <div className="flex justify-center pt-2">
                <p
                  className="text-small text-muted-foreground"
                  role="status"
                  aria-live="polite"
                >
                  Completing Google connection...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {status === 'success' && (
          <Card
            className="overflow-hidden border-2 border-primary/20 shadow-card animate-fade-in"
            aria-live="polite"
            aria-label="Sign-in successful"
          >
            <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
              <Loader2
                className="h-12 w-12 animate-spin text-primary"
                aria-hidden
              />
              <p
                className="text-body font-medium text-foreground"
                role="status"
              >
                Sign-in successful. Redirecting...
              </p>
            </CardContent>
          </Card>
        )}

        {status === 'error' && (
          <div
            className={cn('animate-fade-in')}
            role="alert"
            aria-live="assertive"
          >
            <ErrorState
              title="Google sign-in failed"
              description={errorMessage}
              onRetry={handleRetry}
              retryLabel="Try again"
              buttonAriaLabel="Retry Google sign-in by returning to login page"
            />
          </div>
        )}
      </div>
    </div>
  )
}
