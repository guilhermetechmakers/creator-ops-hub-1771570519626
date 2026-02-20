export interface InstagramIntegration {
  id: string
  user_id: string
  access_token: string
  refresh_token?: string
  expires_at?: string
  instagram_user_id?: string
  instagram_business_account_id?: string
  facebook_page_id?: string
  instagram_username?: string
  scopes?: string
  created_at: string
  updated_at: string
}

export interface InstagramPostPayload {
  content_body: string
  thumbnail_url?: string
  tags?: string[]
  hashtags?: string[]
  cta?: string
}

export interface InstagramEngagementMetrics {
  impressions: number
  engagement: number
  likes: number
  comments: number
  saved: number
  reach?: number
}
