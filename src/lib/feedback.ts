import { toast } from 'sonner'

export const feedback = {
  success: (message: string, description?: string) => {
    toast.success(message, { description })
  },

  error: (message: string, description?: string) => {
    toast.error(message, { description })
  },

  loading: (message: string, id?: string) => {
    return toast.loading(message, { id })
  },

  dismiss: (id?: string) => {
    toast.dismiss(id)
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => {
    return toast.promise(promise, messages)
  },
}
