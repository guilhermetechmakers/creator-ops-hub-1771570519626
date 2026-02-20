import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Home, FolderOpen, LayoutList, FileEdit, Search as SearchIcon, Calendar, BarChart3, Settings, HelpCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const suggestedLinks = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/dashboard/file-library', icon: FolderOpen, label: 'File Library' },
  { to: '/dashboard/content-studio', icon: LayoutList, label: 'Content Studio' },
  { to: '/dashboard/content-editor', icon: FileEdit, label: 'Content Editor' },
  { to: '/dashboard/research', icon: SearchIcon, label: 'Research' },
  { to: '/dashboard/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  { to: '/dashboard/help-and-about', icon: HelpCircle, label: 'Help & About' },
]

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

  const links = filteredLinks()

  return (
    <div className="w-full max-w-xl mx-auto animate-slide-up opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Search for a page..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 pr-4 h-12 text-body rounded-xl border-2 focus:border-primary/50 transition-colors duration-200 shadow-card"
          aria-label="Search for a page"
        />
      </form>

      <div className="mt-6">
        <p className="text-small font-medium text-muted-foreground mb-3" id="suggested-links-label">
          Suggested links
        </p>
        <div
          className="grid gap-2 sm:grid-cols-2"
          role="list"
          aria-labelledby="suggested-links-label"
        >
          {links.map((link, i) => {
            const Icon = link.icon
            return (
              <button
                key={link.to}
                type="button"
                onClick={() => navigate(link.to)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-left',
                  'border border-border bg-card hover:border-primary/30 hover:bg-primary/5',
                  'transition-all duration-200 hover:scale-[1.02] hover:shadow-card-hover',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                )}
                style={{ animationDelay: `${150 + i * 50}ms` }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-medium text-foreground">{link.label}</span>
              </button>
            )
          })}
        </div>
        {links.length === 0 && (
          <p className="text-muted-foreground text-small py-4">
            No matching pages. Try a different search or go to the dashboard.
          </p>
        )}
      </div>
    </div>
  )
}
