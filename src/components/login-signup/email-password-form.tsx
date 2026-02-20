import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  PasswordStrengthIndicator,
  getPasswordStrength,
} from './password-strength-indicator'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
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
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register('email')}
          className={cn(
            'transition-colors duration-200',
            errors.email && 'border-destructive focus-visible:ring-destructive'
          )}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="text-small text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Password</Label>
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
          {...register('password')}
          className={cn(
            'transition-colors duration-200',
            errors.password && 'border-destructive focus-visible:ring-destructive'
          )}
          aria-invalid={!!errors.password}
          aria-describedby={
            errors.password
              ? 'password-error'
              : showStrengthIndicator
                ? 'password-strength'
                : undefined
          }
        />
        {showStrengthIndicator && (
          <div id="password-strength">
            <PasswordStrengthIndicator strength={strength} className="mt-1" />
          </div>
        )}
        {errors.password && (
          <p id="password-error" className="text-small text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      {mode === 'signup' && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register('confirmPassword')}
            className={cn(
              'transition-colors duration-200',
              confirmPasswordError && 'border-destructive focus-visible:ring-destructive'
            )}
            aria-invalid={!!confirmPasswordError}
            aria-describedby={confirmPasswordError ? 'confirm-password-error' : undefined}
          />
          {confirmPasswordError && (
            <p id="confirm-password-error" className="text-small text-destructive">
              {confirmPasswordError.message}
            </p>
          )}
        </div>
      )}

      <Button
        type="submit"
        className="w-full h-11 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            {mode === 'login' ? 'Signing in...' : 'Creating account...'}
          </>
        ) : (
          mode === 'login' ? 'Sign in' : 'Create account'
        )}
      </Button>
    </form>
  )
}
