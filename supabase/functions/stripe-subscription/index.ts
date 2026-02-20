import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PLAN_SEATS: Record<string, number> = {
  free: 3,
  pro: 10,
  team: 25,
  enterprise: 100,
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
    const action = (body?.action as string) ?? 'get'

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (action === 'get') {
      const { data: sub } = await adminClient
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const planId = sub?.plan_id ?? 'free'
      const seats = sub?.seats ?? PLAN_SEATS.free

      const { data: checkoutItems } = await adminClient
        .from('checkout_payment')
        .select('id, title, description, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      const transactions = (checkoutItems ?? []).map((c) => ({
        id: c.id,
        date: c.created_at,
        description: c.title ?? '',
        amount: 0,
        status: c.status === 'active' ? 'succeeded' : 'failed',
        invoice_url: undefined,
      }))

      return new Response(
        JSON.stringify({
          plan: {
            id: planId,
            name: planId.charAt(0).toUpperCase() + planId.slice(1),
            seats,
            used_seats: 1,
            usage_percent: Math.round((1 / seats) * 100),
            status: sub?.status,
            current_period_end: sub?.current_period_end,
            cancel_at_period_end: sub?.cancel_at_period_end,
          },
          hasPremiumAccess: ['pro', 'team', 'enterprise'].includes(planId),
          transactions,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
