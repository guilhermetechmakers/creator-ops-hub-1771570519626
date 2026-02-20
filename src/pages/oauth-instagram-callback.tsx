import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''

export function OAuthInstagramCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (errorParam) {
      setStatus('error')
      toast.error(errorDescription ?? 'Instagram connection failed')
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
      if (!code || !state) {
        setStatus('error')
        toast.error('Invalid OAuth callback - missing authorization')
        navigate('/dashboard/integrations', { replace: true })
        return
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session?.access_token) {
          setStatus('error')
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

        setStatus('success')
        if (data?.hasInstagramAccount) {
          toast.success('Instagram connected successfully')
        } else {
          toast.success(
            'Facebook connected. Link an Instagram Business Account to your Page to publish.'
          )
        }
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
            <p className="text-muted-foreground">
              Completing Instagram connection...
            </p>
          </>
        )}
        {status === 'error' && (
          <p className="text-destructive">Something went wrong. Redirecting...</p>
        )}
      </div>
    </div>
  )
}
