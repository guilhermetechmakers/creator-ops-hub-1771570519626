import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function EmailVerificationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            We've sent a verification link to your email. Click the link to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" disabled>
            Resend (rate-limited)
          </Button>
          <p className="text-micro text-muted-foreground text-center">
            Didn't receive the email? Check your spam folder or try again in a few minutes.
          </p>
          <Link to="/dashboard" className="block">
            <Button variant="outline" className="w-full">Go to dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
