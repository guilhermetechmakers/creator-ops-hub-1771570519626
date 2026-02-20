import { Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface CookieDownloadPrintOptionProps {
  /** Content ref to download - if not provided, uses fallback HTML */
  contentRef?: React.RefObject<HTMLElement | null>
  className?: string
}

const COOKIE_POLICY_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Creator Ops Hub - Cookie Policy</title>
  <style>
    body { font-family: Inter, system-ui, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #1f2933; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.25rem; margin-top: 2rem; margin-bottom: 0.5rem; }
    p { margin-bottom: 1rem; color: #4b5563; }
    .meta { color: #6b7280; font-size: 0.875rem; margin-bottom: 2rem; }
  </style>
</head>
<body>
  <h1>Cookie Policy</h1>
  <p class="meta">Creator Ops Hub | Last updated: February 2025</p>
  <p>Creator Ops Hub uses cookies and similar technologies to provide, secure, and improve our platform. This Cookie Policy describes cookie usage, consent management, and data retention.</p>
  <h2>Types of Cookies</h2>
  <p>We use essential cookies (required for the platform), functional cookies (preferences), and analytics cookies (usage improvement). Non-essential cookies require your consent.</p>
  <h2>Data Collected</h2>
  <p>Cookies may collect session identifiers, preferences, and anonymized usage data. We do not use cookies to collect sensitive personal data beyond what is necessary.</p>
  <h2>Consent Management</h2>
  <p>You can manage cookie preferences through your browser or our consent banner. Essential cookies do not require consent.</p>
  <h2>Retention</h2>
  <p>Session cookies are deleted when you close your browser. Persistent cookies may be retained up to 12 months. After account deletion, cookie data is removed within 90 days.</p>
  <h2>Your Rights</h2>
  <p>You have the right to access, correct, or delete your data. Contact privacy@creatoropshub.com for cookie-related requests.</p>
</body>
</html>`

export function CookieDownloadPrintOption({
  contentRef,
  className,
}: CookieDownloadPrintOptionProps) {
  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const content = contentRef?.current
    const html = content
      ? `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Creator Ops Hub - Cookie Policy</title><style>body{font-family:Inter,sans-serif;padding:2rem;max-width:800px;margin:0 auto;line-height:1.6}</style></head><body>${content.innerHTML}</body></html>`
      : COOKIE_POLICY_HTML
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'creator-ops-hub-cookie-policy.html'
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
        aria-label="Print cookie policy"
      >
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
      <Button
        variant="outline"
        size="default"
        onClick={handleDownload}
        className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:border-primary hover:bg-primary/5"
        aria-label="Download cookie policy"
      >
        <Download className="h-4 w-4 mr-2" />
        Download
      </Button>
    </div>
  )
}
