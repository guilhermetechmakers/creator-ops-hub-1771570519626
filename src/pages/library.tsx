import { useState } from 'react'
import { Upload, Grid3X3, List, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export function LibraryPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold">File Library</h1>
          <p className="text-muted-foreground mt-1">Manage your assets with tags and versioning</p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </div>

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Upload area */}
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="font-medium">Drag and drop files here</p>
          <p className="text-small text-muted-foreground">or click to browse</p>
        </CardContent>
      </Card>

      {/* Asset grid */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4' : 'space-y-2'}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card
            key={i}
            className="overflow-hidden group cursor-pointer hover:shadow-card-hover transition-all duration-300"
          >
            <div className="aspect-square bg-muted flex items-center justify-center group-hover:bg-muted/80">
              <span className="text-4xl text-muted-foreground">📄</span>
            </div>
            <CardContent className="p-3">
              <p className="font-medium text-small truncate">asset-{i}.png</p>
              <p className="text-micro text-muted-foreground">2 hours ago</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
