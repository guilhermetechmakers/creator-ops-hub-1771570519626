import { Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface TermsDownloadPrintOptionProps {
  /** Content ref to download - if not provided, uses fallback HTML */
  contentRef?: React.RefObject<HTMLElement | null>
  className?: string
}

const TERMS_OF_SERVICE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Creator Ops Hub - Terms of Service</title>
  <style>
    body { font-family: Inter, system-ui, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #1f2933; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.25rem; margin-top: 2rem; margin-bottom: 0.5rem; }
    p { margin-bottom: 1rem; color: #4b5563; }
    .meta { color: #6b7280; font-size: 0.875rem; margin-bottom: 2rem; }
  </style>
</head>
<body>
  <h1>Terms of Service</h1>
  <p class="meta">Creator Ops Hub | Last updated: February 2025</p>
  <p>By accessing or using Creator Ops Hub, you agree to be bound by these Terms of Service. These terms govern platform usage, content ownership, AI usage, data handling, Google integration scopes, and your rights.</p>
  <h2>Platform Usage</h2>
  <p>You agree to use Creator Ops Hub in compliance with applicable laws and not to misuse the platform or its AI features for harmful or deceptive purposes.</p>
  <h2>Content Ownership</h2>
  <p>You retain ownership of content you create. By using our platform, you grant us a limited license to store, process, and display your content solely to provide our services.</p>
  <h2>AI Usage Disclaimers</h2>
  <p>Our AI tools are provided "as is." AI outputs may contain errors or inaccuracies. You are responsible for reviewing AI-generated content before use.</p>
  <h2>Google Integration Scopes</h2>
  <p>When you connect your Google account, we request specific scopes for Calendar, Gmail, and YouTube. We only access data necessary for the features you use.</p>
  <h2>Your Rights</h2>
  <p>You have the right to access, correct, export, or delete your personal data. Contact legal@creatoropshub.com or privacy@creatoropshub.com for requests.</p>
</body>
</html>`

export function TermsDownloadPrintOption({
  contentRef,
  className,
}: TermsDownloadPrintOptionProps) {
  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const content = contentRef?.current
    const html = content
      ? `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Creator Ops Hub - Terms of Service</title><style>body{font-family:Inter,sans-serif;padding:2rem;max-width:800px;margin:0 auto;line-height:1.6}</style></head><body>${content.innerHTML}</body></html>`
      : TERMS_OF_SERVICE_HTML
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'creator-ops-hub-terms-of-service.html'
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
        aria-label="Print terms of service"
      >
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
      <Button
        variant="outline"
        size="default"
        onClick={handleDownload}
        className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:border-primary hover:bg-primary/5"
        aria-label="Download terms of service"
      >
        <Download className="h-4 w-4 mr-2" />
        Download
      </Button>
    </div>
  )
}
