import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface ContentSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onTagSearch?: (tag: string) => void
}

export function ContentSearch({
  value,
  onChange,
  placeholder = 'Search content by title or tags...',
  className,
}: ContentSearchProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div
      className={cn(
        'relative flex items-center transition-all duration-200',
        'rounded-lg border border-input bg-background',
        focused && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
        className
      )}
    >
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="pl-9 pr-4 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        aria-label="Search content"
      />
    </div>
  )
}
