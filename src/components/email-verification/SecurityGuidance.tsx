import { Shield, Lock } from 'lucide-react'

export function SecurityGuidance() {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 transition-colors duration-200 hover:bg-muted/40">
      <p className="text-small font-medium text-foreground flex items-center gap-2">
        <Shield className="h-4 w-4 text-primary shrink-0" aria-hidden />
        Security guidance
      </p>
      <ul className="text-micro text-muted-foreground space-y-2">
        <li className="flex items-start gap-2">
          <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
          <span>
            Never share your verification link — it&apos;s unique to your
            account.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
          <span>
            Links expire after 24 hours. Request a new one if needed.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
          <span>
            If you didn&apos;t sign up, you can safely ignore the email.
          </span>
        </li>
      </ul>
    </div>
  )
}
