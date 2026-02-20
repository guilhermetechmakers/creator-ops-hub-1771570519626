export interface SettingsPreferences {
  id: string
  user_id: string
  title: string
  description?: string
  status: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}

export interface WorkspacePlan {
  id: string
  name: string
  seats: number
  used_seats: number
  usage_percent?: number
}

export interface TeamMember {
  id: string
  email: string
  role: string
  avatar_url?: string
}

export interface Session {
  id: string
  device?: string
  location?: string
  last_active: string
  current?: boolean
}

export interface ApiKey {
  id: string
  name: string
  prefix: string
  created_at: string
}
