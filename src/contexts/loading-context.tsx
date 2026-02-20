import { useCallback, useState, type ReactNode } from 'react'
import { LoadingContext } from './loading-context-value'

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | undefined>()

  const show = useCallback((msg?: string) => {
    setIsLoading(true)
    setMessage(msg)
  }, [])

  const hide = useCallback(() => {
    setIsLoading(false)
    setMessage(undefined)
  }, [])

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        message,
        show,
        hide,
      }}
    >
      {children}
    </LoadingContext.Provider>
  )
}
