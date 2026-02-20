import { useState, useEffect, useCallback } from 'react'
import {
  Upload,
  Grid3X3,
  List,
  Search,
  ImageIcon,
  FolderSearch,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/error-state'
import { cn } from '@/lib/utils'

type Asset = { id: number; name: string; time: string }

export function LibraryPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [inlineError, setInlineError] = useState<string | null>(null)

  const filteredAssets = assets.filter(
    (a) =>
      !searchQuery.trim() ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const isFiltered = Boolean(searchQuery.trim()) && assets.length > 0

  const fetchAssets = useCallback(async () => {
    try {
      setHasError(false)
      setInlineError(null)
      const base = import.meta.env.VITE_API_URL ?? '/api'
      const res = await fetch(`${base}/library/assets`).catch(() => null)
      if (!res?.ok) throw new Error('Failed to load assets')
      const data = await res.json().catch(() => [])
      setAssets(Array.isArray(data) ? data : [])
    } catch {
      setHasError(true)
      setInlineError(
        'Unable to load your assets. Please check your connection and try again.'
      )
    } finally {
      setIsLoading(false)
      setIsRetrying(false)
    }
  }, [])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  const handleRetry = async () => {
    setIsRetrying(true)
    setIsLoading(true)
    setHasError(false)
    setInlineError(null)
    await fetchAssets()
  }

  const handleUpload = () => {
    if (isUploading) return
    setIsUploading(true)
    setInlineError(null)
    setTimeout(() => {
      setAssets((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: `Asset ${prev.length + 1}`,
          time: new Date().toLocaleDateString(),
        },
      ])
      setIsUploading(false)
    }, 1500)
  }

  return (
    <article className="space-y-6 animate-fade-in" aria-labelledby="library-heading">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 id="library-heading" className="text-h1 font-bold text-foreground">
            File Library
          </h1>
          <h2 className="text-body font-normal text-muted-foreground mt-1 text-small">
            Manage your assets with tags and versioning
          </h2>
        </div>
        <Button
          onClick={handleUpload}
          disabled={isUploading}
          aria-busy={isUploading}
          aria-label={isUploading ? 'Uploading files' : 'Upload files'}
          className="hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />
          ) : (
            <Upload className="h-4 w-4 mr-2" aria-hidden />
          )}
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </header>

      {/* Inline error feedback */}
      {inlineError && !hasError && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-small animate-fade-in"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" aria-hidden />
          <p className="text-destructive flex-1">{inlineError}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setInlineError(null)}
            aria-label="Dismiss error"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Search & filters */}
      <section aria-label="Search and filter assets">
        <h2 className="sr-only">Search and filter assets</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              aria-label="Search assets"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Upload area */}
      <Card
        role="button"
        tabIndex={0}
        onClick={handleUpload}
        onKeyDown={(e) => e.key === 'Enter' && handleUpload()}
        aria-label="Upload area - drag and drop or click to add files"
        aria-busy={isUploading}
        className={cn(
          'border-dashed border-2 transition-colors duration-200 cursor-pointer hover:shadow-card',
          isUploading
            ? 'border-primary/50 bg-primary/5 pointer-events-none'
            : 'hover:border-primary/50'
        )}
      >
        <CardContent className="flex flex-col items-center justify-center py-16">
          {isUploading ? (
            <Loader2 className="h-12 w-12 text-primary mb-4 animate-spin" aria-hidden />
          ) : (
            <Upload className="h-12 w-12 text-muted-foreground mb-4" aria-hidden />
          )}
          <p className="font-medium">
            {isUploading ? 'Uploading...' : 'Drag and drop files here'}
          </p>
          <p className="text-small text-muted-foreground">
            {isUploading ? 'Please wait' : 'or click to browse'}
          </p>
        </CardContent>
      </Card>

      {/* Error state */}
      {hasError && (
        <ErrorState
          title="Failed to load assets"
          description="We couldn't load your assets. Please try again."
          onRetry={handleRetry}
          isRetrying={isRetrying}
        />
      )}

      {/* Loading state */}
      {!hasError && isLoading && (
        <section aria-label="Loading assets" aria-busy="true">
          <h2 className="sr-only">Assets</h2>
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'
                : 'space-y-2'
            )}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton
                key={i}
                className={viewMode === 'grid' ? 'aspect-square rounded-xl' : 'h-16 rounded-lg'}
                shimmer
                aria-hidden
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty state - always render when no items */}
      {!hasError && !isLoading && filteredAssets.length === 0 && (
        <section aria-label="Asset list" aria-live="polite">
          <h2 className="sr-only">Assets</h2>
          <Card
            className="overflow-hidden border-dashed border-2 border-muted-foreground/30 animate-fade-in transition-shadow duration-200 hover:shadow-card"
            role="status"
          >
            <CardContent className="flex flex-col items-center justify-center gap-6 py-16 px-8 min-h-[280px]">
              <div className="rounded-2xl bg-muted/50 p-8 ring-1 ring-muted/80 flex items-center justify-center">
                {isFiltered ? (
                  <FolderSearch className="h-16 w-16 text-muted-foreground/70" aria-hidden />
                ) : (
                  <ImageIcon className="h-16 w-16 text-muted-foreground/70" aria-hidden />
                )}
              </div>
              <div className="text-center space-y-2 max-w-sm">
                <h3 className="text-body font-semibold text-foreground">
                  {isFiltered ? 'No results found' : 'No assets yet'}
                </h3>
                <p className="text-small text-muted-foreground leading-relaxed">
                  {isFiltered
                    ? `No assets match "${searchQuery}". Try a different search term or clear filters.`
                    : 'Upload your first asset to get started. Drag and drop files above or click to browse.'}
                </p>
              </div>
              {!isFiltered && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="mt-2"
                >
                  <Upload className="h-4 w-4 mr-2" aria-hidden />
                  Upload your first asset
                </Button>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Asset grid */}
      {!hasError && !isLoading && filteredAssets.length > 0 && (
        <section aria-label="Asset list">
          <h2 className="sr-only">Assets</h2>
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'
                : 'space-y-2'
            )}
          >
            {filteredAssets.map((asset) => (
              <Card
                key={asset.id}
                className="overflow-hidden group cursor-pointer hover:shadow-card-hover transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="aspect-square bg-muted flex items-center justify-center group-hover:bg-muted/80">
                  <span className="text-4xl text-muted-foreground" aria-hidden>📄</span>
                </div>
                <CardContent className="p-3">
                  <p className="font-medium text-small truncate">{asset.name}</p>
                  <p className="text-micro text-muted-foreground">{asset.time}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
