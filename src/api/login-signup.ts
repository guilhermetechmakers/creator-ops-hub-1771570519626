import { supabase } from '@/lib/supabase'
import type { LoginSignup } from '@/types/auth'

const TABLE = 'login_signup'

export interface CreateLoginSignupInput {
  user_id: string
  title: string
  description?: string
  status?: string
}

export const loginSignupApi = {
  async getAll(): Promise<LoginSignup[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []) as LoginSignup[]
  },

  async getById(id: string): Promise<LoginSignup | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .single()
    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(error.message)
    }
    return data as LoginSignup
  },

  async create(input: CreateLoginSignupInput): Promise<LoginSignup> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        user_id: input.user_id,
        title: input.title,
        description: input.description ?? null,
        status: input.status ?? 'active',
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data as LoginSignup
  },

  async update(id: string, updates: Partial<Pick<LoginSignup, 'title' | 'description' | 'status'>>): Promise<LoginSignup> {
    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data as LoginSignup
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}
