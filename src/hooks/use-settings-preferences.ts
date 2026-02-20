import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getStripeSubscription } from '@/lib/stripe-ops'
import type {
  UserProfile,
  WorkspacePlan,
  TeamMember,
  Session,
  ApiKey,
} from '@/types/settings-preferences'

export interface AccountFormData {
  name: string
  email: string
}

export interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''

const DEFAULT_PLAN: WorkspacePlan = {
  id: 'free',
  name: 'Free',
  seats: 3,
  used_seats: 1,
  usage_percent: 33,
}

export function useSettingsPreferences() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [plan, setPlan] = useState<WorkspacePlan | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [twoFactorEnabled] = useState(false)
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false)

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

  const fetchPlan = useCallback(async () => {
    if (!SUPABASE_URL) return DEFAULT_PLAN
    try {
      const result = await getStripeSubscription()
      setHasPremiumAccess(result.hasPremiumAccess)
      return {
        id: result.plan.id,
        name: result.plan.name,
        seats: result.plan.seats,
        used_seats: result.plan.used_seats,
        usage_percent: result.plan.usage_percent,
        current_period_end: result.plan.current_period_end,
        cancel_at_period_end: result.plan.cancel_at_period_end,
      }
    } catch {
      return DEFAULT_PLAN
    }
  }, [])

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    try {
      await fetchProfile()
      const planData = await fetchPlan()
      setPlan(planData)
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
      setPlan(DEFAULT_PLAN)
    } finally {
      setIsLoading(false)
    }
  }, [fetchProfile, fetchPlan])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const onSaveAccount = useCallback(async (data: AccountFormData) => {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: data.name },
    })
    if (error) throw error
    await fetchProfile()
  }, [fetchProfile])

  const onChangePassword = useCallback(async (data: PasswordFormData) => {
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword,
    })
    if (error) throw error
  }, [])

  return {
    profile,
    plan,
    members,
    sessions,
    apiKeys,
    isLoading,
    twoFactorEnabled,
    hasPremiumAccess,
    refetch: fetchAll,
    onSaveAccount,
    onChangePassword,
  }
}
