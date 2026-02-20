import { useState } from 'react'
import { Calendar, Image, Hash, Tag, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type ChannelPreview = 'instagram' | 'x' | 'youtube'

export interface PublishControlsProps {
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
  className?: string
}

export function PublishControls({
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
  className,
}: PublishControlsProps) {
  const [previewChannel, setPreviewChannel] =
    useState<ChannelPreview>('instagram')
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

  return (
    <div className={cn('flex flex-col border-t', className)}>
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
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Schedule
          </Button>
          <Button onClick={onPublish} className="gap-2">
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
                    'px-3 py-1.5 rounded-lg text-small font-medium transition-colors',
                    previewChannel === ch
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  {ch === 'x' ? 'X' : ch.charAt(0).toUpperCase() + ch.slice(1)}
                </button>
              ))}
            </div>
            <div className="rounded-lg border bg-muted/30 p-4 min-h-[120px]">
              <p className="text-micro text-muted-foreground mb-2">
                {previewChannel} preview
              </p>
              {thumbnailUrl && (
                <div className="aspect-video bg-muted rounded mb-2 overflow-hidden">
                  <img
                    src={thumbnailUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-small line-clamp-3">
                Content preview will appear here...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
