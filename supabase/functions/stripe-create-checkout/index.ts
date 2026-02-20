import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const STRIPE_PRICE_IDS: Record<string, { monthly: string; yearly: string }> = {
  pro: {
    monthly: Deno.env.get('STRIPE_PRO_MONTHLY_PRICE_ID') ?? 'price_pro_monthly',
    yearly: Deno.env.get('STRIPE_PRO_YEARLY_PRICE_ID') ?? 'price_pro_yearly',
  },
  team: {
    monthly: Deno.env.get('STRIPE_TEAM_MONTHLY_PRICE_ID') ?? 'price_team_monthly',
    yearly: Deno.env.get('STRIPE_TEAM_YEARLY_PRICE_ID') ?? 'price_team_yearly',
  },
  enterprise: {
    monthly: Deno.env.get('STRIPE_ENTERPRISE_MONTHLY_PRICE_ID') ?? 'price_enterprise_monthly',
    yearly: Deno.env.get('STRIPE_ENTERPRISE_YEARLY_PRICE_ID') ?? 'price_enterprise_yearly',
  },
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

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Stripe not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json().catch(() => ({}))
    const { planId, billingCycle = 'monthly', successUrl, cancelUrl } = body as {
      planId?: string
      billingCycle?: 'monthly' | 'yearly'
      successUrl?: string
      cancelUrl?: string
    }

    if (!planId || !['pro', 'team', 'enterprise'].includes(planId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid planId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const priceIds = STRIPE_PRICE_IDS[planId]
    if (!priceIds) {
      return new Response(
        JSON.stringify({ error: 'Plan not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const priceId = billingCycle === 'yearly' ? priceIds.yearly : priceIds.monthly
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-11-20.acacia' })

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let stripeCustomerId: string | null = null
    const { data: existingCustomer } = await adminClient
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (existingCustomer?.stripe_customer_id) {
      stripeCustomerId = existingCustomer.stripe_customer_id
    } else {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      })
      stripeCustomerId = customer.id
      await adminClient.from('stripe_customers').upsert({
        user_id: user.id,
        stripe_customer_id: customer.id,
        email: user.email ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
    }

    const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173'
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl ?? `${siteUrl}/dashboard/settings?checkout=success`,
      cancel_url: cancelUrl ?? `${siteUrl}/dashboard/checkout-/-payment?canceled=1`,
      metadata: {
        supabase_user_id: user.id,
        plan_id: planId,
        billing_cycle: billingCycle,
      },
      subscription_data: {
        metadata: { supabase_user_id: user.id, plan_id: planId },
      },
    })

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
