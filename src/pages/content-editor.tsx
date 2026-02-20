import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useContentEditor } from '@/hooks/use-content-editor'
import { invalidateDashboardRelatedCaches } from '@/lib/cache-invalidate'
import { useInstagramIntegration } from '@/hooks/use-instagram-integration'
import {
  createContentEditor,
  updateContentEditor,
  saveContentEditorVersion,
} from '@/lib/content-editor-ops'
import { scheduleToQueue } from '@/lib/publishing-queue-ops'
import { publishToInstagram } from '@/lib/instagram-ops'
import { researchTopic, factCheckContent } from '@/lib/openclaw-ops'
import type { ResearchResult, FactCheckResult } from '@/lib/openclaw-ops'
import { RichTextEditor } from '@/components/content-editor/rich-text-editor'
import { ContentEditorSidebar } from '@/components/content-editor/content-editor-sidebar'
import { ContentEditorTopbar } from '@/components/content-editor/content-editor-topbar'
import { CommentsMentions } from '@/components/content-editor/comments-mentions'
import { AIPanel } from '@/components/content-editor/ai-panel'
import { PublishControls } from '@/components/content-editor/publish-controls'
import { VersionHistorySheet } from '@/components/content-editor/version-history-sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ErrorState } from '@/components/ui/error-state'
import { PanelRightOpen } from 'lucide-react'
import type { Comment } from '@/components/content-editor/comments-mentions'

type SaveStatus = 'saved' | 'saving' | 'unsaved'

export function ContentEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { item, loading, error, refetch } = useContentEditor(id)
  const { connected: instagramConnected } = useInstagramIntegration()

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
  const [isPublishing, setIsPublishing] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isResearching, setIsResearching] = useState(false)
  const [isFactChecking, setIsFactChecking] = useState(false)
  const [lastResearchResult, setLastResearchResult] =
    useState<ResearchResult | null>(null)
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false)

  useEffect(() => {
    document.title = id
      ? `${title || 'Untitled'} | Content Editor | Creator Ops Hub`
      : 'Content Editor | Creator Ops Hub'
    return () => {
      document.title = 'Creator Ops Hub'
    }
  }, [id, title])

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
        try {
          await saveContentEditorVersion(id, content)
        } catch {
          // Non-fatal: version save failed
        }
        toast.success('Saved')
        invalidateDashboardRelatedCaches(queryClient, { bypassEdgeCache: true })
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
        invalidateDashboardRelatedCaches(queryClient, { bypassEdgeCache: true })
        navigate(`/dashboard/content-editor/${created.id}`, { replace: true })
      }
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaveStatus('saved')
    }
  }, [id, title, description, status, content, channel, dueDate, refetch, navigate, queryClient])

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
          invalidateDashboardRelatedCaches(queryClient, { bypassEdgeCache: true })
          refetch()
        } catch (e) {
          toast.error((e as Error).message)
        }
      }
    },
    [id, refetch, queryClient]
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
      setIsPublishing(false)
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
        invalidateDashboardRelatedCaches(queryClient, { bypassEdgeCache: true })
        refetch()
      } catch (e) {
        toast.error((e as Error).message)
      } finally {
        setIsScheduling(false)
        setIsPublishing(false)
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
      queryClient,
    ]
  )

  const handlePublish = useCallback(async () => {
    if (!title.trim()) {
      toast.error('Save your content first')
      return
    }
    if (channel === 'instagram' && !instagramConnected) {
      toast.error('Connect Instagram in Integrations to publish')
      return
    }
    if (channel === 'instagram' && !thumbnailUrl?.trim()) {
      toast.error('Thumbnail URL required for Instagram. Add an image URL in Publish controls.')
      return
    }
    setIsScheduling(true)
    setIsPublishing(true)
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

      if (channel === 'instagram' && instagramConnected) {
        await publishToInstagram({
          content_body: content,
          thumbnail_url: thumbnailUrl || undefined,
          hashtags: hashtags.length > 0 ? hashtags : undefined,
          cta: cta || undefined,
        })
        invalidateDashboardRelatedCaches(queryClient, { bypassEdgeCache: true })
        toast.success('Published to Instagram')
      } else {
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
        invalidateDashboardRelatedCaches(queryClient, { bypassEdgeCache: true })
        toast.success('Publish initiated')
      }
      refetch()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setIsScheduling(false)
      setIsPublishing(false)
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
    instagramConnected,
    refetch,
    navigate,
    queryClient,
  ])

  if (loading && id) {
    return (
      <div
        className="h-full flex flex-col animate-fade-in -m-4 md:-m-6"
        role="status"
        aria-live="polite"
        aria-label="Loading content editor"
      >
        <div className="border-b p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-8 flex-1 min-w-[200px] max-w-md" shimmer />
            <Skeleton className="h-10 w-28" shimmer />
          </div>
          <Skeleton className="h-4 w-48" shimmer />
        </div>
        <div className="flex-1 flex gap-4 p-4 min-h-0">
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <Skeleton className="h-64 w-full rounded-lg" shimmer />
            <Skeleton className="h-32 w-full rounded-lg" shimmer />
          </div>
          <Skeleton className="hidden lg:block w-72 h-96 rounded-lg shrink-0" shimmer />
        </div>
        <div className="flex items-center justify-end gap-2 p-4 border-t">
          <Skeleton className="h-9 w-20" shimmer />
          <Skeleton className="h-9 w-16" shimmer />
        </div>
      </div>
    )
  }

  if (error && id) {
    return (
      <div className="p-4 md:p-6 animate-fade-in" role="alert">
        <ErrorState
          title="Failed to load content"
          description={error}
          onRetry={refetch}
          retryLabel="Retry"
          buttonAriaLabel="Retry loading content editor"
        />
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
        onVersionHistoryClick={() => setVersionHistoryOpen(true)}
      />

      <VersionHistorySheet
        open={versionHistoryOpen}
        onOpenChange={setVersionHistoryOpen}
        contentEditorId={id}
        onRestore={(restored) => setContent(restored)}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 border-b">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled"
                className="flex-1 min-w-0 text-h2 font-bold border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-auto"
                aria-label="Content title"
              />
              <Select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                options={[
                  { value: 'instagram', label: 'Instagram' },
                  { value: 'x', label: 'X' },
                  { value: 'youtube', label: 'YouTube' },
                ]}
                className="w-auto min-w-[120px]"
                aria-label="Publishing channel"
              />
            </div>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description..."
              className="w-full text-small text-muted-foreground border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-auto placeholder:text-muted-foreground/70"
              aria-label="Content description"
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
              isPublishing={isPublishing}
              instagramConnected={instagramConnected}
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
          aria-label={saveStatus === 'saving' ? 'Saving content' : 'Save content'}
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
          aria-label="Cancel and go back"
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={saveContent}
          disabled={saveStatus === 'saving'}
          aria-label={saveStatus === 'saving' ? 'Saving content' : 'Save content'}
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}

export default ContentEditorPage
