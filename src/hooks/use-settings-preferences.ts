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

export interface NotificationPreferences {
  emailDigest: boolean
  inAppNotifications: boolean
  marketingEmails: boolean
}

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
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    emailDigest: true,
    inAppNotifications: true,
    marketingEmails: false,
  })
  const [dataRetentionDays, setDataRetentionDays] = useState('90')
  const [researchSnapshotRetentionDays, setResearchSnapshotRetentionDays] = useState('30')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
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

  const fetchNotificationPrefs = useCallback(async () => {
    if (!SUPABASE_URL) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('user_preferences')
        .select('email_comments, in_app_comments')
        .eq('user_id', user.id)
        .single()
      if (data) {
        setNotificationPrefs({
          emailDigest: data.email_comments ?? true,
          inAppNotifications: data.in_app_comments ?? true,
          marketingEmails: false,
        })
      }
    } catch {
      // Use defaults
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
    setHasError(false)
    try {
      const [, planData] = await Promise.all([
        fetchProfile(),
        fetchPlan(),
      ])
      await fetchNotificationPrefs()
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
    } catch (err) {
      setHasError(true)
      setPlan(DEFAULT_PLAN)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [fetchProfile, fetchPlan, fetchNotificationPrefs])

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

  const onInvite = useCallback(async (email: string, role: string) => {
    void email
    void role
    throw new Error('Team invitations require workspace setup. Contact your administrator.')
  }, [])

  const onRemoveMember = useCallback(async (id: string) => {
    void id
    throw new Error('Member removal requires workspace setup. Contact your administrator.')
  }, [])

  const onUpdateRole = useCallback(async (id: string, role: string) => {
    void id
    void role
    throw new Error('Role updates require workspace setup. Contact your administrator.')
  }, [])

  const onToggle2FA = useCallback(async (enabled: boolean) => {
    void enabled
    // 2FA setup requires Supabase MFA flow
    throw new Error('Two-factor authentication setup is coming soon.')
  }, [])

  const onRevokeSession = useCallback(async (id: string) => {
    // Session revocation would use Supabase auth admin or Edge Function
    throw new Error(`Session revocation not yet implemented. Session ID: ${id}`)
  }, [])

  const onCreateApiKey = useCallback(async (name: string) => {
    void name
    throw new Error('API key creation requires backend setup. Contact your administrator.')
  }, [])

  const onRevokeApiKey = useCallback(async (id: string) => {
    void id
    throw new Error('API key revocation requires backend setup. Contact your administrator.')
  }, [])

  const onUpdatePreferences = useCallback(async (prefs: NotificationPreferences) => {
    if (!SUPABASE_URL) throw new Error('Not configured')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase.from('user_preferences').upsert(
      {
        user_id: user.id,
        email_comments: prefs.emailDigest,
        email_mentions: prefs.emailDigest,
        in_app_comments: prefs.inAppNotifications,
        in_app_mentions: prefs.inAppNotifications,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    if (error) throw error
  }, [])

  const onAddWebhook = useCallback(async (url: string) => {
    void url
    throw new Error('Webhook endpoints require backend setup. Contact your administrator.')
  }, [])

  const onRemoveWebhook = useCallback(async (id: string) => {
    void id
    throw new Error('Webhook removal requires backend setup. Contact your administrator.')
  }, [])

  const onUpdateDataRetention = useCallback(async (days: string) => {
    setDataRetentionDays(days)
    // TODO: Persist to backend when settings_preferences or user_preferences supports it
  }, [])

  const onUpdateSnapshotRetention = useCallback(async (days: string) => {
    setResearchSnapshotRetentionDays(days)
    // TODO: Persist to backend when settings_preferences or user_preferences supports it
  }, [])

  return {
    profile,
    plan,
    members,
    sessions,
    apiKeys,
    isLoading,
    hasError,
    twoFactorEnabled,
    hasPremiumAccess,
    refetch: fetchAll,
    onSaveAccount,
    onChangePassword,
    onInvite,
    onRemoveMember,
    onUpdateRole,
    onToggle2FA,
    onRevokeSession,
    onCreateApiKey,
    onRevokeApiKey,
    onUpdatePreferences,
    onAddWebhook,
    onRemoveWebhook,
    onUpdateDataRetention,
    onUpdateSnapshotRetention,
    notificationPrefs,
    dataRetentionDays,
    researchSnapshotRetentionDays,
  }
}
