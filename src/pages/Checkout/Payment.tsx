import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlanSelector } from '@/components/checkout-payment/plan-selector'
import { PaymentForm } from '@/components/checkout-payment/payment-form'
import { ReviewConfirm } from '@/components/checkout-payment/review-confirm'
import { InvoiceHistoryLink } from '@/components/checkout-payment/invoice-history-link'
import { useCheckoutPayment } from '@/hooks/use-checkout-payment'
import { toast } from 'sonner'
import type { PlanTier } from '@/types/checkout'

export function PaymentPage() {
  const { isLoading, error } = useCheckoutPayment()

  useEffect(() => {
    document.title = 'Checkout & Payment | Creator Ops Hub'
    return () => {
      document.title = 'Creator Ops Hub'
    }
  }, [])
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentPlanId = 'free'

  const handleSelectPlan = (tier: PlanTier) => {
    setSelectedPlan(tier)
  }

  const handlePromoApply = async (code: string): Promise<boolean> => {
    if (code.toUpperCase() === 'SAVE10') return true
    return false
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 1500))
      toast.success('Subscription updated successfully')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const subtotal = selectedPlan
    ? billingCycle === 'yearly'
      ? selectedPlan.priceYearly / 12
      : selectedPlan.priceMonthly
    : 0
  const tax = Math.round(subtotal * 0.09 * 100) / 100
  const total = subtotal + tax

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
        <div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mb-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <Link to="/dashboard/settings">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Settings
            </Link>
          </Button>
          <h1 className="text-h1 font-bold flex items-center gap-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            <CreditCard className="h-8 w-8 text-primary" />
            Checkout & Payment
          </h1>
          <p className="text-muted-foreground mt-1">
            Upgrade plans, manage payment details, and view invoices
          </p>
        </div>
      </div>

      {error && (
        <div
          className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Billing cycle toggle */}
      <div className="flex items-center gap-2 animate-slide-up">
        <Button
          variant={billingCycle === 'monthly' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setBillingCycle('monthly')}
        >
          Monthly
        </Button>
        <Button
          variant={billingCycle === 'yearly' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setBillingCycle('yearly')}
        >
          Yearly
          <span className="ml-1 rounded bg-primary/20 px-1.5 py-0.5 text-xs">
            Save 17%
          </span>
        </Button>
      </div>

      {/* Plan selector */}
      <section id="plans" className="scroll-mt-8">
      <PlanSelector
        currentPlanId={currentPlanId}
        billingCycle={billingCycle}
        onSelectPlan={handleSelectPlan}
        isLoading={isLoading}
      />
      </section>

      {/* Payment form + Review */}
      <div className="grid gap-8 lg:grid-cols-2 animate-slide-up">
        <PaymentForm onPromoApply={handlePromoApply} isLoading={isSubmitting} />
        <ReviewConfirm
          planName={selectedPlan?.name ?? 'Pro'}
          subtotal={subtotal}
          tax={tax}
          total={total}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Invoice history */}
      <div className="animate-slide-up">
        <InvoiceHistoryLink isLoading={isLoading} />
      </div>
    </div>
  )
}

export default PaymentPage
