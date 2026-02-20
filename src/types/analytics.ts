export interface AnalyticsOverview {
  impressions: number
  engagement: number
  topPostsCount: number
  followerGrowth: number
}

export interface AnalyticsChartPoint {
  name: string
  date: string
  impressions: number
  engagement: number
  followers: number
}

export interface TopPost {
  id: string
  title: string
  channel: string
  impressions: number
  engagement: number
  engagementRate: number
}

export interface AnalyticsData {
  overview: AnalyticsOverview
  chartData: AnalyticsChartPoint[]
  topPosts: TopPost[]
}

export interface AnalyticsFilters {
  dateFrom?: string
  dateTo?: string
  channel?: string
}

export const CHANNEL_OPTIONS = [
  { value: 'all', label: 'All channels' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'x', label: 'X (Twitter)' },
] as const
