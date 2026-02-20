import { Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DownloadPrintOptionProps {
  /** Optional content ref - kept for API compatibility; download uses full document */
  contentRef?: React.RefObject<HTMLElement | null>
  className?: string
}

const PRIVACY_POLICY_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Creator Ops Hub - Privacy Policy</title>
  <style>
    body { font-family: Inter, system-ui, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #1f2933; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.25rem; margin-top: 2rem; margin-bottom: 0.5rem; }
    p { margin-bottom: 1rem; color: #4b5563; }
    .meta { color: #6b7280; font-size: 0.875rem; margin-bottom: 2rem; }
  </style>
</head>
<body>
  <h1>Privacy Policy</h1>
  <p class="meta">Creator Ops Hub | Last updated: February 2025</p>
  <h2>Introduction</h2>
  <p>Creator Ops Hub ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy describes how we collect, use, retain, and protect your information when you use our platform, including our Google integration, AI research features, and content creation tools.</p>
  <h2>Data We Collect</h2>
  <p>We collect information you provide directly (account details, profile information, content you create), data from connected services (Google Calendar, Gmail, YouTube when you authorize integrations), usage data (how you interact with the platform), and technical data (device, browser, IP address). Our AI research feature may process your queries and retain anonymized, aggregated insights for service improvement.</p>
  <h2>Google Integration Scopes</h2>
  <p>When you connect your Google account, we request specific scopes to enable features: Calendar access for scheduling, Gmail for email-based workflows, and YouTube for publishing. We only access data necessary for the features you use. We do not read, store, or share your emails, calendar events, or YouTube data beyond what is required to deliver the requested functionality. You can revoke access at any time from your Google account settings or our Integrations page.</p>
  <h2>How We Use Your Data</h2>
  <p>Your data is used to deliver and improve Creator Ops Hub services, including research, content creation, scheduling, and publishing. We use it to personalize your experience, communicate with you about your account, ensure security, and comply with legal obligations. We do not sell your personal information to third parties.</p>
  <h2>AI Research Retention</h2>
  <p>When you use our AI research features (OpenClaw), we process your queries to generate insights and citations. Research outputs are stored in your account for your reference. We may retain anonymized, aggregated data (stripped of personally identifiable information) for model improvement, analytics, and service optimization. Individual research sessions are not shared with third parties or used for advertising.</p>
  <h2>Data Retention</h2>
  <p>We retain your data for as long as your account is active or as needed to provide services. After account deletion, we delete or anonymize your personal data within 90 days, except where retention is required by law. Aggregated or anonymized data may be retained indefinitely for analytics.</p>
  <h2>Your Rights</h2>
  <p>You have the right to access, correct, export, or delete your personal data. You can manage your data in Settings, request a data export, or contact us to exercise your rights. If you are in the EU/EEA or UK, you have additional rights under GDPR, including the right to object, restrict processing, and lodge a complaint with a supervisory authority.</p>
  <h2>Contact</h2>
  <p>For privacy-related questions, data requests, or to exercise your rights, contact us at privacy@creatoropshub.com. We will respond within 30 days.</p>
</body>
</html>`

export function DownloadPrintOption({
  className,
}: DownloadPrintOptionProps) {
  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Always use complete document for consistent, well-formatted download
    const html = PRIVACY_POLICY_HTML
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'creator-ops-hub-privacy-policy.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className={cn(
        'flex flex-wrap gap-3',
        className
      )}
    >
      <Button
        variant="outline"
        size="default"
        onClick={handlePrint}
        className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:border-primary hover:bg-primary/5 hover:shadow-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Print privacy policy (use Save as PDF in print dialog for PDF)"
      >
        <Printer className="h-4 w-4 mr-2" aria-hidden />
        Print
      </Button>
      <Button
        variant="outline"
        size="default"
        onClick={handleDownload}
        className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:border-primary hover:bg-primary/5 hover:shadow-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Download privacy policy as HTML"
      >
        <Download className="h-4 w-4 mr-2" aria-hidden />
        Download
      </Button>
    </div>
  )
}
