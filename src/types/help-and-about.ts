export interface HelpAndAbout {
  id: string
  user_id: string
  title: string
  description?: string
  status: string
  created_at: string
  updated_at: string
}

export interface DocItem {
  id: string
  title: string
  category: 'onboarding' | 'api' | 'credits'
  content: string
  slug: string
}

export interface FAQItem {
  id: string
  question: string
  answer: string
}

export interface ChangelogEntry {
  id: string
  version: string
  date: string
  title: string
  items: string[]
  status?: 'released' | 'beta' | 'planned'
}
