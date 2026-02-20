import { useState } from 'react'
import { CreditCard, MapPin, Tag } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface PaymentFormProps {
  onPromoApply?: (code: string) => Promise<boolean>
  isLoading?: boolean
}

export function PaymentForm({ onPromoApply, isLoading = false }: PaymentFormProps) {
  const [promoCode, setPromoCode] = useState('')
  const [promoStatus, setPromoStatus] = useState<'idle' | 'applying' | 'success' | 'error'>('idle')
  const [promoMessage, setPromoMessage] = useState('')

  const handlePromoApply = async () => {
    if (!promoCode.trim()) return
    setPromoStatus('applying')
    setPromoMessage('')
    try {
      const success = await onPromoApply?.(promoCode.trim())
      setPromoStatus(success ? 'success' : 'error')
      setPromoMessage(success ? 'Promo code applied' : 'Invalid or expired promo code')
    } catch {
      setPromoStatus('error')
      setPromoMessage('Failed to apply promo code')
    }
  }

  return (
    <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-primary/5 to-transparent transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Payment details
        </CardTitle>
        <CardDescription>
          Card entry (Stripe Elements), billing info, and promo code. Secure payment processing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Card entry - Stripe Elements placeholder */}
        <div className="space-y-4">
          <Label htmlFor="card-element">Card information</Label>
          <div
            id="card-element"
            className={cn(
              'flex flex-col gap-3 rounded-lg border border-input bg-background p-4 transition-colors duration-200',
              'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
            )}
          >
            <Input
              placeholder="1234 5678 9012 3456"
              className="font-mono"
              maxLength={19}
              aria-label="Card number"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="MM/YY"
                className="font-mono"
                maxLength={5}
                aria-label="Expiry date"
              />
              <Input
                placeholder="CVC"
                type="password"
                className="font-mono"
                maxLength={4}
                aria-label="CVC"
              />
            </div>
          </div>
          <p className="text-micro text-muted-foreground">
            Your payment information is encrypted and secure. We use Stripe for payment processing.
          </p>
        </div>

        {/* Billing info */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Billing address
          </Label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="billing-name">Full name</Label>
              <Input id="billing-name" placeholder="John Doe" aria-label="Full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-email">Email</Label>
              <Input
                id="billing-email"
                type="email"
                placeholder="john@example.com"
                aria-label="Billing email"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="billing-address">Address</Label>
            <Input
              id="billing-address"
              placeholder="123 Main St, Apt 4"
              aria-label="Street address"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="billing-city">City</Label>
              <Input id="billing-city" placeholder="San Francisco" aria-label="City" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-state">State</Label>
              <Input id="billing-state" placeholder="CA" aria-label="State" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-zip">ZIP code</Label>
              <Input id="billing-zip" placeholder="94102" aria-label="ZIP code" />
            </div>
          </div>
        </div>

        {/* Promo code */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Promo code
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value)
                setPromoStatus('idle')
              }}
              className={cn(
                promoStatus === 'success' && 'border-success',
                promoStatus === 'error' && 'border-destructive'
              )}
              aria-label="Promo code"
              aria-invalid={promoStatus === 'error'}
              aria-describedby={promoMessage ? 'promo-message' : undefined}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handlePromoApply}
              disabled={isLoading || !promoCode.trim() || promoStatus === 'applying'}
              className="shrink-0 transition-transform duration-200 hover:scale-[1.02]"
            >
              {promoStatus === 'applying' ? 'Applying...' : 'Apply'}
            </Button>
          </div>
          {promoMessage && (
            <p
              id="promo-message"
              className={cn(
                'text-small',
                promoStatus === 'success' && 'text-success',
                promoStatus === 'error' && 'text-destructive'
              )}
            >
              {promoMessage}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
