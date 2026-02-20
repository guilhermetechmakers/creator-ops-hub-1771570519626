import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useContentEditor } from '@/hooks/use-content-editor'
import {
  createContentEditor,
  updateContentEditor,
} from '@/lib/content-editor-ops'
import { scheduleToQueue } from '@/lib/publishing-queue-ops'
import { researchTopic, factCheckContent } from '@/lib/openclaw-ops'
import type { ResearchResult, FactCheckResult } from '@/lib/openclaw-ops'
import { RichTextEditor } from '@/components/content-editor/rich-text-editor'
import { ContentEditorSidebar } from '@/components/content-editor/content-editor-sidebar'
import { ContentEditorTopbar } from '@/components/content-editor/content-editor-topbar'
import { CommentsMentions } from '@/components/content-editor/comments-mentions'
import { AIPanel } from '@/components/content-editor/ai-panel'
import { PublishControls } from '@/components/content-editor/publish-controls'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { PanelRightOpen } from 'lucide-react'
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
  const [assignee, setAssignee] = useState<string | null>(null)
  const [dueDate, setDueDate] = useState<string | null>(null)
  const [isScheduling, setIsScheduling] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isResearching, setIsResearching] = useState(false)
  const [isFactChecking, setIsFactChecking] = useState(false)
  const [lastResearchResult, setLastResearchResult] =
    useState<ResearchResult | null>(null)

  useEffect(() => {
    if (item) {
      setTitle(item.title)
      setContent(item.content_body ?? '')
      setDescription(item.description ?? '')
      setStatus(item.status)
      setChannel(item.channel ?? 'instagram')
      setDueDate(item.due_date ?? null)
    } else if (!id) {
      setTitle('')
      setContent('')
      setDescription('')
      setStatus('draft')
      setChannel('instagram')
      setDueDate(null)
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
          due_date: dueDate ?? undefined,
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
  }, [id, title, description, status, content, channel, dueDate, refetch, navigate])

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

  const handleFactCheck = useCallback(async (): Promise<FactCheckResult | null> => {
    if (!content.trim()) {
      toast.error('Add content to fact-check')
      return null
    }
    setIsFactChecking(true)
    try {
      const result = await factCheckContent(content, id ?? undefined)
      toast.success('Fact-check complete')
      return result
    } catch (e) {
      toast.error((e as Error).message)
      return null
    } finally {
      setIsFactChecking(false)
    }
  }, [content, id])

  const handleResearch = useCallback(
    async (topic: string): Promise<ResearchResult | null> => {
      if (!topic.trim()) return null
      setIsResearching(true)
      setLastResearchResult(null)
      try {
        const result = await researchTopic(topic, id ?? undefined)
        setLastResearchResult(result)
        toast.success('Research complete')
        return result
      } catch (e) {
        toast.error((e as Error).message)
        return null
      } finally {
        setIsResearching(false)
      }
    },
    [id]
  )

  const handleSchedule = useCallback(
    async (date: Date) => {
      if (!title.trim()) {
        toast.error('Save your content first')
        return
      }
      setIsScheduling(true)
      try {
        let contentId = id
        if (!contentId) {
          const created = await createContentEditor({
            title,
            description: description || undefined,
            status: 'scheduled',
            content_body: content,
            channel,
          })
          contentId = created.id
          navigate(`/dashboard/content-editor/${contentId}`, { replace: true })
        } else {
          await updateContentEditor(contentId, {
            status: 'scheduled',
            content_body: content,
          })
        }
        await scheduleToQueue({
          title,
          description: description || undefined,
          platform: channel,
          scheduledTime: date.toISOString(),
          payload: {
            content_editor_id: contentId,
            content_body: content,
            thumbnail_url: thumbnailUrl,
            tags,
            hashtags,
            cta,
          },
        })
        toast.success(`Scheduled for ${date.toLocaleString()}`)
        refetch()
      } catch (e) {
        toast.error((e as Error).message)
      } finally {
        setIsScheduling(false)
      }
    },
    [
      id,
      title,
      description,
      content,
      channel,
      thumbnailUrl,
      tags,
      hashtags,
      cta,
      refetch,
      navigate,
    ]
  )

  const handlePublish = useCallback(async () => {
    if (!title.trim()) {
      toast.error('Save your content first')
      return
    }
    setIsScheduling(true)
    try {
      let contentId = id
      if (!contentId) {
        const created = await createContentEditor({
          title,
          description: description || undefined,
          status: 'published',
          content_body: content,
          channel,
        })
        contentId = created.id
        navigate(`/dashboard/content-editor/${contentId}`, { replace: true })
      } else {
        await updateContentEditor(contentId, {
          status: 'published',
          content_body: content,
        })
      }
      await scheduleToQueue({
        title,
        description: description || undefined,
        platform: channel,
        scheduledTime: null,
        payload: {
          content_editor_id: contentId,
          content_body: content,
          thumbnail_url: thumbnailUrl,
          tags,
          hashtags,
          cta,
        },
      })
      toast.success('Publish initiated')
      refetch()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setIsScheduling(false)
    }
  }, [
    id,
    title,
    description,
    content,
    channel,
    thumbnailUrl,
    tags,
    hashtags,
    cta,
    refetch,
    navigate,
  ])

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
    <div className="h-full min-h-0 flex flex-col animate-fade-in -m-4 md:-m-6">
      <ContentEditorTopbar
        saveStatus={saveStatus}
        status={status}
        onStatusChange={handleStatusChange}
        assignee={assignee ?? undefined}
        dueDate={dueDate ?? undefined}
        onAssigneeChange={setAssignee}
        onDueDateChange={setDueDate}
        onVersionHistoryClick={() => toast.info('Version history coming soon')}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 border-b">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled"
                className="flex-1 min-w-0 text-h2 font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground focus:ring-0"
                aria-label="Title"
              />
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="rounded-lg border border-input bg-muted/30 px-3 py-1.5 text-small font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Channel"
              >
                <option value="instagram">Instagram</option>
                <option value="x">X</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description..."
              className="w-full text-small text-muted-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/70 focus:ring-0"
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
              onOpenClawResearch={(topic) => handleResearch(topic)}
              onOpenClawFactCheck={() => handleFactCheck()}
              isResearching={isResearching}
              isFactChecking={isFactChecking}
            />
          </div>
        </div>

        <div className="lg:hidden fixed bottom-20 right-4 z-30">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                size="icon"
                className="rounded-full shadow-lg h-12 w-12"
                aria-label="Open sidebar"
              >
                <PanelRightOpen className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0 overflow-hidden">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Sidebar</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                <ContentEditorSidebar
                  brief={brief}
                  onBriefChange={setBrief}
                  researchLinks={researchLinks}
                  onResearchLinksChange={setResearchLinks}
                  onOpenClawResearch={(topic) => handleResearch(topic)}
                  onOpenClawFactCheck={() => handleFactCheck()}
                  isResearching={isResearching}
                  isFactChecking={isFactChecking}
                />
                </div>
              </div>
            </SheetContent>
          </Sheet>
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
              content={content}
              lastResearchResult={lastResearchResult}
              onInsertResearch={handleInsertResearch}
              onInsertVariant={handleInsertVariant}
              onFactCheck={handleFactCheck}
              onResearch={handleResearch}
            />
          </div>
        </div>

        <div className="hidden 2xl:flex w-72 shrink-0 flex-col border-l overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <PublishControls
              title={title}
              content={content}
              channel={channel}
              onSchedule={handleSchedule}
              onPublish={handlePublish}
              thumbnailUrl={thumbnailUrl}
              tags={tags}
              hashtags={hashtags}
              cta={cta}
              onThumbnailChange={setThumbnailUrl}
              onTagsChange={setTags}
              onHashtagsChange={setHashtags}
              onCtaChange={setCta}
              isScheduling={isScheduling}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 p-4 border-t bg-card lg:hidden">
        <p className="text-small text-muted-foreground flex-1">
          Use the sidebar button for brief, research, assets, and templates.
        </p>
        <Button
          type="button"
          onClick={saveContent}
          disabled={saveStatus === 'saving'}
          size="sm"
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <div className="hidden lg:flex items-center justify-end gap-2 p-4 border-t bg-card">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={saveContent}
          disabled={saveStatus === 'saving'}
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}

export default ContentEditorPage
