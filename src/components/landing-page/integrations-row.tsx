import { Card, CardContent } from '@/components/ui/card'

const integrations = [
  { name: 'Google' },
  { name: 'Instagram' },
  { name: 'X' },
  { name: 'YouTube' },
  { name: 'Stripe' },
  { name: 'PayPal' },
] as const

export function IntegrationsRow() {
  return (
    <section className="border-y bg-muted/30 py-16" aria-labelledby="integrations-heading">
      <div className="container mx-auto px-4">
        <p id="integrations-heading" className="text-center text-small font-medium text-muted-foreground mb-10 uppercase tracking-wider">
          Integrates with the tools you use
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
          {integrations.map(({ name }, i) => (
            <IntegrationLogo key={name} name={name} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function IntegrationLogo({ name, index }: { name: string; index: number }) {
  const logos: Record<string, React.ReactNode> = {
    Google: (
      <svg viewBox="0 0 24 24" className="h-10 w-10 text-muted-foreground hover:text-foreground transition-colors">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
    Instagram: (
      <svg viewBox="0 0 24 24" className="h-10 w-10 text-muted-foreground hover:text-foreground transition-colors" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    X: (
      <svg viewBox="0 0 24 24" className="h-10 w-10 text-muted-foreground hover:text-foreground transition-colors" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    YouTube: (
      <svg viewBox="0 0 24 24" className="h-10 w-10 text-muted-foreground hover:text-foreground transition-colors" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    Stripe: (
      <svg viewBox="0 0 24 24" className="h-10 w-10 text-muted-foreground hover:text-foreground transition-colors" fill="currentColor">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.549-2.354 1.549-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.571-7.307z" />
      </svg>
    ),
    PayPal: (
      <svg viewBox="0 0 24 24" className="h-10 w-10 text-muted-foreground hover:text-foreground transition-colors" fill="currentColor">
        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .76-.646h6.662c2.153 0 3.686.586 4.607 1.769.92 1.183 1.075 2.653.465 4.41l-.002.003-.143.469h.653c1.733 0 3.086.417 4.062 1.252.976.835 1.463 1.972 1.463 3.41 0 .576-.082 1.107-.246 1.592-.164.485-.39.91-.68 1.274-.29.364-.633.663-1.03.897-.396.234-.834.402-1.313.505-.48.103-.99.155-1.532.155H9.885c-.576 0-1.054-.105-1.434-.314-.38-.21-.658-.5-.834-.872l-2.541 10.293z" />
      </svg>
    ),
  }

  return (
    <Card
      className="flex flex-col items-center justify-center gap-2 p-4 animate-fade-in opacity-0 transition-all duration-300 hover:shadow-card-hover hover:scale-[1.02]"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      <CardContent className="p-4 flex flex-col items-center gap-2 pt-4">
        <span aria-hidden>
          {logos[name] ?? (
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-semibold text-small">
              {name[0]}
            </div>
          )}
        </span>
        <span className="text-micro text-muted-foreground">{name}</span>
      </CardContent>
    </Card>
  )
}
