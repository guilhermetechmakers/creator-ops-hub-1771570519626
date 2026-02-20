import { supabase } from '@/lib/supabase'

export interface InstagramPublishPayload {
  content_body: string
  thumbnail_url?: string
  hashtags?: string[]
  cta?: string
}

export interface InstagramPublishResult {
  success: boolean
  mediaId?: string
  message?: string
}

export async function publishToInstagram(
  payload: InstagramPublishPayload
): Promise<InstagramPublishResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.access_token) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase.functions.invoke('instagram-publish', {
    body: payload,
    headers: { Authorization: `Bearer ${session.access_token}` },
  })

  if (error) throw new Error(error.message)
  return data as InstagramPublishResult
}

export interface InstagramEngagementOverview {
  posts: Array<{
    id: string
    caption: string
    likes: number
    comments: number
    engagement: number
    permalink?: string
    timestamp?: string
  }>
  totalEngagement: number
  followersCount: number
  overview: {
    impressions: number
    engagement: number
    followers: number
  }
}

export async function fetchInstagramEngagement(): Promise<InstagramEngagementOverview> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.access_token) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase.functions.invoke(
    'instagram-engagement',
    {
      headers: { Authorization: `Bearer ${session.access_token}` },
    }
  )

  if (error) throw new Error(error.message)
  return data as InstagramEngagementOverview
}
