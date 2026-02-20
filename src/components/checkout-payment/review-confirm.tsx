import { Receipt, Loader2, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ReviewConfirmProps {
  planName?: string
  subtotal?: number
  tax?: number
  discount?: number
  total?: number
  isSubmitting?: boolean
  onSubmit?: () => void | Promise<void>
}

export function ReviewConfirm({
  planName = 'Pro',
  subtotal = 29,
  tax = 2.61,
  discount = 0,
  total = 31.61,
  isSubmitting = false,
  onSubmit,
}: ReviewConfirmProps) {
  return (
    <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-primary/5 via-primary/[0.03] to-transparent transition-all duration-300 hover:shadow-card-hover hover:border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Review & confirm
        </CardTitle>
        <CardDescription>
          Pricing summary, taxes, and confirm your subscription.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-xl border border-primary/10 bg-card/50 p-4 shadow-sm">
          <div className="space-y-2">
            <div className="flex justify-between text-small">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium">{planName}</span>
            </div>
            <div className="flex justify-between text-small">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-small text-success">
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-small">
              <span className="text-muted-foreground">Tax (9%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}/mo</span>
              </div>
            </div>
          </div>
        </div>

        <Button
          size="lg"
          type="button"
          className={cn(
            'w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
            'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70',
            'shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30',
            isSubmitting &&
              'cursor-wait ring-2 ring-primary/40 ring-offset-2 disabled:opacity-90'
          )}
          onClick={onSubmit}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          aria-label={
            isSubmitting
              ? 'Processing payment, please wait'
              : 'Confirm and subscribe to plan'
          }
        >
          {isSubmitting ? (
            <>
              <Loader2
                className="h-5 w-5 shrink-0 animate-spin"
                aria-hidden
              />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />
              <span>Confirm and subscribe</span>
            </>
          )}
        </Button>

        <p className="text-center text-micro text-muted-foreground">
          By confirming, you agree to our Terms of Service and Privacy Policy. You can cancel anytime.
        </p>
      </CardContent>
    </Card>
  )
}
