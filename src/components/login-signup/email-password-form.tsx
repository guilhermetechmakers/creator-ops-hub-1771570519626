import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { PasswordStrengthIndicator } from '@/components/login-signup/password-strength-indicator'
import { getPasswordStrength } from '@/lib/password-utils'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const signupSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>

export interface EmailPasswordFormProps {
  mode: 'login' | 'signup'
  onSubmit: (data: LoginFormData | SignupFormData) => void | Promise<void>
  isSubmitting?: boolean
}

/** Renders inline error message with consistent styling and accessibility. */
function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className="flex items-center gap-1.5 text-small text-destructive animate-fade-in"
    >
      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </p>
  )
}

/** Renders inline error message slot for consistent field-level error display. Always reserves space to prevent layout shift. */
function FieldErrorSlot({
  id,
  error,
}: {
  id: string
  error?: { message?: string }
}) {
  return (
    <div className="min-h-[1.5rem] mt-1" aria-live="polite" aria-atomic="true">
      {error?.message ? <FieldError id={id} message={error.message} /> : null}
    </div>
  )
}

export function EmailPasswordForm({
  mode,
  onSubmit,
  isSubmitting = false,
}: EmailPasswordFormProps) {
  const schema = mode === 'login' ? loginSchema : signupSchema
  const [shouldShake, setShouldShake] = useState(false)
  const prevHasErrors = useRef(false)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormData | SignupFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      ...(mode === 'signup' && { confirmPassword: '' }),
    },
  })

  const password = watch('password', '')
  const showStrengthIndicator = mode === 'signup' && password.length > 0
  const strength = getPasswordStrength(password)
  const confirmPasswordError = mode === 'signup' ? (errors as { confirmPassword?: { message: string } }).confirmPassword : undefined
  const hasErrors = !!errors.email || !!errors.password || !!confirmPasswordError

  const passwordDescribedBy = [
    errors.password && 'password-error',
    showStrengthIndicator && 'password-strength',
  ].filter(Boolean).join(' ') || undefined

  useEffect(() => {
    if (hasErrors && !prevHasErrors.current) {
      prevHasErrors.current = true
      setShouldShake(true)
      const t = setTimeout(() => {
        setShouldShake(false)
      }, 500)
      return () => clearTimeout(t)
    }
    if (!hasErrors) prevHasErrors.current = false
  }, [hasErrors])

  const formHeadingId = 'email-form-heading'
  const formTitle = mode === 'login' ? 'Sign in with email' : 'Create account with email'

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('space-y-4', shouldShake && 'animate-shake')}
      id={mode === 'login' ? 'login-panel' : 'signup-panel'}
      aria-labelledby={formHeadingId}
      noValidate
    >
      <h2 id={formHeadingId} className="sr-only">
        {formTitle}
      </h2>

      <div className="space-y-2">
        <Label htmlFor="email" id="email-label">
          Email address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          aria-labelledby="email-label"
          aria-required="true"
          {...register('email')}
          className={cn(
            'transition-colors duration-200',
            errors.email && 'border-destructive focus-visible:ring-destructive'
          )}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        <FieldErrorSlot id="email-error" error={errors.email} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="password" id="password-label">
            Password
          </Label>
          {mode === 'signup' && (
            <span className="text-micro text-muted-foreground" aria-live="polite">
              {password.length} characters
            </span>
          )}
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          aria-labelledby="password-label"
          aria-required="true"
          {...register('password')}
          className={cn(
            'transition-colors duration-200',
            errors.password && 'border-destructive focus-visible:ring-destructive'
          )}
          aria-invalid={!!errors.password}
          aria-describedby={passwordDescribedBy}
        />
        {showStrengthIndicator && (
          <div id="password-strength" className="mt-1">
            <PasswordStrengthIndicator strength={strength} />
          </div>
        )}
        <FieldErrorSlot id="password-error" error={errors.password} />
      </div>

      {mode === 'signup' && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" id="confirm-password-label">
            Confirm password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            aria-labelledby="confirm-password-label"
            aria-required="true"
            {...register('confirmPassword')}
            className={cn(
              'transition-colors duration-200',
              confirmPasswordError && 'border-destructive focus-visible:ring-destructive'
            )}
            aria-invalid={!!confirmPasswordError}
            aria-describedby={confirmPasswordError ? 'confirm-password-error' : undefined}
          />
          <FieldErrorSlot id="confirm-password-error" error={confirmPasswordError} />
        </div>
      )}

      <Button
        type="submit"
        className={cn(
          'w-full h-11 font-medium bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]',
          isSubmitting &&
            'animate-pulse cursor-wait ring-2 ring-primary/40 ring-offset-2 disabled:opacity-90'
        )}
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        aria-label={mode === 'login' ? 'Sign in with email and password' : 'Create account with email and password'}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin shrink-0" aria-hidden />
            <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
          </>
        ) : (
          mode === 'login' ? 'Sign in' : 'Create account'
        )}
      </Button>
    </form>
  )
}
