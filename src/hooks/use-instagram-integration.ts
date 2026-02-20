import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''

export interface InstagramIntegrationStatus {
  connected: boolean
  username: string | null
  hasBusinessAccount: boolean
}

export function useInstagramIntegration() {
  const [connected, setConnected] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [hasBusinessAccount, setHasBusinessAccount] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checkingStatus, setCheckingStatus] = useState(true)

  const checkStatus = useCallback(async () => {
    if (!SUPABASE_URL) {
      setConnected(false)
      setCheckingStatus(false)
      setLoading(false)
      return
    }
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setConnected(false)
        setCheckingStatus(false)
        setLoading(false)
        return
      }
      const { data, error } = await supabase.functions.invoke(
        'get-instagram-integration-status',
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      )
      if (error) {
        setConnected(false)
      } else {
        setConnected(data?.connected ?? false)
        setUsername(data?.username ?? null)
        setHasBusinessAccount(data?.hasBusinessAccount ?? false)
      }
    } catch {
      setConnected(false)
    } finally {
      setCheckingStatus(false)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  const connect = useCallback(async () => {
    if (!SUPABASE_URL) {
      toast.error('Supabase is not configured')
      return
    }
    setLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.access_token) {
        toast.error('Please sign in to connect Instagram')
        setLoading(false)
        return
      }
      const { data, error } = await supabase.functions.invoke(
        'instagram-oauth-init',
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      )
      if (error) {
        toast.error(error.message ?? 'Failed to start OAuth')
        setLoading(false)
        return
      }
      if (data?.authUrl) {
        window.location.href = data.authUrl
      } else {
        toast.error('Could not get authorization URL')
        setLoading(false)
      }
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to connect')
      setLoading(false)
    }
  }, [])

  const revoke = useCallback(async () => {
    if (!SUPABASE_URL) return
    setLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.access_token) {
        toast.error('Please sign in')
        setLoading(false)
        return
      }
      const { error } = await supabase.functions.invoke('instagram-revoke', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (error) {
        toast.error(error.message ?? 'Failed to disconnect')
      } else {
        setConnected(false)
        setUsername(null)
        setHasBusinessAccount(false)
        toast.success('Instagram integration disconnected')
      }
    } catch (err) {
      toast.error((err as Error).message ?? 'Failed to disconnect')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    connected,
    username,
    hasBusinessAccount,
    loading,
    checkingStatus,
    connect,
    revoke,
    refetch: checkStatus,
  }
}
