import { History, User, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'Review' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
]

export interface ContentEditorTopbarProps {
  saveStatus: 'saved' | 'saving' | 'unsaved'
  status: string
  onStatusChange: (status: string) => void
  assignee?: string
  dueDate?: string
  onVersionHistoryClick?: () => void
  onAssignClick?: () => void
  onDueDateClick?: () => void
  className?: string
}

export function ContentEditorTopbar({
  saveStatus,
  status,
  onStatusChange,
  assignee,
  dueDate,
  onVersionHistoryClick,
  onAssignClick,
  onDueDateClick,
  className,
}: ContentEditorTopbarProps) {
  return (
    <header
      className={cn(
        'flex items-center justify-between gap-4 px-4 py-3 border-b bg-card',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              saveStatus === 'saved' && 'bg-success',
              saveStatus === 'saving' && 'bg-warning animate-pulse',
              saveStatus === 'unsaved' && 'bg-accent'
            )}
          />
          <span className="text-small text-muted-foreground">
            {saveStatus === 'saved' && 'Saved'}
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'unsaved' && 'Unsaved changes'}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <History className="h-4 w-4" />
              Version history
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={onVersionHistoryClick}>
              View all versions
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2">
          <span className="text-small text-muted-foreground">Status</span>
          <Select
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-[140px]"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onAssignClick}
        >
          <User className="h-4 w-4" />
          {assignee ?? 'Assign'}
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onDueDateClick}
        >
          <Calendar className="h-4 w-4" />
          {dueDate ?? 'Due date'}
        </Button>
      </div>
    </header>
  )
}
