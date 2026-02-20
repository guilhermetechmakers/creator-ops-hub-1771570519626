import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''

export function OAuthGoogleCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      setStatus('error')
      toast.error('Invalid OAuth callback - missing code or state')
      navigate('/dashboard/integrations', { replace: true })
      return
    }

    if (!SUPABASE_URL) {
      setStatus('error')
      toast.error('OAuth is not configured')
      navigate('/dashboard/integrations', { replace: true })
      return
    }

    const run = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
          toast.error('Please sign in to complete the connection')
          navigate('/login', { replace: true })
          return
        }

        const { data, error } = await supabase.functions.invoke('google-oauth-callback', {
          body: { code, state },
          headers: { Authorization: `Bearer ${session.access_token}` },
        })

        if (error) {
          setStatus('error')
          toast.error(error.message ?? 'Failed to connect Google')
          navigate('/dashboard/integrations', { replace: true })
          return
        }

        setStatus('success')
        toast.success('Google connected successfully')
        navigate(data?.redirect ?? '/dashboard/integrations', { replace: true })
      } catch (err) {
        setStatus('error')
        toast.error((err as Error).message ?? 'Connection failed')
        navigate('/dashboard/integrations', { replace: true })
      }
    }

    run()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Completing Google connection...</p>
          </>
        )}
        {status === 'error' && (
          <p className="text-destructive">Something went wrong. Redirecting...</p>
        )}
      </div>
    </div>
  )
}
