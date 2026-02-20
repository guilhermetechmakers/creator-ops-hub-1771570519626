import { supabase } from '@/lib/supabase'

async function invokeStripe<T>(
  functionName: string,
  body: Record<string, unknown> = {}
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.access_token) {
    throw new Error('Not authenticated')
  }
  const { data, error } = await supabase.functions.invoke(functionName, {
    body,
    headers: { Authorization: `Bearer ${session.access_token}` },
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error as string)
  return data as T
}

export interface CreateCheckoutResult {
  url: string
  sessionId: string
}

export async function createStripeCheckout(
  planId: string,
  billingCycle: 'monthly' | 'yearly',
  successUrl?: string,
  cancelUrl?: string
): Promise<CreateCheckoutResult> {
  const result = await invokeStripe<CreateCheckoutResult>('stripe-create-checkout', {
    planId,
    billingCycle,
    successUrl,
    cancelUrl,
  })
  if (!result?.url) throw new Error('Failed to create checkout session')
  return result
}

export interface CustomerPortalResult {
  url: string
}

export async function createStripeCustomerPortal(
  returnUrl?: string
): Promise<CustomerPortalResult> {
  const result = await invokeStripe<CustomerPortalResult>('stripe-customer-portal', {
    returnUrl,
  })
  if (!result?.url) throw new Error('Failed to create portal session')
  return result
}

export interface SubscriptionPlan {
  id: string
  name: string
  seats: number
  used_seats: number
  usage_percent: number
  status?: string
  current_period_end?: string
  cancel_at_period_end?: boolean
}

export interface SubscriptionResult {
  plan: SubscriptionPlan
  hasPremiumAccess: boolean
  transactions: Array<{
    id: string
    date: string
    description: string
    amount: number
    status: string
    invoice_url?: string
  }>
}

export async function getStripeSubscription(): Promise<SubscriptionResult> {
  const result = await invokeStripe<SubscriptionResult>('stripe-subscription', {
    action: 'get',
  })
  if (!result?.plan) {
    return {
      plan: {
        id: 'free',
        name: 'Free',
        seats: 3,
        used_seats: 1,
        usage_percent: 33,
      },
      hasPremiumAccess: false,
      transactions: [],
    }
  }
  return result
}
