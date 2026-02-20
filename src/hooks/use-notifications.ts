import { useState, useEffect, useCallback } from 'react'
import {
  fetchNotifications,
  markNotificationsRead,
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from '@/lib/notification-ops'
import type { Notification, NotificationPreferences } from '@/types/notifications'

export function useNotifications(params?: { limit?: number; unreadOnly?: boolean }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetchNotifications({
        limit: params?.limit ?? 20,
        unread_only: params?.unreadOnly ?? false,
      })
      setNotifications(res.notifications)
      setUnreadCount(res.unread_count)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load notifications'))
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [params?.limit, params?.unreadOnly])

  useEffect(() => {
    load()
  }, [load])

  const markRead = useCallback(async (ids?: string[], all?: boolean) => {
    try {
      await markNotificationsRead(ids ? { ids } : all ? { all: true } : {})
      await load()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark as read'))
    }
  }, [load])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch: load,
    markRead,
  }
}

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const prefs = await fetchNotificationPreferences()
      setPreferences(prefs)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load preferences'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const update = useCallback(async (prefs: NotificationPreferences) => {
    setIsSaving(true)
    setError(null)
    try {
      const updated = await updateNotificationPreferences(prefs)
      setPreferences(updated)
      return updated
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update preferences'))
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [])

  return {
    preferences,
    isLoading,
    isSaving,
    error,
    refetch: load,
    update,
  }
}
