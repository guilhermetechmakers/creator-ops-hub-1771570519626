import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requestPasswordReset } from '@/lib/password-reset-ops'

const schema = z.object({
  email: z.string().email('Invalid email address'),
})

type FormData = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      await requestPasswordReset(data.email)
      setEmailSent(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reset email')
    }
  }

  if (emailSent) {
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      </div>
      <Card className="relative w-full max-w-md animate-fade-in shadow-card border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
        <CardHeader className="relative">
          <CardTitle className="text-h2 font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Forgot password
          </CardTitle>
          <CardDescription className="text-body">
            Enter your email to receive a reset link
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register('email')}
                className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-small text-destructive mt-1">{errors.email.message}</p>
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
            className="block mt-4 text-center text-small text-primary hover:underline transition-colors duration-200"
          >
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
