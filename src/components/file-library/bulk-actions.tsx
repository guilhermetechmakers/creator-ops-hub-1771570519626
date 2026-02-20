import { useState } from 'react'
import {
  Trash2,
  Tag,
  FolderInput,
  Download,
  MoreHorizontal,
  FolderPlus,
  FolderOpen,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
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
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { FileFolder } from '@/types/file-library'

export interface BulkActionsProps {
  selectedCount: number
  onDelete?: () => void
  onTag?: (tags: string[]) => void
  onMoveToFolder?: (folderId: string | null) => void
  onExport?: () => void
  folders?: FileFolder[]
  foldersLoading?: boolean
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
  foldersLoading = false,
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
  const [moveCreateError, setMoveCreateError] = useState<string | null>(null)

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
    setMoveCreateError(null)
  }

  const confirmMove = async () => {
    setMoveCreateError(null)
    if (newFolderName.trim() && onCreateFolder) {
      setIsCreatingFolder(true)
      try {
        const folder = await onCreateFolder(newFolderName.trim())
        onMoveToFolder?.(folder.id)
        setMoveOpen(false)
        setNewFolderName('')
      } catch (e) {
        const msg = (e as Error).message
        setMoveCreateError(msg)
        toast.error(msg)
      } finally {
        setIsCreatingFolder(false)
      }
    } else {
      const folderId = moveFolderId === 'uncategorized' ? null : moveFolderId
      onMoveToFolder?.(folderId)
      setMoveOpen(false)
    }
  }

  const handleCreateFolderInline = async () => {
    if (!newFolderName.trim() || !onCreateFolder) return
    setMoveCreateError(null)
    setIsCreatingFolder(true)
    try {
      const folder = await onCreateFolder(newFolderName.trim())
      setMoveFolderId(folder.id)
      setNewFolderName('')
      toast.success('Folder created')
    } catch (e) {
      const msg = (e as Error).message
      setMoveCreateError(msg)
      toast.error(msg)
    } finally {
      setIsCreatingFolder(false)
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
              aria-label="Open bulk actions menu"
              aria-haspopup="menu"
            >
              <MoreHorizontal className="h-4 w-4 mr-1" aria-hidden="true" />
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
          <DropdownMenuContent align="start" className="min-w-[200px]" role="menu">
            {onTag && (
              <DropdownMenuItem
                onClick={handleTagClick}
                role="menuitem"
                aria-label="Add tags to selected assets"
              >
                <Tag className="h-4 w-4 mr-2" aria-hidden="true" />
                Add tags
              </DropdownMenuItem>
            )}
            {onMoveToFolder && (
              <DropdownMenuItem
                onClick={handleMoveClick}
                role="menuitem"
                aria-label="Move selected assets to folder"
              >
                <FolderInput className="h-4 w-4 mr-2" aria-hidden="true" />
                Move to folder
              </DropdownMenuItem>
            )}
            {onExport && (
              <DropdownMenuItem
                onClick={onExport}
                disabled={isExporting}
                role="menuitem"
                aria-label="Export selected assets"
              >
                <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                Export
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={handleDeleteClick}
                className="text-destructive focus:text-destructive"
                role="menuitem"
                aria-label="Delete selected assets"
              >
                <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
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
            <AlertDialogCancel disabled={isDeleting} aria-label="Cancel delete">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              aria-label={isDeleting ? 'Deleting assets' : 'Confirm delete selected assets'}
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
            <AlertDialogCancel disabled={isTagging} aria-label="Cancel add tags">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmTag}
              disabled={isTagging || !tagInput.trim()}
              aria-label={isTagging ? 'Adding tags' : 'Confirm add tags to selected assets'}
            >
              {isTagging ? 'Adding...' : 'Add tags'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={moveOpen}
        onOpenChange={(open) => {
          setMoveOpen(open)
          if (!open) setMoveCreateError(null)
        }}
      >
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
              <div
                className="flex flex-col gap-2 max-h-40 overflow-y-auto rounded-lg border p-2"
                role="listbox"
                aria-label="Available folders"
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={moveFolderId === 'uncategorized'}
                  onClick={() => {
                    setMoveFolderId('uncategorized')
                    setNewFolderName('')
                    setMoveCreateError(null)
                  }}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-left text-small transition-all duration-200 hover:bg-muted',
                    moveFolderId === 'uncategorized' && 'bg-primary/10 text-primary'
                  )}
                >
                  <FolderInput className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Uncategorized
                </button>
                {foldersLoading ? (
                  <>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </>
                ) : folders.length === 0 && !onCreateFolder ? (
                  <div
                    className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-muted-foreground/30 bg-muted/30 px-4 py-6 text-center"
                    role="status"
                  >
                    <FolderOpen className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                    <p className="text-sm font-medium text-muted-foreground">
                      No folders yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Move to Uncategorized above, or ask an admin to create folders.
                    </p>
                  </div>
                ) : (
                  folders.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      role="option"
                      aria-selected={moveFolderId === f.id}
                      onClick={() => {
                        setMoveFolderId(f.id)
                        setNewFolderName('')
                        setMoveCreateError(null)
                      }}
                      className={cn(
                        'flex items-center gap-2 rounded-md px-3 py-2 text-left text-small transition-all duration-200 hover:bg-muted',
                        moveFolderId === f.id && 'bg-primary/10 text-primary'
                      )}
                    >
                      <FolderInput className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {f.name}
                    </button>
                  ))
                )}
              </div>
              {folders.length === 0 && !foldersLoading && onCreateFolder && (
                <p className="text-xs text-muted-foreground">
                  No folders yet. Create one below.
                </p>
              )}
            </div>
            {moveCreateError && (
              <div
                id="move-create-error"
                className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                {moveCreateError}
              </div>
            )}
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
                      setMoveCreateError(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        confirmMove()
                      }
                    }}
                    aria-invalid={!!moveCreateError}
                    aria-describedby={moveCreateError ? 'move-create-error' : undefined}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreateFolderInline}
                    disabled={!newFolderName.trim() || isCreatingFolder}
                    aria-label="Create new folder"
                  >
                    {isCreatingFolder ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <FolderPlus className="h-4 w-4" aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isMoving || isCreatingFolder}
              aria-label="Cancel move to folder"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmMove}
              disabled={isMoving || isCreatingFolder || !canConfirmMove}
              aria-label={
                isMoving || isCreatingFolder ? 'Moving assets' : 'Confirm move to folder'
              }
            >
              {isMoving || isCreatingFolder ? 'Moving...' : 'Move'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
