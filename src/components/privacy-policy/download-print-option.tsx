import { Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DownloadPrintOptionProps {
  /** Content ref to download - if not provided, uses document body */
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
  <p>Creator Ops Hub ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy describes how we collect, use, retain, and protect your information when you use our platform.</p>
  <h2>Data We Collect</h2>
  <p>We collect information you provide directly (account details, profile information, content you create), data from connected services (Google Calendar, Gmail, YouTube when you authorize integrations), usage data, and technical data.</p>
  <h2>Google Integration Scopes</h2>
  <p>When you connect your Google account, we request specific scopes for Calendar, Gmail, and YouTube. We only access data necessary for the features you use. You can revoke access at any time.</p>
  <h2>AI Research Retention</h2>
  <p>We may retain anonymized, aggregated data from AI research for model improvement. Individual research sessions are not shared with third parties.</p>
  <h2>Your Rights</h2>
  <p>You have the right to access, correct, export, or delete your personal data. Contact privacy@creatoropshub.com for requests.</p>
</body>
</html>`

export function DownloadPrintOption({
  contentRef,
  className,
}: DownloadPrintOptionProps) {
  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const content = contentRef?.current
    const html = content
      ? `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Creator Ops Hub - Privacy Policy</title><style>body{font-family:Inter,sans-serif;padding:2rem;max-width:800px;margin:0 auto;line-height:1.6}</style></head><body>${content.innerHTML}</body></html>`
      : PRIVACY_POLICY_HTML
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
        className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:border-primary hover:bg-primary/5"
        aria-label="Print privacy policy"
      >
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
      <Button
        variant="outline"
        size="default"
        onClick={handleDownload}
        className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:border-primary hover:bg-primary/5"
        aria-label="Download privacy policy as PDF"
      >
        <Download className="h-4 w-4 mr-2" />
        Download
      </Button>
    </div>
  )
}
