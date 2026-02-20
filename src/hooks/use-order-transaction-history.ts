import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrderTransactionHistory, deleteTransaction } from '@/lib/order-transaction-history-ops'
import { QUERY_KEYS } from '@/lib/cache-config'
import type { OrderTransactionHistoryParams } from '@/types/order-transaction-history'

export function useOrderTransactionHistory(params: OrderTransactionHistoryParams = {}) {
  const queryClient = useQueryClient()
  const queryKey = QUERY_KEYS.orderTransactionHistory(params)

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey,
    queryFn: () => getOrderTransactionHistory(params),
    staleTime: 30 * 1000,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-transaction-history'] })
    },
  })

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? 20,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    isError,
    error: error instanceof Error ? error.message : null,
    refetch,
    isFetching,
    deleteTransaction: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  }
}
