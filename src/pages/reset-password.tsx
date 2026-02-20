import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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

function parseQueryParams(searchParams: URLSearchParams): Record<string, string> {
  const params: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    params[key] = value
  })
  return params
}

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(true)
  const [hasValidationError, setHasValidationError] = useState(false)
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
    document.title = 'Reset Password | Creator Ops Hub'
    const metaDesc = document.querySelector('meta[name="description"]')
    const content =
      'Set a new password for your Creator Ops Hub account. Use the link from your email to reset your password securely.'
    if (metaDesc) {
      metaDesc.setAttribute('content', content)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = content
      document.head.appendChild(meta)
    }
  }, [])

  useEffect(() => {
    const hashParams = parseHashParams()
    const queryParams = parseQueryParams(searchParams)
    const token = hashParams.access_token ?? queryParams.access_token
    const refresh = hashParams.refresh_token ?? queryParams.refresh_token
    const type = hashParams.type ?? queryParams.type

    if (type === 'recovery' && token) {
      setAccessToken(token)
      setRefreshToken(refresh ?? null)
    } else {
      setTokenError('Invalid or expired reset link. Please request a new one.')
    }
    setIsValidating(false)
  }, [searchParams])

  const onSubmit = async (data: FormData) => {
    if (!accessToken) return
    setHasValidationError(false)
    try {
      await updatePasswordWithToken(accessToken, data.password, refreshToken ?? undefined)
      setPasswordUpdated(true)
      toast.success('Password updated successfully!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password')
    }
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setHasValidationError(false)
    handleSubmit(
      onSubmit,
      () => {
        setHasValidationError(true)
      }
    )(e)
  }

  if (isValidating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
        <Link
          to="/"
          className="absolute top-4 left-4 z-10 flex items-center gap-2 text-small text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg px-3 py-2"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to home
        </Link>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent" />
        </div>

        <Card className="relative w-full max-w-md animate-fade-in shadow-card border-border overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
          <CardContent className="relative pt-8 pb-8 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" shimmer />
              <Skeleton className="h-4 w-full" shimmer />
              <Skeleton className="h-4 w-4/5" shimmer />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" shimmer />
              <Skeleton className="h-10 w-full" shimmer />
              <Skeleton className="h-11 w-full" shimmer />
            </div>
            <p className="text-small text-muted-foreground text-center">
              Validating reset link...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (tokenError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
        <Link
          to="/"
          className="absolute top-4 left-4 z-10 flex items-center gap-2 text-small text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg px-3 py-2"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to home
        </Link>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-float-subtle" />
          <div
            className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-accent/10 blur-3xl animate-float-subtle"
            style={{ animationDelay: '-2s' }}
          />
        </div>

        <Card className="relative w-full max-w-md animate-fade-in shadow-card border-border overflow-hidden transition-all duration-300 hover:shadow-card-hover">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
          <CardHeader className="relative text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-10 w-10 text-destructive" aria-hidden />
              </div>
            </div>
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
              className="block text-center text-small text-primary hover:underline transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
        <Link
          to="/"
          className="absolute top-4 left-4 z-10 flex items-center gap-2 text-small text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg px-3 py-2"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to home
        </Link>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-float-subtle" />
          <div
            className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-accent/10 blur-3xl animate-float-subtle"
            style={{ animationDelay: '-2s' }}
          />
        </div>

        <Card className="relative w-full max-w-md animate-fade-in shadow-card border-border overflow-hidden transition-all duration-300 hover:shadow-card-hover">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
          <CardHeader className="relative text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-success/10 p-3">
                <CheckCircle2 className="h-10 w-10 text-success" aria-hidden />
              </div>
            </div>
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <Link
        to="/"
        className="absolute top-4 left-4 z-10 flex items-center gap-2 text-small text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg px-3 py-2"
        aria-label="Back to home"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to home
      </Link>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-float-subtle" />
        <div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-accent/10 blur-3xl animate-float-subtle"
          style={{ animationDelay: '-2s' }}
        />
      </div>

      <Card
        className={cn(
          'relative w-full max-w-md animate-fade-in shadow-card border-border overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:shadow-lg',
          hasValidationError && 'animate-shake'
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
        <CardHeader className="relative text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <KeyRound className="h-10 w-10 text-primary" aria-hidden />
            </div>
          </div>
          <CardTitle className="text-h2 font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Set new password
          </CardTitle>
          <CardDescription className="text-body">
            Enter your new password below. Use at least 8 characters.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <form onSubmit={handleFormSubmit} className="space-y-4">
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
                aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
              />
              {errors.confirmPassword && (
                <p id="confirm-error" className="text-small text-destructive">
                  {errors.confirmPassword.message}
                </p>
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
            className="block mt-4 text-center text-small text-primary hover:underline transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
