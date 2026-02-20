import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''
const SUCCESS_TOAST_DURATION_MS = 1500

export function OAuthInstagramCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (errorParam) {
      setStatus('error')
      setErrorMessage(errorDescription ?? 'Instagram connection failed')
      toast.error(errorDescription ?? 'Instagram connection failed')
      return
    }

    if (!SUPABASE_URL) {
      setStatus('error')
      setErrorMessage('OAuth is not configured')
      toast.error('OAuth is not configured')
      return
    }

    const run = async () => {
      const loadingToastId = toast.loading('Connecting your Instagram account...', {
        id: 'instagram-oauth-loading',
      })

      if (!code || !state) {
        toast.dismiss(loadingToastId)
        setStatus('error')
        setErrorMessage('Invalid OAuth callback - missing authorization')
        toast.error('Invalid OAuth callback - missing authorization')
        return
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session?.access_token) {
          toast.dismiss(loadingToastId)
          setStatus('error')
          setErrorMessage('Please sign in to connect Instagram')
          toast.error('Please sign in to connect Instagram')
          navigate('/login-/-signup', { replace: true })
          return
        }

        const { data, error } = await supabase.functions.invoke(
          'instagram-oauth-callback',
          {
            body: { code, state },
            headers: { Authorization: `Bearer ${session.access_token}` },
          }
        )

        if (error) throw new Error(error.message)

        toast.dismiss(loadingToastId)
        setStatus('success')

        const successMessage = data?.hasInstagramAccount
          ? 'Instagram connected successfully'
          : 'Facebook connected. Link an Instagram Business Account to your Page to publish.'

        toast.success(successMessage, {
          duration: 4000,
          description: 'You will be redirected shortly.',
        })

        setTimeout(() => {
          navigate(data?.redirect ?? '/dashboard/integrations', { replace: true })
        }, SUCCESS_TOAST_DURATION_MS)
      } catch (err) {
        toast.dismiss(loadingToastId)
        setStatus('error')
        const msg = (err as Error).message ?? 'Connection failed'
        setErrorMessage(msg)
        toast.error(msg)
      }
    }

    run()
  }, [searchParams, navigate])

  const handleGoToIntegrations = () => {
    navigate('/dashboard/integrations', { replace: true })
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6"
      role="main"
      aria-label="Instagram OAuth callback"
    >
      <div className="w-full max-w-md">
        {status === 'loading' && (
          <Card
            className="animate-fade-in"
            role="status"
            aria-live="polite"
            aria-label="Completing Instagram connection"
          >
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Loader2
                  className="h-10 w-10 animate-spin text-primary shrink-0"
                  aria-hidden="true"
                />
                <Skeleton className="h-6 w-32" shimmer />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" shimmer />
                <Skeleton className="h-4 w-3/4" shimmer />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" shimmer />
                <Skeleton className="h-3 w-5/6" shimmer />
                <Skeleton className="h-3 w-4/5" shimmer />
              </div>
              <p
                className="text-small text-muted-foreground text-center"
                aria-live="polite"
              >
                Completing Instagram connection...
              </p>
            </CardContent>
          </Card>
        )}

        {status === 'success' && (
          <Card
            className="animate-fade-in"
            role="status"
            aria-live="polite"
            aria-label="Instagram connected successfully"
          >
            <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
              <Loader2
                className="h-10 w-10 animate-spin text-primary"
                aria-hidden="true"
              />
              <p className="text-small text-muted-foreground text-center">
                Redirecting to integrations...
              </p>
            </CardContent>
          </Card>
        )}

        {status === 'error' && (
          <ErrorState
            title="Connection failed"
            description={errorMessage}
            retryLabel="Go to integrations"
            buttonAriaLabel="Go to integrations page"
            onRetry={handleGoToIntegrations}
            className="animate-fade-in"
          />
        )}
      </div>
    </main>
  )
}
