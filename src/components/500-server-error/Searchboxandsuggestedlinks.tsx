import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  SearchX,
  Home,
  FolderOpen,
  LayoutList,
  FileEdit,
  Calendar,
  BarChart3,
  Settings,
  HelpCircle,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const suggestedLinks = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/dashboard/file-library', icon: FolderOpen, label: 'File Library' },
  { to: '/dashboard/content-studio', icon: LayoutList, label: 'Content Studio' },
  { to: '/dashboard/content-editor', icon: FileEdit, label: 'Content Editor' },
  { to: '/dashboard/research', icon: Search, label: 'Research' },
  { to: '/dashboard/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  { to: '/dashboard/help-and-about', icon: HelpCircle, label: 'Help & About' },
]

/** Empty state when search returns no matching links - per Design Reference: icon, helpful copy, clear CTA */
function SuggestedLinksEmptyState({
  onGoToDashboard,
}: {
  onGoToDashboard: () => void
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="No matching pages found"
      className={cn(
        'flex flex-col items-center justify-center gap-6 rounded-xl',
        'border-2 border-dashed border-muted bg-muted/20 p-6 sm:p-8 text-center',
        'animate-fade-in min-h-[200px] sm:min-h-[240px]'
      )}
    >
      <div className="rounded-2xl bg-muted/50 p-6 ring-1 ring-muted/80">
        <SearchX
          className="h-12 w-12 text-muted-foreground/70"
          aria-hidden
        />
      </div>
      <div className="space-y-2 max-w-[280px]">
        <h3 className="text-base font-semibold text-foreground">
          No matching pages found
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Try a different search term or browse all pages from the dashboard.
        </p>
      </div>
      <Button
        variant="default"
        size="lg"
        onClick={onGoToDashboard}
        aria-label="Go to Dashboard"
        className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      >
        <Home className="h-5 w-5" aria-hidden />
        Go to Dashboard
      </Button>
    </div>
  )
}

export function Searchboxandsuggestedlinks() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const filteredLinks = useCallback(() => {
    if (!query.trim()) return suggestedLinks
    const q = query.toLowerCase()
    return suggestedLinks.filter(
      (link) =>
        link.label.toLowerCase().includes(q) ||
        link.to.toLowerCase().includes(q)
    )
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const links = filteredLinks()
    if (links.length > 0) {
      navigate(links[0].to)
    } else {
      navigate('/dashboard')
    }
  }

  const handleGoToDashboard = () => navigate('/dashboard')
  const links = filteredLinks()
  const isEmpty = links.length === 0

  return (
    <section
      className="w-full max-w-xl mx-auto animate-slide-up opacity-0"
      style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
      aria-labelledby="suggested-links-heading"
    >
      <form onSubmit={handleSubmit} className="relative">
        <Search
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search for a page..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 pr-4 h-12 text-body rounded-xl border-2 border-input focus:border-primary/50 transition-colors duration-200 shadow-card"
          aria-label="Search for a page"
        />
      </form>

      <div className="mt-6">
        <h2
          id="suggested-links-heading"
          className="text-base font-semibold text-foreground mb-3 sm:text-lg"
        >
          Suggested links
        </h2>
        {isEmpty ? (
          <SuggestedLinksEmptyState onGoToDashboard={handleGoToDashboard} />
        ) : (
          <div
            className="grid gap-2 sm:grid-cols-2"
            role="list"
            aria-labelledby="suggested-links-heading"
          >
            {links.map((link, i) => {
              const Icon = link.icon
              return (
                <Button
                  key={link.to}
                  type="button"
                  variant="outline"
                  onClick={() => navigate(link.to)}
                  aria-label={`Navigate to ${link.label}`}
                  className={cn(
                    'h-auto flex items-center gap-3 px-4 py-3 rounded-xl text-left justify-start',
                    'border-border bg-card hover:border-primary/30 hover:bg-primary/5',
                    'transition-all duration-200 hover:scale-[1.02] hover:shadow-card-hover'
                  )}
                  style={{ animationDelay: `${150 + i * 50}ms` }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <span className="font-medium text-foreground">{link.label}</span>
                </Button>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
