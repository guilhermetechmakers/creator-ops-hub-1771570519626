import { supabase } from '@/lib/supabase'
import type { NotificationPreferences, NotificationsListResponse } from '@/types/notifications'

export async function fetchNotifications(params?: {
  limit?: number
  offset?: number
  unread_only?: boolean
  type?: string
}): Promise<NotificationsListResponse> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    return { notifications: [], unread_count: 0 }
  }

  const { data, error } = await supabase.functions.invoke<NotificationsListResponse>('notifications', {
    method: 'POST',
    body: {
      action: 'list',
      limit: params?.limit ?? 20,
      offset: params?.offset ?? 0,
      unread_only: params?.unread_only ?? false,
      type: params?.type,
    },
    headers: { Authorization: `Bearer ${session.access_token}` },
  })

  if (error) throw error
  return data ?? { notifications: [], unread_count: 0 }
}

export async function markNotificationsRead(params: { ids?: string[]; all?: boolean }): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return

  const { error } = await supabase.functions.invoke('notifications', {
    method: 'POST',
    body: { action: 'mark-read', ...params },
    headers: { Authorization: `Bearer ${session.access_token}` },
  })

  if (error) throw error
}

export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    return {}
  }

  const { data, error } = await supabase.functions.invoke<{ preferences: NotificationPreferences }>('notifications', {
    method: 'POST',
    body: { action: 'get-preferences' },
    headers: { Authorization: `Bearer ${session.access_token}` },
  })

  if (error) throw error
  return data?.preferences ?? {}
}

export async function updateNotificationPreferences(prefs: NotificationPreferences): Promise<NotificationPreferences> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Not authenticated')

  const { data, error } = await supabase.functions.invoke<{ preferences: NotificationPreferences }>('notifications', {
    method: 'POST',
    body: { action: 'preferences', ...prefs },
    headers: { Authorization: `Bearer ${session.access_token}` },
  })

  if (error) throw error
  return data?.preferences ?? prefs
}
