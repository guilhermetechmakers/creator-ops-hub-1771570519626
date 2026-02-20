import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { PlanSelector } from '@/components/checkout-payment/plan-selector'
import { PaymentForm } from '@/components/checkout-payment/payment-form'
import { ReviewConfirm } from '@/components/checkout-payment/review-confirm'
import { InvoiceHistoryLink } from '@/components/checkout-payment/invoice-history-link'
import { useStripeCheckout } from '@/hooks/use-stripe-checkout'
import { createStripeCheckout } from '@/lib/stripe-ops'
import { toast } from 'sonner'
import type { PlanTier } from '@/types/checkout'

export function PaymentPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { currentPlanId, tiers, transactions, isLoading, error, refetch } = useStripeCheckout()

  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)

  const isPaymentInProgress =
    (selectedPlan != null && selectedPlan.id !== 'free') || isSubmitting

  useEffect(() => {
    document.title = 'Checkout & Payment | Creator Ops Hub'
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Upgrade plans, enter payment details, and view invoices. Manage your subscription billing.'
      )
    }
    return () => {
      document.title = 'Creator Ops Hub'
    }
  }, [])

  useEffect(() => {
    const checkoutSuccess = searchParams.get('checkout')
    if (checkoutSuccess === 'success') {
      toast.success('Subscription activated successfully')
      refetch()
    }
  }, [searchParams, refetch])

  useEffect(() => {
    if (!isPaymentInProgress) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isPaymentInProgress])

  const handleSelectPlan = (tier: PlanTier) => {
    setSelectedPlan(tier)
  }

  const handlePromoApply = async (code: string): Promise<boolean> => {
    if (code.toUpperCase() === 'SAVE10') return true
    return false
  }

  const handleSubmit = async () => {
    if (!selectedPlan || selectedPlan.id === 'free') {
      toast.error('Please select a plan to upgrade')
      return
    }
    setIsSubmitting(true)
    try {
      const siteUrl = window.location.origin
      const { url } = await createStripeCheckout(
        selectedPlan.id,
        billingCycle,
        `${siteUrl}/dashboard/settings?checkout=success`,
        `${siteUrl}/dashboard/checkout-/-payment?canceled=1`
      )
      window.location.href = url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
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

  const handleBackClick = () => {
    if (isPaymentInProgress) {
      setPendingNavigation('/dashboard/settings')
      setShowLeaveConfirm(true)
    } else {
      navigate('/dashboard/settings')
    }
  }

  const handleConfirmLeave = () => {
    if (pendingNavigation) {
      navigate(pendingNavigation)
      setPendingNavigation(null)
    }
    setShowLeaveConfirm(false)
  }

  const handleCancelLeave = () => {
    setShowLeaveConfirm(false)
    setPendingNavigation(null)
  }

  return (
    <div className="space-y-8 max-w-6xl animate-fade-in" role="main">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackClick}
            className="mb-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Settings
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
        tiers={tiers}
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
        <InvoiceHistoryLink
          transactions={transactions}
          isLoading={isLoading}
        />
      </div>

      {/* Leave confirmation dialog */}
      <AlertDialog open={showLeaveConfirm} onOpenChange={(open) => !open && handleCancelLeave()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave checkout?</AlertDialogTitle>
            <AlertDialogDescription>
              You have selected a plan and your progress may be lost. Are you sure you want to leave this page?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelLeave}>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLeave} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default PaymentPage
