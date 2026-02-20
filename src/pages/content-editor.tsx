import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useContentEditor } from '@/hooks/use-content-editor'
import {
  createContentEditor,
  updateContentEditor,
} from '@/lib/content-editor-ops'
import { RichTextEditor } from '@/components/content-editor/rich-text-editor'
import { ContentEditorSidebar } from '@/components/content-editor/content-editor-sidebar'
import { ContentEditorTopbar } from '@/components/content-editor/content-editor-topbar'
import { CommentsMentions } from '@/components/content-editor/comments-mentions'
import { AIPanel } from '@/components/content-editor/ai-panel'
import { PublishControls } from '@/components/content-editor/publish-controls'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import type { Comment } from '@/components/content-editor/comments-mentions'

type SaveStatus = 'saved' | 'saving' | 'unsaved'

export function ContentEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { item, loading, error, refetch } = useContentEditor(id)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('draft')
  const [channel, setChannel] = useState('instagram')
  const [brief, setBrief] = useState('')
  const [researchLinks, setResearchLinks] = useState<string[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [hashtags, setHashtags] = useState<string[]>([])
  const [cta, setCta] = useState('')

  useEffect(() => {
    if (item) {
      setTitle(item.title)
      setContent(item.content_body ?? '')
      setDescription(item.description ?? '')
      setStatus(item.status)
      setChannel(item.channel ?? 'instagram')
    } else if (!id) {
      setTitle('')
      setContent('')
      setDescription('')
      setStatus('draft')
      setChannel('instagram')
    }
  }, [item, id])

  const saveContent = useCallback(async () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    setSaveStatus('saving')
    try {
      if (id) {
        await updateContentEditor(id, {
          title,
          description: description || undefined,
          status,
          content_body: content,
          channel,
        })
        toast.success('Saved')
        refetch()
      } else {
        const created = await createContentEditor({
          title,
          description: description || undefined,
          status,
          content_body: content,
          channel,
        })
        toast.success('Created')
        navigate(`/dashboard/content-editor/${created.id}`, { replace: true })
      }
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaveStatus('saved')
    }
  }, [id, title, description, status, content, channel, refetch, navigate])

  useEffect(() => {
    if (saveStatus !== 'saving') {
      const hasChanges =
        (item && (title !== item.title || content !== (item.content_body ?? ''))) ||
        (!item && (title || content))
      setSaveStatus(hasChanges ? 'unsaved' : 'saved')
    }
  }, [title, content, item, saveStatus])

  const handleStatusChange = useCallback(
    async (newStatus: string) => {
      setStatus(newStatus)
      if (id) {
        try {
          await updateContentEditor(id, { status: newStatus })
          refetch()
        } catch (e) {
          toast.error((e as Error).message)
        }
      }
    },
    [id, refetch]
  )

  const handleAddComment = useCallback((content: string) => {
    setComments((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        author: 'You',
        authorInitials: 'U',
        content,
        resolved: false,
        createdAt: new Date().toLocaleDateString(),
      },
    ])
    toast.success('Comment added')
  }, [])

  const handleResolveComment = useCallback((commentId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, resolved: !c.resolved } : c
      )
    )
  }, [])

  const handleInsertResearch = useCallback((summary: string) => {
    setContent((prev) => prev + '\n\n' + summary)
    toast.success('Research inserted')
  }, [])

  const handleInsertVariant = useCallback((variant: string) => {
    setContent((prev) => prev + '\n\n' + variant)
    toast.success('Variant inserted')
  }, [])

  if (loading && id) {
    return (
      <div className="h-full flex flex-col animate-fade-in">
        <div className="border-b p-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <div className="flex-1 flex gap-4 p-4">
          <Skeleton className="flex-1 h-96" />
          <Skeleton className="w-72 h-96" />
        </div>
      </div>
    )
  }

  if (error && id) {
    return (
      <div className="p-6 animate-fade-in">
        <Card className="border-destructive/30">
          <CardContent className="p-6">
            <p className="text-destructive">{error}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 text-primary hover:underline"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <ContentEditorTopbar
        saveStatus={saveStatus}
        status={status}
        onStatusChange={handleStatusChange}
        onVersionHistoryClick={() => toast.info('Version history coming soon')}
        onAssignClick={() => toast.info('Assign coming soon')}
        onDueDateClick={() => toast.info('Due date coming soon')}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 border-b">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled"
              className="w-full text-h2 font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground focus:ring-0"
              aria-label="Title"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description..."
              className="w-full mt-1 text-small text-muted-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/70 focus:ring-0"
              aria-label="Description"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <RichTextEditor
              value={content}
              onChange={setContent}
              channel={channel}
              placeholder="Start writing your post, script, or outline..."
            />
          </div>
        </div>

        <div className="hidden lg:flex w-72 shrink-0 flex-col border-l overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <ContentEditorSidebar
              brief={brief}
              onBriefChange={setBrief}
              researchLinks={researchLinks}
              onResearchLinksChange={setResearchLinks}
            />
          </div>
        </div>

        <div className="hidden xl:flex w-80 shrink-0 flex-col border-l overflow-hidden">
          <div className="flex-1 overflow-y-auto max-h-[50vh]">
            <CommentsMentions
              comments={comments}
              onAddComment={handleAddComment}
              onResolveComment={handleResolveComment}
            />
          </div>
          <div className="flex-1 overflow-y-auto max-h-[50vh] border-t">
            <AIPanel
              onInsertResearch={handleInsertResearch}
              onInsertVariant={handleInsertVariant}
            />
          </div>
        </div>

        <div className="hidden 2xl:flex w-72 shrink-0 flex-col border-l overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <PublishControls
              onSchedule={(date) => {
                toast.success(`Scheduled for ${date.toLocaleString()}`)
              }}
              onPublish={() => toast.success('Publish initiated')}
              thumbnailUrl={thumbnailUrl}
              tags={tags}
              hashtags={hashtags}
              cta={cta}
              onThumbnailChange={setThumbnailUrl}
              onTagsChange={setTags}
              onHashtagsChange={setHashtags}
              onCtaChange={setCta}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 p-4 border-t bg-card lg:hidden">
        <p className="text-small text-muted-foreground">
          Expand the window to see sidebar, comments, AI panel, and publish controls.
        </p>
        <button
          type="button"
          onClick={saveContent}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-small font-medium hover:bg-primary/90 transition-colors"
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="hidden lg:flex items-center justify-end gap-2 p-4 border-t bg-card">
        <button
          type="button"
          onClick={saveContent}
          className="px-4 py-2 rounded-lg border border-input hover:bg-muted/50 text-small font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={saveContent}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-small font-medium hover:bg-primary/90 transition-colors hover:scale-[1.02] active:scale-[0.98]"
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export default ContentEditorPage
