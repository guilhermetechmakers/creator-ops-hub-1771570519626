import { useState } from 'react'
import { Upload, Grid3X3, List, Search, ImageIcon, FolderSearch } from 'lucide-react'
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
  const [assets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  const filteredAssets = assets.filter(
    (a) =>
      !searchQuery.trim() ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const isFiltered = Boolean(searchQuery.trim()) && assets.length > 0

  const handleRetry = () => {
    setHasError(false)
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 500)
  }

  return (
    <article className="space-y-6 animate-fade-in" aria-labelledby="library-heading">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 id="library-heading" className="text-h1 font-bold text-foreground">
            File Library
          </h1>
          <p className="text-muted-foreground mt-1 text-small">
            Manage your assets with tags and versioning
          </p>
        </div>
        <Button className="hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200">
          <Upload className="h-4 w-4 mr-2" aria-hidden />
          Upload
        </Button>
      </header>

      {/* Search & filters */}
      <section aria-label="Search and filter assets">
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
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors duration-200 cursor-pointer hover:shadow-card">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Upload className="h-12 w-12 text-muted-foreground mb-4" aria-hidden />
          <p className="font-medium">Drag and drop files here</p>
          <p className="text-small text-muted-foreground">or click to browse</p>
        </CardContent>
      </Card>

      {/* Error state */}
      {hasError && (
        <ErrorState
          title="Failed to load assets"
          description="We couldn't load your assets. Please try again."
          onRetry={handleRetry}
        />
      )}

      {/* Loading state */}
      {!hasError && isLoading && (
        <section aria-label="Loading assets" aria-busy="true">
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

      {/* Empty state */}
      {!hasError && !isLoading && filteredAssets.length === 0 && (
        <section aria-label="Asset list" aria-live="polite">
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
                <h2 className="text-body font-semibold text-foreground">
                  {isFiltered ? 'No results found' : 'No assets yet'}
                </h2>
                <p className="text-small text-muted-foreground leading-relaxed">
                  {isFiltered
                    ? `No assets match "${searchQuery}". Try a different search term or clear filters.`
                    : 'Upload your first asset to get started. Drag and drop files above or click to browse.'}
                </p>
              </div>
              {!isFiltered && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Upload className="h-5 w-5" aria-hidden />
                  <span className="text-small">Use the upload area above to add files</span>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Asset grid */}
      {!hasError && !isLoading && filteredAssets.length > 0 && (
        <section aria-label="Asset list">
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
