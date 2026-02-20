import { useContext } from 'react'
import { LoadingContext } from '@/contexts/loading-context-value'

export function useLoading() {
  const ctx = useContext(LoadingContext)
  if (!ctx) {
    return {
      isLoading: false,
      message: undefined,
      show: () => {},
      hide: () => {},
    }
  }
  return ctx
}
