import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Image, Hash, Tag, ExternalLink, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type ChannelPreview = 'instagram' | 'x' | 'youtube'

export interface PublishControlsProps {
  title?: string
  content?: string
  channel?: string
  onSchedule?: (date: Date) => void
  onPublish?: () => void
  thumbnailUrl?: string
  tags?: string[]
  hashtags?: string[]
  cta?: string
  onThumbnailChange?: (url: string) => void
  onTagsChange?: (tags: string[]) => void
  onHashtagsChange?: (hashtags: string[]) => void
  onCtaChange?: (cta: string) => void
  isScheduling?: boolean
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
      onTagsChange?.([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const addHashtag = () => {
    const value = hashtagInput.trim().replace(/^#/, '')
    if (value) {
      onHashtagsChange?.([...hashtags, value])
      setHashtagInput('')
    }
  }

  const showInstagramWarning =
    platformKey === 'instagram' && !instagramConnected

  return (
    <div className={cn('flex flex-col border-t', className)}>
      {showInstagramWarning && (
        <div className="p-3 mx-4 mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-small">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              Instagram not connected
            </p>
            <p className="text-muted-foreground mt-0.5">
              <Link
                to="/dashboard/integrations"
                className="text-primary hover:underline font-medium"
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
        <div className="flex gap-2">
          <Input
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={() =>
              scheduledDate && onSchedule?.(new Date(scheduledDate))
            }
            disabled={!scheduledDate || isScheduling}
            className="gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
          >
            <Calendar className="h-4 w-4" />
            {isScheduling ? 'Scheduling...' : 'Schedule'}
          </Button>
          <Button
            onClick={onPublish}
            disabled={isScheduling}
            className="gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
          >
            <ExternalLink className="h-4 w-4" />
            Publish now
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card>
          <CardHeader className="p-3">
            <p className="text-small font-medium flex items-center gap-2">
              <Image className="h-4 w-4" />
              Thumbnail
            </p>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <Input
              value={thumbnailUrl}
              onChange={(e) => onThumbnailChange?.(e.target.value)}
              placeholder="https://..."
              className="text-small"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3">
            <p className="text-small font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
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
                className="text-small"
              />
              <Button size="sm" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((t, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-micro"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3">
            <p className="text-small font-medium flex items-center gap-2">
              <Hash className="h-4 w-4" />
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
                className="text-small"
              />
              <Button size="sm" variant="outline" onClick={addHashtag}>
                Add
              </Button>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {hashtags.map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-md bg-primary/10 text-primary px-2 py-0.5 text-micro"
                  >
                    #{h}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3">
            <p className="text-small font-medium">CTA</p>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <Input
              value={cta}
              onChange={(e) => onCtaChange?.(e.target.value)}
              placeholder="Call to action..."
              className="text-small"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3">
            <p className="text-small font-medium">Preview</p>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex gap-2 mb-2">
              {(['instagram', 'x', 'youtube'] as const).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setPreviewChannel(ch)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-small font-medium transition-colors duration-200 hover:scale-[1.02]',
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
                  <div className="aspect-video bg-muted/50 rounded mb-2 flex items-center justify-center">
                    <Image className="h-8 w-8 text-muted-foreground/50" />
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
