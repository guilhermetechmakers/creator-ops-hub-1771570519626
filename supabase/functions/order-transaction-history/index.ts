import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SORT_COLUMNS = ['created_at', 'amount_cents', 'status', 'title'] as const
const STATUS_VALUES = ['active', 'failed', 'succeeded', 'pending', 'refunded'] as const

function mapStatus(status: string): string {
  if (status === 'active') return 'succeeded'
  return status
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json().catch(() => ({}))
    const page = Math.max(1, parseInt(String(body?.page ?? 1), 10))
    const limit = Math.min(50, Math.max(1, parseInt(String(body?.limit ?? 20), 10)))
    const sortBy = SORT_COLUMNS.includes(body?.sortBy as typeof SORT_COLUMNS[number])
      ? body.sortBy
      : 'created_at'
    const sortOrder = body?.sortOrder === 'asc' ? 'asc' : 'desc'
    const statusFilter = typeof body?.status === 'string' && body.status
      ? body.status
      : undefined
    const searchRaw = typeof body?.search === 'string' ? body.search.trim().replace(/,/g, ' ') : undefined
    const search = searchRaw
      ? searchRaw.replace(/[%_\\]/g, (c) => (c === '\\' ? '\\\\' : `\\${c}`))
      : undefined

    let query = supabase
      .from('checkout_payment')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)

    if (search) {
      const pattern = `%${search}%`
      query = query.or(`title.ilike.${pattern},description.ilike.${pattern}`)
    }

    if (statusFilter && STATUS_VALUES.includes(statusFilter as typeof STATUS_VALUES[number])) {
      const dbStatus = statusFilter === 'succeeded' ? 'active' : statusFilter
      query = query.eq('status', dbStatus)
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * limit, page * limit - 1)

    const { data, error, count } = await query

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const items = (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      description: row.description ?? null,
      status: mapStatus(String(row.status ?? 'active')),
      created_at: row.created_at,
      updated_at: row.updated_at,
      amount: ((Number(row.amount_cents) || 0) / 100),
      amount_cents: Number(row.amount_cents) || 0,
      invoice_url: (row.invoice_url as string) ?? undefined,
    }))

    return new Response(
      JSON.stringify({
        items,
        total: count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((count ?? 0) / limit),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
