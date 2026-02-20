import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CreditCard, MapPin, Tag, Lock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const billingSchema = z.object({
  cardNumber: z.string().max(19).optional(),
  expiry: z.string().refine((v) => !v || /^\d{2}\/\d{2}$/.test(v), 'Use MM/YY format').optional(),
  cvc: z.string().max(4).optional(),
  fullName: z.string().max(100).optional(),
  email: z.string().refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Valid email required').optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  zip: z.string().max(20).optional(),
})

type BillingFormData = z.infer<typeof billingSchema>

export interface PaymentFormProps {
  onPromoApply?: (code: string) => Promise<boolean>
  isLoading?: boolean
}

export function PaymentForm({ onPromoApply, isLoading = false }: PaymentFormProps) {
  const [promoCode, setPromoCode] = useState('')
  const [promoStatus, setPromoStatus] = useState<'idle' | 'applying' | 'success' | 'error'>('idle')
  const [promoMessage, setPromoMessage] = useState('')

  const {
    register,
    formState: { errors },
  } = useForm<BillingFormData>({
    resolver: zodResolver(billingSchema),
    mode: 'onBlur',
    defaultValues: {
      cardNumber: '',
      expiry: '',
      cvc: '',
      fullName: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zip: '',
    },
  })

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
    <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-primary/5 via-primary/[0.03] to-transparent transition-all duration-300 hover:shadow-card-hover hover:border-primary/20">
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
        {/* Card entry - Stripe Elements style container */}
        <div className="space-y-4">
          <Label htmlFor="card-element">Card information</Label>
          <div
            id="card-element"
            className={cn(
              'flex flex-col gap-3 rounded-xl border-2 border-input bg-background p-4 transition-all duration-200',
              'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:border-primary/50',
              'shadow-sm hover:border-primary/30'
            )}
          >
            <div className="space-y-2">
              <Input
                {...register('cardNumber')}
                placeholder="1234 5678 9012 3456"
                className={cn(
                  'font-mono text-body',
                  errors.cardNumber && 'border-destructive focus-visible:ring-destructive animate-shake'
                )}
                maxLength={19}
                aria-label="Card number"
                aria-invalid={!!errors.cardNumber}
              />
              {errors.cardNumber && (
                <p className="text-micro text-destructive">{errors.cardNumber.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Input
                  {...register('expiry')}
                  placeholder="MM/YY"
                  className={cn(
                    'font-mono',
                    errors.expiry && 'border-destructive focus-visible:ring-destructive animate-shake'
                  )}
                  maxLength={5}
                  aria-label="Expiry date"
                  aria-invalid={!!errors.expiry}
                />
                {errors.expiry && (
                  <p className="text-micro text-destructive">{errors.expiry.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  {...register('cvc')}
                  placeholder="CVC"
                  type="password"
                  className={cn(
                    'font-mono',
                    errors.cvc && 'border-destructive focus-visible:ring-destructive animate-shake'
                  )}
                  maxLength={4}
                  aria-label="CVC"
                  aria-invalid={!!errors.cvc}
                />
                {errors.cvc && (
                  <p className="text-micro text-destructive">{errors.cvc.message}</p>
                )}
              </div>
            </div>
          </div>
          <p className="text-micro text-muted-foreground flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
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
              <Input
                id="billing-name"
                {...register('fullName')}
                placeholder="John Doe"
                className={cn(errors.fullName && 'border-destructive')}
                aria-label="Full name"
                aria-invalid={!!errors.fullName}
              />
              {errors.fullName && (
                <p className="text-micro text-destructive">{errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-email">Email</Label>
              <Input
                id="billing-email"
                type="email"
                {...register('email')}
                placeholder="john@example.com"
                className={cn(errors.email && 'border-destructive')}
                aria-label="Billing email"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-micro text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="billing-address">Address</Label>
            <Input
              id="billing-address"
              {...register('address')}
              placeholder="123 Main St, Apt 4"
              aria-label="Street address"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="billing-city">City</Label>
              <Input
                id="billing-city"
                {...register('city')}
                placeholder="San Francisco"
                aria-label="City"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-state">State</Label>
              <Input
                id="billing-state"
                {...register('state')}
                placeholder="CA"
                aria-label="State"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-zip">ZIP code</Label>
              <Input
                id="billing-zip"
                {...register('zip')}
                placeholder="94102"
                aria-label="ZIP code"
              />
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
                'transition-colors duration-200',
                promoStatus === 'success' && 'border-success focus-visible:ring-success',
                promoStatus === 'error' && 'border-destructive focus-visible:ring-destructive animate-shake'
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
              className="shrink-0 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
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
