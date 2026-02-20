import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  if (!stripeSecretKey || !webhookSecret) {
    return new Response(
      JSON.stringify({ error: 'Stripe not configured' }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-11-20.acacia' })
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response(
      JSON.stringify({ error: 'Missing stripe-signature' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const body = await req.text()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Webhook signature verification failed: ${(err as Error).message}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.supabase_user_id
        const planId = sub.metadata?.plan_id ?? 'pro'
        if (!userId) break

        const priceId = sub.items?.data?.[0]?.price?.id
        const seats = planId === 'pro' ? 10 : planId === 'team' ? 25 : planId === 'enterprise' ? 100 : 3

        await adminClient.from('subscriptions').upsert(
          {
            user_id: userId,
            stripe_subscription_id: sub.id,
            stripe_price_id: priceId ?? null,
            plan_id: planId,
            status: sub.status,
            current_period_start: sub.current_period_start
              ? new Date(sub.current_period_start * 1000).toISOString()
              : null,
            current_period_end: sub.current_period_end
              ? new Date(sub.current_period_end * 1000).toISOString()
              : null,
            cancel_at_period_end: sub.cancel_at_period_end ?? false,
            seats,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'stripe_subscription_id' }
        )
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        if (!sub.id) break

        await adminClient
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', sub.id)
        break
      }
      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.billing_reason === 'subscription_create' || invoice.billing_reason === 'subscription_cycle') {
          const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id
          if (subId) {
            const { data: sub } = await adminClient
              .from('subscriptions')
              .select('user_id')
              .eq('stripe_subscription_id', subId)
              .single()
            if (sub) {
              await adminClient.from('checkout_payment').insert({
                user_id: sub.user_id,
                title: `Invoice ${invoice.number ?? invoice.id}`,
                description: event.type === 'invoice.paid' ? 'Paid' : 'Payment failed',
                status: event.type === 'invoice.paid' ? 'active' : 'failed',
                updated_at: new Date().toISOString(),
              })
            }
          }
        }
        break
      }
      default:
        break
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
