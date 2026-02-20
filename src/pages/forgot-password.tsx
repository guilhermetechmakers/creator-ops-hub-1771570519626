import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requestPasswordReset } from '@/lib/password-reset-ops'
import { cn } from '@/lib/utils'

const schema = z.object({
  email: z.string().email('Invalid email address'),
})

type FormData = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false)
  const [hasValidationError, setHasValidationError] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    document.title = 'Forgot Password | Creator Ops Hub'
    const metaDesc = document.querySelector('meta[name="description"]')
    const content =
      'Reset your Creator Ops Hub password. Enter your email to receive a secure password reset link.'
    if (metaDesc) {
      metaDesc.setAttribute('content', content)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = content
      document.head.appendChild(meta)
    }
  }, [])

  const onSubmit = async (data: FormData) => {
    setHasValidationError(false)
    try {
      await requestPasswordReset(data.email)
      setEmailSent(true)
      toast.success('Reset link sent! Check your email.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reset email')
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

  if (emailSent) {
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

        <Card className="relative w-full max-w-md animate-fade-in shadow-card border-border overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
          <CardHeader className="relative text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-success/10 p-3">
                <CheckCircle2 className="h-10 w-10 text-success" aria-hidden />
              </div>
            </div>
            <CardTitle className="text-h2 font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Check your email
            </CardTitle>
            <CardDescription className="text-body">
              We&apos;ve sent a password reset link to your email address. The link will expire in 1 hour.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <Link to="/login-/-signup">
              <Button className="w-full h-11 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                Back to sign in
              </Button>
            </Link>
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
              <Mail className="h-10 w-10 text-primary" aria-hidden />
            </div>
          </div>
          <CardTitle className="text-h2 font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Forgot password
          </CardTitle>
          <CardDescription className="text-body">
            Enter your email to receive a secure reset link
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <form onSubmit={handleFormSubmit} className="space-y-4">
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
                <p id="email-error" className="text-small text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-11 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send reset link'}
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
