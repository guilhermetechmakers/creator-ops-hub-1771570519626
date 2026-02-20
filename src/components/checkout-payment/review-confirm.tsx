import { Receipt, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
    <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-primary/5 to-transparent transition-all duration-300 hover:shadow-card-hover">
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
        <div className="rounded-lg border bg-card/50 p-4">
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
          className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          onClick={onSubmit}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-[spin_1s_linear_infinite]" />
              Processing...
            </>
          ) : (
            'Confirm and subscribe'
          )}
        </Button>

        <p className="text-center text-micro text-muted-foreground">
          By confirming, you agree to our Terms of Service and Privacy Policy. You can cancel anytime.
        </p>
      </CardContent>
    </Card>
  )
}
