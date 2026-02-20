import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type SignupForm = z.infer<typeof signupSchema>

export function SignupPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupForm) => {
    try {
      // TODO: API integration - replace with actual signup call using data.email, data.password
      await new Promise((r) => setTimeout(r, 500))
      toast.success(`Account created! Please check ${data.email} for verification.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      throw err
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-h2">Create your account</CardTitle>
            <CardDescription>
              Get started with Creator Ops Hub
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  aria-label="Email address"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p id="email-error" className="text-small text-destructive" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  aria-label="Password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  {...register('password')}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && (
                  <p id="password-error" className="text-small text-destructive" role="alert">
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
                  aria-label="Confirm password"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                />
                {errors.confirmPassword && (
                  <p id="confirmPassword-error" className="text-small text-destructive" role="alert">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                aria-label={isSubmitting ? 'Creating account, please wait' : 'Create account'}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>
            <div className="mt-4">
              <Button variant="outline" className="w-full" type="button">
                Continue with Google (Gmail + Calendar)
              </Button>
            </div>
            <p className="mt-4 text-center text-small text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login-/-signup?mode=login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
            <p className="mt-2 text-center text-micro text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
