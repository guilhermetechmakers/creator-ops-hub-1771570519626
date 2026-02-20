export function MessageServerErrorExplanation() {
  return (
    <div
      className="text-center animate-slide-up opacity-0"
      style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}
    >
      <h1 className="text-hero font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        500
      </h1>
      <p className="mt-4 text-h2 font-semibold text-foreground">
        Server error
      </p>
      <p className="mt-3 text-body text-muted-foreground max-w-md mx-auto leading-relaxed">
        Something went wrong on our end. We&apos;re working to fix it. Please try again in a moment, or head back to the dashboard.
      </p>
    </div>
  )
}
