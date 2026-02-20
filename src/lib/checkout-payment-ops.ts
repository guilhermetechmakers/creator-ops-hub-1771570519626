import { supabase } from '@/lib/supabase'
import type { CheckoutPayment } from '@/types/checkout'

async function invokeAction<T>(
  action: string,
  body: Record<string, unknown> = {}
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    throw new Error('Not authenticated')
  }
  const { data, error } = await supabase.functions.invoke('checkout-payment', {
    body: { action, ...body },
    headers: { Authorization: `Bearer ${session.access_token}` },
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data as T
}

export async function fetchCheckoutItems(): Promise<CheckoutPayment[]> {
  const result = await invokeAction<{ items: CheckoutPayment[] }>('list')
  return result?.items ?? []
}

export async function createCheckoutItem(
  title: string,
  description?: string
): Promise<CheckoutPayment> {
  const result = await invokeAction<{ item: CheckoutPayment }>('create', {
    title,
    description,
  })
  if (!result?.item) throw new Error('Failed to create')
  return result.item
}

export async function updateCheckoutItem(
  id: string,
  updates: { title?: string; description?: string; status?: string }
): Promise<CheckoutPayment> {
  const result = await invokeAction<{ item: CheckoutPayment }>('update', {
    id,
    ...updates,
  })
  if (!result?.item) throw new Error('Failed to update')
  return result.item
}

export async function deleteCheckoutItem(id: string): Promise<void> {
  await invokeAction<{ success: boolean }>('delete', { id })
}
