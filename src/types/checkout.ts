export interface CheckoutPayment {
  id: string
  user_id: string
  title: string
  description?: string
  status: string
  created_at: string
  updated_at: string
}

export interface PlanTier {
  id: string
  name: string
  priceMonthly: number
  priceYearly: number
  seats: number
  features: string[]
  popular?: boolean
}

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  status: 'succeeded' | 'pending' | 'failed' | 'refunded'
  invoice_url?: string
}

export interface BillingInfo {
  email: string
  name: string
  address: {
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
}
