import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'

interface LoadingContextValue {
  isLoading: boolean
  message?: string
  show: (message?: string) => void
  hide: () => void
}

const LoadingContext = createContext<LoadingContextValue | null>(null)

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
