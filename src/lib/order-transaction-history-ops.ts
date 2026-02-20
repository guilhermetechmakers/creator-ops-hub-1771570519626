import { supabase } from '@/lib/supabase'
import type {
  OrderTransactionHistoryResult,
  OrderTransactionHistoryParams,
} from '@/types/order-transaction-history'

async function invokeEdgeFunction<T>(
  name: string,
  body: Record<string, unknown>
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.access_token) {
    throw new Error('Not authenticated')
  }
  const { data, error } = await supabase.functions.invoke(name, {
    body,
    headers: { Authorization: `Bearer ${session.access_token}` },
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error as string)
  return data as T
}

async function invokeOrderTransactionHistory<T>(
  body: OrderTransactionHistoryParams
): Promise<T> {
  return invokeEdgeFunction<T>('order-transaction-history', body as Record<string, unknown>)
}

export async function getOrderTransactionHistory(
  params: OrderTransactionHistoryParams = {}
): Promise<OrderTransactionHistoryResult> {
  return invokeOrderTransactionHistory<OrderTransactionHistoryResult>({
    page: 1,
    limit: 20,
    sortBy: 'created_at',
    sortOrder: 'desc',
    ...params,
  })
}

export async function deleteTransaction(id: string): Promise<void> {
  await invokeEdgeFunction<{ success: boolean }>('checkout-payment', {
    action: 'delete',
    id,
  })
}
