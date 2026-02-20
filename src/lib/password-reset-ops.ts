import { supabase } from '@/lib/supabase'

export interface RequestResetResult {
  success: boolean
  message?: string
}

export interface UpdatePasswordResult {
  success: boolean
  message?: string
}

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : ''

export async function requestPasswordReset(email: string): Promise<RequestResetResult> {
  const { data, error } = await supabase.functions.invoke('password-reset', {
    body: { action: 'request_reset', email },
  })

  if (error) {
    const fallback = await requestPasswordResetFallback(email)
    if (fallback) return fallback
    throw new Error(error.message ?? 'Failed to send reset email')
  }

  const err = (data as { error?: string })?.error
  if (err) {
    throw new Error(err)
  }

  return { success: true, message: (data as { message?: string })?.message }
}

async function requestPasswordResetFallback(email: string): Promise<RequestResetResult | null> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${SITE_URL}/reset-password`,
    })
    if (error) return null
    return { success: true, message: 'Reset email sent' }
  } catch {
    return null
  }
}

/**
 * Exchange token_hash (from Supabase server-side redirect) for a session.
 * Returns access_token and refresh_token for use with updatePasswordWithToken.
 */
export async function exchangeTokenHashForSession(
  tokenHash: string
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'recovery',
    })
    if (error || !data.session) return null
    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token ?? '',
    }
  } catch {
    return null
  }
}

export async function updatePasswordWithToken(
  accessToken: string,
  password: string,
  refreshToken?: string
): Promise<UpdatePasswordResult> {
  const { data, error } = await supabase.functions.invoke('password-reset', {
    body: { action: 'update_password', access_token: accessToken, password },
  })

  if (error) {
    const fallback = await updatePasswordFallback(accessToken, password, refreshToken)
    if (fallback) return fallback
    throw new Error(error.message ?? 'Failed to update password')
  }

  const err = (data as { error?: string })?.error
  if (err) {
    throw new Error(err)
  }

  return { success: true, message: (data as { message?: string })?.message }
}

async function updatePasswordFallback(
  accessToken: string,
  password: string,
  refreshToken?: string
): Promise<UpdatePasswordResult | null> {
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const session = sessionData?.session
    if (!session && refreshToken) {
      const { error: setError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      if (setError) return null
    } else if (!session) {
      return null
    }
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return null
    return { success: true, message: 'Password updated successfully' }
  } catch {
    return null
  }
}
