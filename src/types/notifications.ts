export interface Notification {
  id: string
  user_id: string
  type: string
  channel: string
  title: string
  body: string | null
  metadata: Record<string, unknown>
  read_at: string | null
  delivery_retries: number
  status: string
  created_at: string
  updated_at: string
}

export type NotificationType =
  | 'new_content'
  | 'review_action'
  | 'publish_status'
  | 'failed_publish'
  | 'system_alert'
  | 'comment'
  | 'mention'

export interface NotificationPreferences {
  email_comments?: boolean
  email_mentions?: boolean
  email_publish_status?: boolean
  in_app_comments?: boolean
  in_app_mentions?: boolean
  email_new_content?: boolean
  email_review_actions?: boolean
  email_failed_publish?: boolean
  email_system_alerts?: boolean
  push_enabled?: boolean
}

export interface NotificationsListResponse {
  notifications: Notification[]
  unread_count: number
}
