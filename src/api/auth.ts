import { api, type ApiError } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type { AuthResponse, LoginCredentials, SignupCredentials } from '@/types/auth'

const SUPABASE_CONFIGURED =
  typeof import.meta.env.VITE_SUPABASE_URL === 'string' &&
  import.meta.env.VITE_SUPABASE_URL.length > 0 &&
  typeof import.meta.env.VITE_SUPABASE_ANON_KEY === 'string' &&
  import.meta.env.VITE_SUPABASE_ANON_KEY.length > 0

function storeSession(data: AuthResponse): void {
  if (data?.access_token) {
    localStorage.setItem('access_token', data.access_token)
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token)
    }
  }
}

/**
 * Auth API - uses Supabase Edge Functions when configured, otherwise falls back to api.
 */

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    if (SUPABASE_CONFIGURED) {
      const { data, error } = await supabase.functions.invoke<AuthResponse & { error?: string }>('auth-login', {
        body: { email: credentials.email, password: credentials.password },
      })
      if (error) throw new Error(error.message ?? 'Login failed')
      if (!data) throw new Error('No response from auth')
      if ('error' in data && data.error) throw new Error(data.error)
      storeSession(data)
      if (data.access_token && data.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        })
      }
      return data
    }
    const data = await api.post<AuthResponse>('/auth/login', credentials)
    storeSession(data)
    return data
  } catch (err) {
    const msg = err instanceof Error ? err.message : (err as ApiError)?.message ?? 'Login failed'
    throw new Error(msg)
  }
}

export async function signup(credentials: SignupCredentials): Promise<AuthResponse> {
  try {
    const { confirmPassword: _, ...payload } = credentials
    if (SUPABASE_CONFIGURED) {
      const { data, error } = await supabase.functions.invoke<AuthResponse & { needsEmailVerification?: boolean; error?: string }>('auth-signup', {
        body: { email: payload.email, password: payload.password },
      })
      if (error) throw new Error(error.message ?? 'Signup failed')
      if (!data) throw new Error('No response from auth')
      if ('error' in data && data.error) throw new Error(data.error)
      if (data.access_token) {
        storeSession(data)
        if (data.refresh_token) {
          await supabase.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          })
        }
      }
      return data
    }
    const data = await api.post<AuthResponse>('/auth/signup', payload)
    storeSession(data)
    return data
  } catch (err) {
    const msg = err instanceof Error ? err.message : (err as ApiError)?.message ?? 'Signup failed'
    throw new Error(msg)
  }
}

export async function signInWithGoogle(scopes?: string[]): Promise<AuthResponse> {
  try {
    if (SUPABASE_CONFIGURED) {
      const scopeList = scopes ?? [
        'email',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/calendar',
      ]
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: scopeList.join(' '),
          redirectTo: `${window.location.origin}/oauth/google/callback`,
        },
      })
      if (error) throw new Error(error.message ?? 'Google sign-in failed')
      if (data?.url) {
        window.location.href = data.url
        return { access_token: '', refresh_token: undefined }
      }
      throw new Error('No redirect URL returned')
    }
    const data = await api.post<AuthResponse>('/auth/google', {
      scopes: scopes ?? ['email', 'https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/calendar'],
    })
    storeSession(data)
    return data
  } catch (err) {
    const msg = err instanceof Error ? err.message : (err as ApiError)?.message ?? 'Google sign-in failed'
    throw new Error(msg)
  }
}

export async function logout(): Promise<void> {
  if (SUPABASE_CONFIGURED) {
    await supabase.auth.signOut()
  }
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('access_token')
}
