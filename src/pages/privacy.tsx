import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-h1 font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2">Last updated: February 2025</p>
        <div className="prose prose-slate dark:prose-invert mt-8 max-w-none">
          <p>
            Creator Ops Hub respects your privacy. We collect and use your data to provide our services,
            improve your experience, and communicate with you about your account.
          </p>
          <h2 className="text-h3 font-semibold mt-8">Data We Collect</h2>
          <p>
            We collect information you provide directly, including account details, content you create,
            and integration data (e.g., Gmail, Calendar) when you connect these services.
          </p>
          <h2 className="text-h3 font-semibold mt-8">How We Use Your Data</h2>
          <p>
            Your data is used to deliver the Creator Ops Hub service, including research, content creation,
            scheduling, and publishing. We do not sell your personal information.
          </p>
        </div>
        <Button variant="outline" className="mt-8" asChild>
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </div>
  )
}
