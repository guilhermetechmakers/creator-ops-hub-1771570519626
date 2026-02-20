export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}

export interface NotificationPreferences {
  email_comments: boolean
  email_mentions: boolean
  email_publish_status: boolean
  in_app_comments: boolean
  in_app_mentions: boolean
}

export interface TeamMember {
  id: string
  email: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  status: 'active' | 'pending'
  joined_at: string
}

export interface BillingPlan {
  id: string
  name: string
  seats: number
  price: number
  interval: 'month' | 'year'
}
