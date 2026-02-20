import { api, type ApiError } from '@/lib/api'
import type { AuthResponse, LoginCredentials, SignupCredentials } from '@/types/auth'

/**
 * Auth API - calls backend/Supabase Edge Functions.
 * When Supabase is configured, replace with supabase.functions.invoke('auth-login', { body })
 */

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const data = await api.post<AuthResponse>('/auth/login', credentials)
    if (data?.access_token) {
      localStorage.setItem('access_token', data.access_token)
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token)
      }
    }
    return data
  } catch (err) {
    const error = err as ApiError
    throw new Error(error.message ?? 'Login failed')
  }
}

export async function signup(credentials: SignupCredentials): Promise<AuthResponse> {
  try {
    const { confirmPassword: _, ...payload } = credentials
    const data = await api.post<AuthResponse>('/auth/signup', payload)
    if (data?.access_token) {
      localStorage.setItem('access_token', data.access_token)
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token)
      }
    }
    return data
  } catch (err) {
    const error = err as ApiError
    throw new Error(error.message ?? 'Signup failed')
  }
}

export async function signInWithGoogle(scopes?: string[]): Promise<AuthResponse> {
  try {
    const data = await api.post<AuthResponse>('/auth/google', {
      scopes: scopes ?? ['email', 'https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/calendar'],
    })
    if (data?.access_token) {
      localStorage.setItem('access_token', data.access_token)
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token)
      }
    }
    return data
  } catch (err) {
    const error = err as ApiError
    throw new Error(error.message ?? 'Google sign-in failed')
  }
}

export function logout(): void {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('access_token')
}
