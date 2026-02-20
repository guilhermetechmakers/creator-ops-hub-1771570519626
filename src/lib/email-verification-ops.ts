import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'

const SUPABASE_CONFIGURED =
  typeof import.meta.env.VITE_SUPABASE_URL === 'string' &&
  import.meta.env.VITE_SUPABASE_URL.length > 0 &&
  typeof import.meta.env.VITE_SUPABASE_ANON_KEY === 'string' &&
  import.meta.env.VITE_SUPABASE_ANON_KEY.length > 0

export interface ResendVerificationResult {
  success: boolean
  message?: string
}

export async function resendVerificationEmail(email: string): Promise<ResendVerificationResult> {
  if (SUPABASE_CONFIGURED) {
    const { data, error } = await supabase.functions.invoke('email-verification-resend', {
      body: { email },
    })

    if (error) {
      throw new Error(error.message ?? 'Failed to resend verification email')
    }

    const err = (data as { error?: string })?.error
    if (err) {
      throw new Error(err)
    }

    return { success: true, message: (data as { message?: string })?.message }
  }

  const data = await api.post<{ success?: boolean; message?: string; error?: string }>(
    '/auth/resend-verification',
    { email: email.trim().toLowerCase() }
  )
  const err = (data as { error?: string })?.error
  if (err) {
    throw new Error(err)
  }
  return { success: true, message: (data as { message?: string })?.message }
}
