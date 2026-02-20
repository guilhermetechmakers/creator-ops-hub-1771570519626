import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  PasswordStrengthIndicator,
  getPasswordStrength,
} from './password-strength-indicator'

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
      className="flex items-center gap-1.5 text-small text-destructive mt-1 min-h-[1.25rem] animate-fade-in"
    >
      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </p>
  )
}

/** Renders inline error message slot for consistent field-level error display. */
function FieldErrorSlot({
  id,
  error,
}: {
  id: string
  error?: { message?: string }
}) {
  if (!error?.message) return null
  return <FieldError id={id} message={error.message} />
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('space-y-4', shouldShake && 'animate-shake')}
      id={mode === 'login' ? 'login-panel' : 'signup-panel'}
      aria-labelledby={mode === 'login' ? 'login-tab' : 'signup-tab'}
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="email">
          Email address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          aria-label="Email address"
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
          <Label htmlFor="password">
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
          aria-label="Password"
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
          <Label htmlFor="confirmPassword">
            Confirm password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            aria-label="Confirm password"
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
        className="w-full h-11 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
          </>
        ) : (
          mode === 'login' ? 'Sign in' : 'Create account'
        )}
      </Button>
    </form>
  )
}
