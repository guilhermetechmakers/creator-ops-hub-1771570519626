import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface ContentSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  /** Suggested tags from content for quick filter */
  suggestedTags?: string[]
  /** Active tag filters to show as chips */
  activeTags?: string[]
  onTagRemove?: (tag: string) => void
  /** Called when user clicks a suggested tag to add as filter */
  onTagAdd?: (tag: string) => void
}

export function ContentSearch({
  value,
  onChange,
  placeholder = 'Search by title or tags...',
  className,
  suggestedTags = [],
  activeTags = [],
  onTagRemove,
  onTagAdd,
}: ContentSearchProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div
      className={cn(
        'relative flex flex-col gap-2 transition-all duration-200',
        'rounded-lg border border-input bg-background p-2',
        focused && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <Input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pl-0"
          aria-label="Search content by title or tags"
        />
      </div>
      {(activeTags.length > 0 || suggestedTags.length > 0) && (
        <div className="flex flex-wrap gap-2 animate-fade-in">
          {activeTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 pr-1 text-micro cursor-pointer hover:bg-destructive/20 transition-colors"
              onClick={() => onTagRemove?.(tag)}
            >
              {tag}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {suggestedTags
            .filter((t) => !activeTags.includes(t))
            .slice(0, 5)
            .map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-micro cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => (onTagAdd ? onTagAdd(tag) : onChange(value ? `${value} ${tag}` : tag))}
              >
                + {tag}
              </Badge>
            ))}
        </div>
      )}
    </div>
  )
}
