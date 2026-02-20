import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type {
  UserProfile,
  WorkspacePlan,
  TeamMember,
  Session,
  ApiKey,
} from '@/types/settings-preferences'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''

export function useSettingsPreferences() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [plan, setPlan] = useState<WorkspacePlan | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [twoFactorEnabled] = useState(false)

  const fetchProfile = useCallback(async () => {
    if (!SUPABASE_URL) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setProfile({
          id: user.id,
          email: user.email ?? '',
          full_name: user.user_metadata?.full_name,
          avatar_url: user.user_metadata?.avatar_url,
        })
      }
    } catch {
      // Silent fail
    }
  }, [])

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    try {
      await fetchProfile()
      // Mock/placeholder data - replace with actual Supabase queries when tables exist
      setPlan({
        id: '1',
        name: 'Free',
        seats: 3,
        used_seats: 1,
        usage_percent: 33,
      })
      setMembers([])
      setSessions([
        {
          id: '1',
          device: 'Chrome on Linux',
          location: 'Current',
          last_active: 'Just now',
          current: true,
        },
      ])
      setApiKeys([])
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false)
    }
  }, [fetchProfile])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return {
    profile,
    plan,
    members,
    sessions,
    apiKeys,
    isLoading,
    twoFactorEnabled,
    refetch: fetchAll,
  }
}
