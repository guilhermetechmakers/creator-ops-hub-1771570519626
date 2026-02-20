import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PasswordStrengthIndicator,
  getPasswordStrength,
} from '@/components/login-signup/password-strength-indicator'
import { updatePasswordWithToken } from '@/lib/password-reset-ops'
import { cn } from '@/lib/utils'

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

function parseHashParams(): Record<string, string> {
  const hash = window.location.hash?.slice(1)
  if (!hash) return {}
  return hash.split('&').reduce((acc, pair) => {
    const [key, value] = pair.split('=')
    if (key && value) acc[decodeURIComponent(key)] = decodeURIComponent(value)
    return acc
  }, {} as Record<string, string>)
}

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(true)

  const [passwordUpdated, setPasswordUpdated] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const password = watch('password', '')
  const showStrengthIndicator = password.length > 0
  const strength = getPasswordStrength(password)

  useEffect(() => {
    const params = parseHashParams()
    const token = params.access_token
    const type = params.type

    if (type === 'recovery' && token) {
      setAccessToken(token)
    } else {
      setTokenError('Invalid or expired reset link. Please request a new one.')
    }
    setIsValidating(false)
  }, [])

  const onSubmit = async (data: FormData) => {
    if (!accessToken) return
    try {
      await updatePasswordWithToken(accessToken, data.password)
      setPasswordUpdated(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password')
    }
  }

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        </div>
        <Card className="relative w-full max-w-md animate-fade-in shadow-card border-border overflow-hidden">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-muted-foreground">Validating reset link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        </div>
        <Card className="relative w-full max-w-md animate-fade-in shadow-card border-border overflow-hidden">
          <CardHeader className="relative">
            <CardTitle className="text-h2 font-bold text-destructive">Link expired</CardTitle>
            <CardDescription className="text-body">{tokenError}</CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <Link to="/forgot-password">
              <Button className="w-full h-11 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                Request new reset link
              </Button>
            </Link>
            <Link
              to="/login-/-signup"
              className="block text-center text-small text-primary hover:underline"
            >
              Back to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (passwordUpdated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        </div>
        <Card className="relative w-full max-w-md animate-fade-in shadow-card border-border overflow-hidden">
          <CardHeader className="relative">
            <CardTitle className="text-h2 font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
              Password updated
            </CardTitle>
            <CardDescription className="text-body">
              Your password has been updated successfully. You can now sign in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <Button
              className="w-full h-11 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => navigate('/login-/-signup', { replace: true })}
            >
              Sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      </div>
      <Card className="relative w-full max-w-md animate-fade-in shadow-card border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
        <CardHeader className="relative">
          <CardTitle className="text-h2 font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Set new password
          </CardTitle>
          <CardDescription className="text-body">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('password')}
                className={cn(
                  'transition-colors duration-200',
                  errors.password && 'border-destructive focus-visible:ring-destructive'
                )}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? 'password-error' : showStrengthIndicator ? 'password-strength' : undefined
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
                  errors.confirmPassword && 'border-destructive focus-visible:ring-destructive'
                )}
                aria-invalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword && (
                <p className="text-small text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-11 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update password'}
            </Button>
          </form>
          <Link
            to="/login-/-signup"
            className="block mt-4 text-center text-small text-primary hover:underline transition-colors duration-200"
          >
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
