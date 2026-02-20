export function MessageNotfoundExplanation() {
  return (
    <div className="text-center animate-slide-up opacity-0" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
      <h1 className="text-hero font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        404
      </h1>
      <p className="mt-4 text-h2 font-semibold text-foreground">
        Page not found
      </p>
      <p className="mt-3 text-body text-muted-foreground max-w-md mx-auto leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved. Try searching below or head back to the dashboard.
      </p>
    </div>
  )
}
