import { supabase } from '@/lib/supabase'

export interface ResendVerificationResult {
  success: boolean
  message?: string
}

export async function resendVerificationEmail(email: string): Promise<ResendVerificationResult> {
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
