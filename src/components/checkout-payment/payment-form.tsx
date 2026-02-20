import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { AlertCircle, CreditCard, Loader2, MapPin, Tag, Lock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const billingSchema = z.object({
  cardNumber: z.string().max(19, 'Card number must be 19 digits or less').optional(),
  expiry: z.string().refine((v) => !v || /^\d{2}\/\d{2}$/.test(v), 'Use MM/YY format').optional(),
  cvc: z.string().max(4, 'CVC must be 4 digits or less').optional(),
  fullName: z.string().max(100, 'Name must be 100 characters or less').optional(),
  email: z.string().refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Valid email required').optional(),
  address: z.string().max(200, 'Address must be 200 characters or less').optional(),
  city: z.string().max(100, 'City must be 100 characters or less').optional(),
  state: z.string().max(50, 'State must be 50 characters or less').optional(),
  zip: z.string().max(20, 'ZIP must be 20 characters or less').optional(),
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
      if (success) {
        toast.success('Promo code applied', { description: 'Your discount has been applied to the order.' })
      } else {
        toast.error('Invalid promo code', { description: 'The code may be expired or incorrect. Please check and try again.' })
      }
    } catch {
      setPromoStatus('error')
      setPromoMessage('Failed to apply promo code')
      toast.error('Failed to apply promo code', { description: 'Something went wrong. Please try again.' })
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
        {/* Form-level error summary */}
        {Object.keys(errors).length > 0 && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive"
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
            <div className="space-y-1">
              <p className="font-medium text-small">Please fix the following errors:</p>
              <ul className="list-disc list-inside text-micro space-y-0.5">
                {Object.entries(errors)
                  .filter(([, err]) => err?.message)
                  .map(([field, err]) => (
                    <li key={field} id={`${field}-error-summary`}>
                      {err!.message}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}

        {/* Card entry - Stripe Elements style container */}
        <div className="space-y-4" role="group" aria-labelledby="card-info-label">
          <Label id="card-info-label" className="text-base font-medium">
            Card information
          </Label>
          <div
            id="card-element"
            className={cn(
              'flex flex-col gap-3 rounded-xl border-2 border-input bg-background p-4 transition-all duration-200',
              'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:border-primary/50',
              'shadow-sm hover:border-primary/30'
            )}
          >
            <div className="space-y-2">
              <Label htmlFor="card-number" className="sr-only">
                Card number
              </Label>
              <Input
                id="card-number"
                {...register('cardNumber')}
                placeholder="1234 5678 9012 3456"
                className={cn(
                  'font-mono text-body',
                  errors.cardNumber && 'border-destructive focus-visible:ring-destructive animate-shake'
                )}
                maxLength={19}
                aria-label="Card number"
                aria-invalid={!!errors.cardNumber}
                aria-describedby={errors.cardNumber ? 'cardNumber-error' : undefined}
              />
              {errors.cardNumber && (
                <p id="cardNumber-error" className="text-micro text-destructive" role="alert">
                  {errors.cardNumber.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="expiry-date" className="sr-only">
                  Expiry date (MM/YY)
                </Label>
                <Input
                  id="expiry-date"
                  {...register('expiry')}
                  placeholder="MM/YY"
                  className={cn(
                    'font-mono',
                    errors.expiry && 'border-destructive focus-visible:ring-destructive animate-shake'
                  )}
                  maxLength={5}
                  aria-label="Expiry date (MM/YY)"
                  aria-invalid={!!errors.expiry}
                  aria-describedby={errors.expiry ? 'expiry-error' : undefined}
                />
                {errors.expiry && (
                  <p id="expiry-error" className="text-micro text-destructive" role="alert">
                    {errors.expiry.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc" className="sr-only">
                  CVC
                </Label>
                <Input
                  id="cvc"
                  {...register('cvc')}
                  placeholder="CVC"
                  type="password"
                  className={cn(
                    'font-mono',
                    errors.cvc && 'border-destructive focus-visible:ring-destructive animate-shake'
                  )}
                  maxLength={4}
                  aria-label="CVC security code"
                  aria-invalid={!!errors.cvc}
                  aria-describedby={errors.cvc ? 'cvc-error' : undefined}
                />
                {errors.cvc && (
                  <p id="cvc-error" className="text-micro text-destructive" role="alert">
                    {errors.cvc.message}
                  </p>
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
        <div className="space-y-4" role="group" aria-labelledby="billing-address-label">
          <Label id="billing-address-label" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" aria-hidden />
            Billing address
          </Label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="billing-name">Full name</Label>
              <Input
                id="billing-name"
                {...register('fullName')}
                placeholder="John Doe"
                className={cn(errors.fullName && 'border-destructive focus-visible:ring-destructive animate-shake')}
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? 'fullName-error' : undefined}
              />
              {errors.fullName && (
                <p id="fullName-error" className="text-micro text-destructive" role="alert">
                  {errors.fullName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-email">Email</Label>
              <Input
                id="billing-email"
                type="email"
                {...register('email')}
                placeholder="john@example.com"
                className={cn(errors.email && 'border-destructive focus-visible:ring-destructive animate-shake')}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-micro text-destructive" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="billing-address">Address</Label>
            <Input
              id="billing-address"
              {...register('address')}
              placeholder="123 Main St, Apt 4"
              aria-describedby={errors.address ? 'address-error' : undefined}
              className={cn(errors.address && 'border-destructive focus-visible:ring-destructive animate-shake')}
              aria-invalid={!!errors.address}
            />
            {errors.address && (
              <p id="address-error" className="text-micro text-destructive" role="alert">
                {errors.address.message}
              </p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="billing-city">City</Label>
              <Input
                id="billing-city"
                {...register('city')}
                placeholder="San Francisco"
                aria-describedby={errors.city ? 'city-error' : undefined}
                className={cn(errors.city && 'border-destructive focus-visible:ring-destructive animate-shake')}
                aria-invalid={!!errors.city}
              />
              {errors.city && (
                <p id="city-error" className="text-micro text-destructive" role="alert">
                  {errors.city.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-state">State</Label>
              <Input
                id="billing-state"
                {...register('state')}
                placeholder="CA"
                aria-describedby={errors.state ? 'state-error' : undefined}
                className={cn(errors.state && 'border-destructive focus-visible:ring-destructive animate-shake')}
                aria-invalid={!!errors.state}
              />
              {errors.state && (
                <p id="state-error" className="text-micro text-destructive" role="alert">
                  {errors.state.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-zip">ZIP code</Label>
              <Input
                id="billing-zip"
                {...register('zip')}
                placeholder="94102"
                aria-describedby={errors.zip ? 'zip-error' : undefined}
                className={cn(errors.zip && 'border-destructive focus-visible:ring-destructive animate-shake')}
                aria-invalid={!!errors.zip}
              />
              {errors.zip && (
                <p id="zip-error" className="text-micro text-destructive" role="alert">
                  {errors.zip.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Promo code */}
        <div className="space-y-2" role="group" aria-labelledby="promo-code-label">
          <Label id="promo-code-label" htmlFor="promo-code" className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" aria-hidden />
            Promo code
          </Label>
          <div className="flex gap-2">
            <Input
              id="promo-code"
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
              aria-label={promoStatus === 'applying' ? 'Applying promo code' : 'Apply promo code'}
              aria-busy={promoStatus === 'applying'}
            >
              {promoStatus === 'applying' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Applying...
                </>
              ) : (
                'Apply'
              )}
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
