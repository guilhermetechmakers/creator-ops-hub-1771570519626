import { supabase } from '@/lib/supabase'

export interface RequestResetResult {
  success: boolean
  message?: string
}

export interface UpdatePasswordResult {
  success: boolean
  message?: string
}

export async function requestPasswordReset(email: string): Promise<RequestResetResult> {
  const { data, error } = await supabase.functions.invoke('password-reset', {
    body: { action: 'request_reset', email },
  })

  if (error) {
    throw new Error(error.message ?? 'Failed to send reset email')
  }

  const err = (data as { error?: string })?.error
  if (err) {
    throw new Error(err)
  }

  return { success: true, message: (data as { message?: string })?.message }
}

export async function updatePasswordWithToken(
  accessToken: string,
  password: string
): Promise<UpdatePasswordResult> {
  const { data, error } = await supabase.functions.invoke('password-reset', {
    body: { action: 'update_password', access_token: accessToken, password },
  })

  if (error) {
    throw new Error(error.message ?? 'Failed to update password')
  }

  const err = (data as { error?: string })?.error
  if (err) {
    throw new Error(err)
  }

  return { success: true, message: (data as { message?: string })?.message }
}
