import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Image,
  Hash,
  Tag,
  ExternalLink,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type ChannelPreview = 'instagram' | 'x' | 'youtube'

export interface PublishControlsProps {
  title?: string
  content?: string
  channel?: string
  onSchedule?: (date: Date) => void | Promise<void>
  onPublish?: () => void | Promise<void>
  thumbnailUrl?: string
  tags?: string[]
  hashtags?: string[]
  cta?: string
  onThumbnailChange?: (url: string) => void
  onTagsChange?: (tags: string[]) => void
  onHashtagsChange?: (hashtags: string[]) => void
  onCtaChange?: (cta: string) => void
  isScheduling?: boolean
  isPublishing?: boolean
  instagramConnected?: boolean
  className?: string
}

function truncateForPlatform(text: string, platform: ChannelPreview): string {
  if (!text.trim()) return ''
  const maxLen =
    platform === 'x' ? 280 : platform === 'instagram' ? 150 : 500
  const cleaned = text.replace(/\*\*|\*|`/g, '').trim()
  if (cleaned.length <= maxLen) return cleaned
  return cleaned.slice(0, maxLen - 3) + '...'
}

export function PublishControls({
  title = '',
  content = '',
  channel = 'instagram',
  onSchedule,
  onPublish,
  thumbnailUrl = '',
  tags = [],
  hashtags = [],
  cta = '',
  onThumbnailChange,
  onTagsChange,
  onHashtagsChange,
  onCtaChange,
  isScheduling = false,
  isPublishing = false,
  instagramConnected = false,
  className,
}: PublishControlsProps) {
  const platformKey = (['instagram', 'x', 'youtube'] as const).includes(
    channel as ChannelPreview
  )
    ? (channel as ChannelPreview)
    : 'instagram'
  const [previewChannel, setPreviewChannel] =
    useState<ChannelPreview>(platformKey)
  const [scheduledDate, setScheduledDate] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [hashtagInput, setHashtagInput] = useState('')

  const addTag = () => {
    if (tagInput.trim()) {
      const newTag = tagInput.trim()
      onTagsChange?.([...tags, newTag])
      setTagInput('')
      toast.success(`Tag "${newTag}" added`)
    }
  }

  const removeTag = (index: number) => {
    const updated = tags.filter((_, i) => i !== index)
    onTagsChange?.(updated)
    toast.success('Tag removed')
  }

  const addHashtag = () => {
    const value = hashtagInput.trim().replace(/^#/, '')
    if (value) {
      onHashtagsChange?.([...hashtags, value])
      setHashtagInput('')
      toast.success(`Hashtag #${value} added`)
    }
  }

  const removeHashtag = (index: number) => {
    const updated = hashtags.filter((_, i) => i !== index)
    onHashtagsChange?.(updated)
    toast.success('Hashtag removed')
  }

  const isLoading = isScheduling || isPublishing

  const showInstagramWarning =
    platformKey === 'instagram' && !instagramConnected

  return (
    <div
      className={cn('relative flex flex-col border-t', className)}
      aria-busy={isLoading}
      aria-live={isLoading ? 'polite' : undefined}
      aria-label={isLoading ? 'Publish controls loading' : undefined}
    >
      {isLoading && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-background/80 backdrop-blur-sm animate-fade-in"
          role="status"
          aria-live="polite"
          aria-label={isScheduling ? 'Scheduling post' : 'Publishing post'}
        >
          <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
          <p className="text-small font-medium text-foreground">
            {isScheduling ? 'Scheduling...' : 'Publishing...'}
          </p>
          <p className="text-micro text-muted-foreground">
            {isScheduling
              ? 'Your post is being scheduled'
              : 'Your post is being published'}
          </p>
        </div>
      )}
      {showInstagramWarning && (
        <div className="p-3 mx-4 mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" aria-hidden />
          <div className="text-small">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              Instagram not connected
            </p>
            <p className="text-muted-foreground mt-0.5">
              <Link
                to="/dashboard/integrations"
                className="text-primary hover:underline font-medium"
                aria-label="Go to integrations to connect Instagram"
              >
                Connect Instagram
              </Link>{' '}
              to publish directly.
            </p>
          </div>
        </div>
      )}
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-3">Publish</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="flex-1 min-w-0"
            aria-label="Schedule date and time"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                if (!scheduledDate || !onSchedule) return
                const toastId = toast.loading('Scheduling post...')
                try {
                  const result = onSchedule(new Date(scheduledDate))
                  await (result instanceof Promise ? result : Promise.resolve())
                  toast.dismiss(toastId)
                } catch {
                  toast.dismiss(toastId)
                }
              }}
              disabled={!scheduledDate || isLoading}
              className="gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm shrink-0"
              aria-label={
                isLoading
                  ? 'Scheduling post, please wait'
                  : 'Schedule post for later'
              }
            >
              {isScheduling ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Calendar className="h-4 w-4" aria-hidden />
              )}
              {isScheduling ? 'Scheduling...' : 'Schedule'}
            </Button>
            <Button
              onClick={async () => {
                if (!onPublish) return
                const toastId = toast.loading('Publishing post...')
                try {
                  const result = onPublish()
                  await (result instanceof Promise ? result : Promise.resolve())
                  toast.dismiss(toastId)
                } catch {
                  toast.dismiss(toastId)
                }
              }}
              disabled={isLoading}
              className="gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm shrink-0"
              aria-label={
                isLoading
                  ? 'Publishing post, please wait'
                  : 'Publish post now'
              }
            >
              {isPublishing ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <ExternalLink className="h-4 w-4" aria-hidden />
              )}
              {isPublishing ? 'Publishing...' : 'Publish now'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card aria-labelledby="thumbnail-heading">
          <CardHeader className="p-3">
            <p id="thumbnail-heading" className="text-small font-medium flex items-center gap-2">
              <Image className="h-4 w-4" aria-hidden />
              Thumbnail
            </p>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <Input
              value={thumbnailUrl}
              onChange={(e) => onThumbnailChange?.(e.target.value)}
              placeholder="https://..."
              className="text-small"
              aria-label="Thumbnail image URL"
            />
          </CardContent>
        </Card>

        <Card aria-labelledby="tags-heading">
          <CardHeader className="p-3">
            <p id="tags-heading" className="text-small font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" aria-hidden />
              Tags
            </p>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add tag..."
                className="text-small flex-1 min-w-0"
                aria-label="Add tag"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={addTag}
                aria-label="Add tag"
              >
                Add
              </Button>
            </div>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {tags.map((t, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-micro group"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(i)}
                      className="rounded p-0.5 hover:bg-muted-foreground/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`Remove tag ${t}`}
                    >
                      <X className="h-3 w-3" aria-hidden />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div
                role="status"
                aria-label="No tags added yet"
                className={cn(
                  'flex flex-col items-center justify-center gap-3 rounded-lg',
                  'border-2 border-dashed border-muted bg-muted/20 p-6 text-center',
                  'animate-fade-in min-h-[88px] transition-all duration-300'
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                  <Tag className="h-6 w-6 text-muted-foreground/60" aria-hidden />
                </div>
                <div className="space-y-1">
                  <p className="text-small font-medium text-foreground">
                    No tags yet
                  </p>
                  <p className="text-micro text-muted-foreground max-w-[200px]">
                    Add tags to organize your content. Type above and press Add.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card aria-labelledby="hashtags-heading">
          <CardHeader className="p-3">
            <p id="hashtags-heading" className="text-small font-medium flex items-center gap-2">
              <Hash className="h-4 w-4" aria-hidden />
              Hashtags
            </p>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            <div className="flex gap-2">
              <Input
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addHashtag()}
                placeholder="#hashtag"
                className="text-small flex-1 min-w-0"
                aria-label="Add hashtag"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={addHashtag}
                aria-label="Add hashtag"
              >
                Add
              </Button>
            </div>
            {hashtags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {hashtags.map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-2 py-0.5 text-micro group"
                  >
                    #{h}
                    <button
                      type="button"
                      onClick={() => removeHashtag(i)}
                      className="rounded p-0.5 hover:bg-primary/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`Remove hashtag #${h}`}
                    >
                      <X className="h-3 w-3" aria-hidden />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div
                role="status"
                aria-label="No hashtags added yet"
                className={cn(
                  'flex flex-col items-center justify-center gap-3 rounded-lg',
                  'border-2 border-dashed border-muted bg-muted/20 p-6 text-center',
                  'animate-fade-in min-h-[88px] transition-all duration-300'
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/5">
                  <Hash className="h-6 w-6 text-muted-foreground/60" aria-hidden />
                </div>
                <div className="space-y-1">
                  <p className="text-small font-medium text-foreground">
                    No hashtags yet
                  </p>
                  <p className="text-micro text-muted-foreground max-w-[200px]">
                    Add hashtags to improve discoverability. Type above and press Add.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card aria-labelledby="cta-heading">
          <CardHeader className="p-3">
            <p id="cta-heading" className="text-small font-medium">CTA</p>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <Input
              value={cta}
              onChange={(e) => onCtaChange?.(e.target.value)}
              placeholder="Call to action..."
              className="text-small"
              aria-label="Call to action text"
            />
          </CardContent>
        </Card>

        <Card aria-labelledby="preview-heading">
          <CardHeader className="p-3">
            <p id="preview-heading" className="text-small font-medium">Preview</p>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div
              className="flex gap-2 mb-2"
              role="tablist"
              aria-label="Preview platform"
            >
              {(['instagram', 'x', 'youtube'] as const).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  role="tab"
                  aria-selected={previewChannel === ch}
                  aria-label={`Preview as ${ch === 'x' ? 'X' : ch}`}
                  onClick={() => setPreviewChannel(ch)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-small font-medium transition-colors duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    previewChannel === ch
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  {ch === 'x' ? 'X' : ch.charAt(0).toUpperCase() + ch.slice(1)}
                </button>
              ))}
            </div>
            <div
              className={cn(
                'rounded-lg border p-4 min-h-[120px] transition-all duration-200',
                previewChannel === 'instagram' &&
                  'bg-gradient-to-b from-muted/50 to-muted/20',
                previewChannel === 'x' && 'bg-[#000] text-white border-muted',
                previewChannel === 'youtube' &&
                  'bg-[#0f0f0f] text-white border-muted'
              )}
            >
              <p className="text-micro text-muted-foreground mb-2">
                {previewChannel === 'x' ? 'X' : previewChannel} preview
              </p>
              {(previewChannel === 'instagram' || previewChannel === 'youtube') &&
                (thumbnailUrl ? (
                  <div className="aspect-video bg-muted rounded mb-2 overflow-hidden">
                    <img
                      src={thumbnailUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="aspect-video bg-muted/50 rounded mb-2 flex items-center justify-center"
                    aria-label="No thumbnail set"
                  >
                    <Image className="h-8 w-8 text-muted-foreground/50" aria-hidden />
                  </div>
                ))}
              <p
                className={cn(
                  'text-small',
                  previewChannel === 'instagram' && 'line-clamp-4',
                  previewChannel === 'x' && 'line-clamp-4 text-[15px]',
                  previewChannel === 'youtube' && 'line-clamp-3'
                )}
              >
                {truncateForPlatform(
                  content || title || 'Your content will appear here...',
                  previewChannel
                )}
              </p>
              {hashtags.length > 0 && previewChannel !== 'youtube' && (
                <p className="text-micro text-primary mt-2">
                  {hashtags.map((h) => `#${h}`).join(' ')}
                </p>
              )}
              {cta && (
                <p className="text-small font-medium mt-2 text-primary">
                  {cta}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
