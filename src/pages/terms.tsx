import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-h1 font-bold">Terms of Service</h1>
        <p className="text-muted-foreground mt-2">Last updated: February 2025</p>
        <div className="prose prose-slate dark:prose-invert mt-8 max-w-none">
          <p>
            By using Creator Ops Hub, you agree to these Terms of Service. Please read them carefully.
          </p>
          <h2 className="text-h3 font-semibold mt-8">Acceptable Use</h2>
          <p>
            You agree to use the service in compliance with applicable laws and not to misuse the platform
            or its AI features for harmful or deceptive purposes.
          </p>
          <h2 className="text-h3 font-semibold mt-8">Account Responsibility</h2>
          <p>
            You are responsible for maintaining the security of your account and for all activity that
            occurs under your account.
          </p>
        </div>
        <Button variant="outline" className="mt-8" asChild>
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </div>
  )
}
