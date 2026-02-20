import { useState } from 'react'
import {
  Trash2,
  Tag,
  FolderInput,
  Download,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

export interface BulkActionsProps {
  selectedCount: number
  onDelete?: () => void
  onTag?: (tags: string[]) => void
  onMoveToFolder?: (folderId: string) => void
  onExport?: () => void
  isDeleting?: boolean
  isTagging?: boolean
  isExporting?: boolean
  className?: string
}

export function BulkActions({
  selectedCount,
  onDelete,
  onTag,
  onMoveToFolder,
  onExport,
  isDeleting = false,
  isTagging = false,
  isExporting = false,
  className,
}: BulkActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [tagOpen, setTagOpen] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const handleDeleteClick = () => {
    setDeleteOpen(true)
  }

  const confirmDelete = () => {
    onDelete?.()
    setDeleteOpen(false)
  }

  const handleTagClick = () => {
    setTagOpen(true)
  }

  const confirmTag = () => {
    const tags = tagInput
      .split(/[,;]/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
    if (tags.length > 0) {
      onTag?.(tags)
      setTagInput('')
      setTagOpen(false)
    }
  }

  if (selectedCount === 0) return null

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-2 animate-fade-in rounded-lg border border-primary/10 bg-gradient-to-r from-card to-primary/5 px-4 py-2 shadow-sm',
          className
        )}
      >
        <span className="text-small font-medium">
          {selectedCount} selected
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting || isTagging || isExporting}
              className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <MoreHorizontal className="h-4 w-4 mr-1" />
              {isDeleting
                ? 'Deleting...'
                : isTagging
                  ? 'Tagging...'
                  : isExporting
                    ? 'Exporting...'
                    : 'Bulk actions'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[200px]">
            {onTag && (
              <DropdownMenuItem onClick={handleTagClick}>
                <Tag className="h-4 w-4 mr-2" />
                Add tags
              </DropdownMenuItem>
            )}
            {onMoveToFolder && (
              <DropdownMenuItem
                onClick={() => onMoveToFolder('')}
                className="opacity-50 cursor-not-allowed"
                disabled
              >
                <FolderInput className="h-4 w-4 mr-2" />
                Move to folder (coming soon)
              </DropdownMenuItem>
            )}
            {onExport && (
              <DropdownMenuItem
                onClick={onExport}
                disabled={isExporting}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={handleDeleteClick}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected assets?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedCount} asset(s). This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={tagOpen} onOpenChange={setTagOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add tags to selected</AlertDialogTitle>
            <AlertDialogDescription>
              Enter tags separated by commas. These will be added to all{' '}
              {selectedCount} selected asset(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="bulk-tag-input" className="text-small">
              Tags
            </Label>
            <Input
              id="bulk-tag-input"
              placeholder="e.g. hero, banner, social"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  confirmTag()
                }
              }}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isTagging}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmTag}
              disabled={isTagging || !tagInput.trim()}
            >
              {isTagging ? 'Adding...' : 'Add tags'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
