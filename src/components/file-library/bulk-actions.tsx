import { useState } from 'react'
import {
  Trash2,
  Tag,
  FolderInput,
  Download,
  MoreHorizontal,
  FolderPlus,
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
import type { FileFolder } from '@/types/file-library'

export interface BulkActionsProps {
  selectedCount: number
  onDelete?: () => void
  onTag?: (tags: string[]) => void
  onMoveToFolder?: (folderId: string | null) => void
  onExport?: () => void
  folders?: FileFolder[]
  onCreateFolder?: (name: string) => Promise<FileFolder>
  isDeleting?: boolean
  isTagging?: boolean
  isMoving?: boolean
  isExporting?: boolean
  className?: string
}

export function BulkActions({
  selectedCount,
  onDelete,
  onTag,
  onMoveToFolder,
  onExport,
  folders = [],
  onCreateFolder,
  isDeleting = false,
  isTagging = false,
  isMoving = false,
  isExporting = false,
  className,
}: BulkActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [tagOpen, setTagOpen] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [moveOpen, setMoveOpen] = useState(false)
  const [moveFolderId, setMoveFolderId] = useState<string | 'uncategorized' | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)

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

  const handleMoveClick = () => {
    setMoveOpen(true)
    setMoveFolderId(null)
    setNewFolderName('')
  }

  const confirmMove = () => {
    if (newFolderName.trim() && onCreateFolder) {
      setIsCreatingFolder(true)
      onCreateFolder(newFolderName.trim())
        .then((folder) => {
          onMoveToFolder?.(folder.id)
          setMoveOpen(false)
          setNewFolderName('')
        })
        .finally(() => setIsCreatingFolder(false))
    } else {
      const folderId = moveFolderId === 'uncategorized' ? null : moveFolderId
      onMoveToFolder?.(folderId)
      setMoveOpen(false)
    }
  }

  const canConfirmMove =
    moveFolderId !== null || (newFolderName.trim().length > 0 && !!onCreateFolder)

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
              disabled={isDeleting || isTagging || isMoving || isExporting}
              className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <MoreHorizontal className="h-4 w-4 mr-1" />
              {isDeleting
                ? 'Deleting...'
                : isTagging
                  ? 'Tagging...'
                  : isMoving
                    ? 'Moving...'
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
              <DropdownMenuItem onClick={handleMoveClick}>
                <FolderInput className="h-4 w-4 mr-2" />
                Move to folder
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

      <AlertDialog open={moveOpen} onOpenChange={setMoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to folder</AlertDialogTitle>
            <AlertDialogDescription>
              Choose a folder for {selectedCount} selected asset(s), or create a
              new folder.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-small">Select folder</Label>
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto rounded-lg border p-2">
                <button
                  type="button"
                  onClick={() => {
                    setMoveFolderId('uncategorized')
                    setNewFolderName('')
                  }}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-left text-small transition-all duration-200 hover:bg-muted',
                    moveFolderId === 'uncategorized' && 'bg-primary/10 text-primary'
                  )}
                >
                  <FolderInput className="h-4 w-4 shrink-0" />
                  Uncategorized
                </button>
                {folders.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setMoveFolderId(f.id)
                      setNewFolderName('')
                    }}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-left text-small transition-all duration-200 hover:bg-muted',
                      moveFolderId === f.id && 'bg-primary/10 text-primary'
                    )}
                  >
                    <FolderInput className="h-4 w-4 shrink-0" />
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
            {onCreateFolder && (
              <div className="space-y-2">
                <Label htmlFor="new-folder-name" className="text-small">
                  Or create new folder
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="new-folder-name"
                    placeholder="Folder name"
                    value={newFolderName}
                    onChange={(e) => {
                      setNewFolderName(e.target.value)
                      setMoveFolderId(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        confirmMove()
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (newFolderName.trim()) {
                        setIsCreatingFolder(true)
                        onCreateFolder(newFolderName.trim())
                          .then((folder) => {
                            setMoveFolderId(folder.id)
                            setNewFolderName('')
                          })
                          .finally(() => setIsCreatingFolder(false))
                      }
                    }}
                    disabled={!newFolderName.trim() || isCreatingFolder}
                  >
                    <FolderPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMoving || isCreatingFolder}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmMove}
              disabled={isMoving || isCreatingFolder || !canConfirmMove}
            >
              {isMoving || isCreatingFolder ? 'Moving...' : 'Move'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
