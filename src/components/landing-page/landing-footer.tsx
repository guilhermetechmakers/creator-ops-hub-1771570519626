import { Link } from 'react-router-dom'

const footerLinks = [
  { to: '/login-/-signup?mode=login', label: 'Sign In' },
  { to: '/terms', label: 'Terms' },
  { to: '/privacy-policy', label: 'Privacy' },
  { to: '/cookie-policy', label: 'Cookies' },
  { to: '/help-and-about', label: 'Help' },
  { to: '/help-and-about#contact', label: 'Contact' },
] as const

export function LandingFooter() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <Link
            to="/"
            className="text-h3 font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent transition-opacity hover:opacity-90"
          >
            Creator Ops Hub
          </Link>
          <nav className="flex flex-wrap justify-center gap-6 md:gap-8" aria-label="Footer navigation">
            {footerLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-small text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8 pt-8 border-t border-border/50 text-center">
          <span className="text-small text-muted-foreground">© {new Date().getFullYear()} Creator Ops Hub. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
