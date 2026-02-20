import { useState, useMemo, useEffect, useRef } from 'react'
import { Search, BookOpen, Code, Coins, RotateCcw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { DocItem } from '@/types/help-and-about'

const DOCS: DocItem[] = [
  {
    id: '1',
    title: 'Getting Started with Creator Ops Hub',
    category: 'onboarding',
    slug: 'getting-started',
    content:
      'Welcome to Creator Ops Hub! Start by connecting your social accounts, creating your first content project, and exploring the content studio. Use the dashboard to track usage and analytics.',
  },
  {
    id: '2',
    title: 'Content Studio Workflow',
    category: 'onboarding',
    slug: 'content-studio',
    content:
      'Create, schedule, and publish content across platforms. Use the content editor for AI-assisted writing, the file library for assets, and the calendar for scheduling.',
  },
  {
    id: '3',
    title: 'API Overview',
    category: 'api',
    slug: 'api-overview',
    content:
      'Creator Ops Hub provides a REST API for programmatic access. Base URL: /api/v1. Authenticate with Bearer tokens. Endpoints include content, analytics, and integrations.',
  },
  {
    id: '4',
    title: 'API Authentication',
    category: 'api',
    slug: 'api-auth',
    content:
      'Obtain an API key from Settings > Security. Include it in the Authorization header: Bearer YOUR_API_KEY. Keys can be revoked at any time.',
  },
  {
    id: '5',
    title: 'OpenClaw Credits Explained',
    category: 'credits',
    slug: 'openclaw-credits',
    content:
      'OpenClaw credits power AI features like content generation. Each plan includes a monthly allowance. Credits are consumed per AI request. Unused credits do not roll over.',
  },
  {
    id: '6',
    title: 'Managing Credits & Usage',
    category: 'credits',
    slug: 'credits-usage',
    content:
      'View your usage in Settings > Billing. Upgrade your plan for more credits. Enterprise plans include custom credit allocation.',
  },
]

const CATEGORY_LABELS: Record<DocItem['category'], string> = {
  onboarding: 'Onboarding',
  api: 'API Docs',
  credits: 'OpenClaw Credits',
}

const CATEGORY_ICONS: Record<DocItem['category'], typeof BookOpen> = {
  onboarding: BookOpen,
  api: Code,
  credits: Coins,
}

const DEBOUNCE_MS = 300

export interface SearchableDocsProps {
  /** Optional id for the section heading (accessibility) */
  headingId?: string
}

export function SearchableDocs({ headingId }: SearchableDocsProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<DocItem['category'] | 'all'>('all')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query)
      debounceRef.current = null
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const filtered = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim()
    return DOCS.filter((doc) => {
      const matchQuery =
        !q ||
        doc.title.toLowerCase().includes(q) ||
        doc.content.toLowerCase().includes(q) ||
        doc.category.toLowerCase().includes(q)
      const matchCategory =
        selectedCategory === 'all' || doc.category === selectedCategory
      return matchQuery && matchCategory
    })
  }, [debouncedQuery, selectedCategory])

  return (
    <Card className="overflow-hidden animate-fade-in border-primary/10 bg-gradient-to-br from-card to-primary/5 transition-all duration-300 hover:shadow-card-hover hover:border-primary/20">
      <CardHeader className="border-b border-border/50 bg-muted/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle as="h2" id={headingId} className="flex items-center gap-2 text-h2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Search className="h-5 w-5 text-primary" />
            </div>
            Searchable Documentation
          </CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search docs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              aria-label="Search documentation"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {(['all', 'onboarding', 'api', 'credits'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              aria-pressed={selectedCategory === cat}
              aria-label={`Filter by ${cat === 'all' ? 'all categories' : CATEGORY_LABELS[cat]}`}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground shadow hover:bg-primary/90'
                  : 'bg-secondary/80 text-secondary-foreground hover:bg-secondary'
              )}
            >
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
              <Search className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium">No docs match your search</p>
            <p className="text-small text-muted-foreground mt-1">
              Try a different query or category
            </p>
            <Button
              variant="default"
              size="default"
              onClick={() => {
                setQuery('')
                setSelectedCategory('all')
              }}
              className="mt-6 gap-2 shadow-md hover:shadow-lg transition-shadow"
              aria-label="Clear search and view all docs"
            >
              <RotateCcw className="h-4 w-4" />
              Clear search & view all docs
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            {filtered.map((doc, i) => {
              const Icon = CATEGORY_ICONS[doc.category]
              return (
                <li
                  key={doc.id}
                  className="animate-fade-in px-6 py-4 transition-all duration-200 hover:bg-muted/30 border-l-4 border-l-transparent hover:border-l-primary/40 [animation-fill-mode:forwards]"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-micro font-medium text-primary">
                        {CATEGORY_LABELS[doc.category]}
                      </span>
                      <h3 className="font-semibold text-foreground mt-0.5">
                        {doc.title}
                      </h3>
                      <p className="text-small text-muted-foreground mt-1 line-clamp-2">
                        {doc.content}
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
