import { useState, useEffect } from 'react'
import { History, User, Calendar, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

const ASSIGNEE_OPTIONS = [
  { value: '', label: 'Unassigned' },
  { value: 'me', label: 'Assign to me' },
]

export interface ContentEditorTopbarProps {
  saveStatus: 'saved' | 'saving' | 'unsaved'
  status: string
  onStatusChange: (status: string) => void
  assignee?: string
  dueDate?: string
  onAssigneeChange?: (assignee: string | null) => void
  onDueDateChange?: (dueDate: string | null) => void
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
  onAssigneeChange,
  onDueDateChange,
  onVersionHistoryClick,
  onAssignClick,
  onDueDateClick,
  className,
}: ContentEditorTopbarProps) {
  const [dueDateInput, setDueDateInput] = useState(
    dueDate ? dueDate.slice(0, 10) : ''
  )
  useEffect(() => {
    setDueDateInput(dueDate ? dueDate.slice(0, 10) : '')
  }, [dueDate])

  const handleDueDateApply = () => {
    if (dueDateInput) {
      onDueDateChange?.(dueDateInput)
    } else {
      onDueDateChange?.(null)
    }
  }

  const formatDueDate = (d: string) => {
    try {
      const date = new Date(d)
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return d
    }
  }

  return (
    <header
      className={cn(
        'flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-b bg-card',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'h-2 w-2 rounded-full shrink-0',
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
            <Button
              variant="outline"
              size="sm"
              className="gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
            >
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
          <span className="text-small text-muted-foreground shrink-0">
            Status
          </span>
          <Select
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-[130px] md:w-[140px]"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
            >
              <User className="h-4 w-4" />
              {assignee === 'me' ? 'Me' : assignee ? (
                <span className="max-w-[80px] truncate">{assignee}</span>
              ) : (
                'Assign'
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[180px]">
            {ASSIGNEE_OPTIONS.map((opt) => {
              const isSelected =
                (opt.value === 'me' && assignee === 'me') ||
                (!opt.value && !assignee)
              return (
                <DropdownMenuItem
                  key={opt.value || 'unassigned'}
                  onClick={() => {
                    onAssigneeChange?.(opt.value || null)
                    onAssignClick?.()
                  }}
                >
                  {isSelected ? (
                    <Check className="h-4 w-4 mr-2 text-primary" />
                  ) : (
                    <span className="w-4 mr-2" />
                  )}
                  {opt.label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
            >
              <Calendar className="h-4 w-4" />
              {dueDate ? formatDueDate(dueDate) : 'Due date'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="p-3 min-w-[220px]">
            <div className="space-y-2">
              <label className="text-small font-medium">Set due date</label>
              <Input
                type="date"
                value={dueDateInput}
                onChange={(e) => setDueDateInput(e.target.value)}
                className="text-small"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setDueDateInput('')
                    onDueDateChange?.(null)
                    onDueDateClick?.()
                  }}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    handleDueDateApply()
                    onDueDateClick?.()
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
