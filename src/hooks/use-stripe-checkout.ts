import { useState, useEffect, useCallback } from 'react'
import { getStripeSubscription } from '@/lib/stripe-ops'
import type { PlanTier } from '@/types/checkout'

const DEFAULT_TIERS: PlanTier[] = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    seats: 3,
    features: ['3 team seats', 'Basic analytics', '1 social account', 'Community support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 29,
    priceYearly: 290,
    seats: 10,
    features: ['10 team seats', 'Advanced analytics', '5 social accounts', 'Priority support', 'Content calendar', 'AI writing assistant'],
    popular: true,
  },
  {
    id: 'team',
    name: 'Team',
    priceMonthly: 79,
    priceYearly: 790,
    seats: 25,
    features: ['25 team seats', 'Full analytics suite', 'Unlimited accounts', 'Dedicated support', 'Custom branding', 'API access', 'Advanced workflows'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 199,
    priceYearly: 1990,
    seats: 100,
    features: ['100+ seats', 'Enterprise analytics', 'SSO & SAML', 'Custom integrations', 'SLA guarantee', 'Onboarding & training'],
  },
]

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  status: 'succeeded' | 'pending' | 'failed' | 'refunded'
  invoice_url?: string
}

export function useStripeCheckout() {
  const [currentPlanId, setCurrentPlanId] = useState('free')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscription = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getStripeSubscription()
      setCurrentPlanId(result.plan.id)
      setTransactions(
        result.transactions.map((t) => ({
          id: t.id,
          date: t.date,
          description: t.description,
          amount: t.amount,
          status: t.status as Transaction['status'],
          invoice_url: t.invoice_url,
        }))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription')
      setCurrentPlanId('free')
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  return {
    tiers: DEFAULT_TIERS,
    currentPlanId,
    transactions,
    isLoading,
    error,
    refetch: fetchSubscription,
  }
}
