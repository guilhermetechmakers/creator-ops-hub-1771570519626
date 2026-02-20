import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { loginSignupApi, type CreateLoginSignupInput } from '@/api/login-signup'
import { toast } from 'sonner'
import type { LoginSignup } from '@/types/auth'

export const loginSignupKeys = {
  all: ['login-signup'] as const,
  lists: () => [...loginSignupKeys.all, 'list'] as const,
  list: (filters?: string) => [...loginSignupKeys.lists(), filters ?? ''] as const,
  details: () => [...loginSignupKeys.all, 'detail'] as const,
  detail: (id: string) => [...loginSignupKeys.details(), id] as const,
}

export function useLoginSignupList() {
  return useQuery({
    queryKey: loginSignupKeys.lists(),
    queryFn: () => loginSignupApi.getAll(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useLoginSignup(id: string) {
  return useQuery({
    queryKey: loginSignupKeys.detail(id),
    queryFn: () => loginSignupApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateLoginSignup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateLoginSignupInput) => loginSignupApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loginSignupKeys.lists() })
      toast.success('Session recorded')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to record session')
    },
  })
}

export function useUpdateLoginSignup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Pick<LoginSignup, 'title' | 'description' | 'status'>> }) =>
      loginSignupApi.update(id, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(loginSignupKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: loginSignupKeys.lists() })
      toast.success('Updated')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    },
  })
}

export function useDeleteLoginSignup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => loginSignupApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: loginSignupKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: loginSignupKeys.lists() })
      toast.success('Deleted')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    },
  })
}
