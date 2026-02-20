import { useMemo } from 'react'
import { getStripeSubscription } from '@/lib/stripe-ops'
import { useQuery } from '@tanstack/react-query'

const PREMIUM_FEATURE_QUERY_KEY = ['premium-access']

export function usePremiumAccess() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: PREMIUM_FEATURE_QUERY_KEY,
    queryFn: getStripeSubscription,
    staleTime: 60 * 1000,
    retry: 1,
  })

  const hasPremiumAccess = useMemo(() => {
    if (!data) return false
    return data.hasPremiumAccess
  }, [data])

  return {
    hasPremiumAccess: hasPremiumAccess ?? false,
    isLoading: isLoading ?? true,
    error,
    refetch,
    plan: data?.plan,
  }
}
