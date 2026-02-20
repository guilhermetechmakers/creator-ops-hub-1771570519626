export interface OrderTransaction {
  id: string
  user_id: string
  title: string
  description: string | null
  status: 'succeeded' | 'pending' | 'failed' | 'refunded'
  created_at: string
  updated_at: string
  amount: number
  amount_cents: number
  invoice_url?: string
}

export interface OrderTransactionHistoryResult {
  items: OrderTransaction[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface OrderTransactionHistoryParams {
  page?: number
  limit?: number
  sortBy?: 'created_at' | 'amount_cents' | 'status' | 'title'
  sortOrder?: 'asc' | 'desc'
  status?: string
}
