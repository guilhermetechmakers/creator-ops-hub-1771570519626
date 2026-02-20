import { useState, useEffect, useCallback } from 'react'
import {
  fetchCheckoutItems,
  createCheckoutItem,
  updateCheckoutItem,
  deleteCheckoutItem,
} from '@/lib/checkout-payment-ops'
import type { CheckoutPayment } from '@/types/checkout'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''

export function useCheckoutPayment() {
  const [items, setItems] = useState<CheckoutPayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    if (!SUPABASE_URL) {
      setItems([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchCheckoutItems()
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const create = useCallback(
    async (title: string, description?: string) => {
      const item = await createCheckoutItem(title, description)
      setItems((prev) => [item, ...prev])
      return item
    },
    []
  )

  const update = useCallback(
    async (id: string, updates: { title?: string; description?: string; status?: string }) => {
      const item = await updateCheckoutItem(id, updates)
      setItems((prev) =>
        prev.map((i) => (i.id === id ? item : i))
      )
      return item
    },
    []
  )

  const remove = useCallback(async (id: string) => {
    await deleteCheckoutItem(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  return {
    items,
    isLoading,
    error,
    refetch: fetchItems,
    create,
    update,
    remove,
  }
}
