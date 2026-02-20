import { useState, useRef, useCallback } from 'react'
import { Bold, Italic, List, ListOrdered, Code, Type, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

const CHANNEL_TIPS: Record<string, string[]> = {
  instagram: [
    'Use 30 hashtags max for discoverability',
    'Caption limit: 2,200 characters',
    'First line is crucial - it appears before "more"',
  ],
  x: [
    'Character limit: 280 for posts',
    'Threads: number posts (1/10, 2/10) for clarity',
    'Use 2-3 hashtags for engagement',
  ],
  youtube: [
    'Script structure: Hook → Value → CTA',
    'Include timestamps for chapters',
    'First 48 hours matter most for algorithm',
  ],
}

export interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  channel?: string
  placeholder?: string
  className?: string
}

export function RichTextEditor({
  value,
  onChange,
  channel = 'instagram',
  placeholder = 'Start writing...',
  className,
}: RichTextEditorProps) {
  const [mode, setMode] = useState<'visual' | 'markdown'>('visual')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const tips = CHANNEL_TIPS[channel] ?? CHANNEL_TIPS.instagram

  const applyFormat = useCallback(
    (prefix: string, suffix: string = prefix) => {
      const textarea = textareaRef.current
      if (!textarea) return
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const before = value.slice(0, start)
      const selected = value.slice(start, end)
      const newText = before + prefix + selected + suffix + value.slice(end)
      onChange(newText)
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + prefix.length, end + prefix.length)
      }, 0)
    },
    [value, onChange]
  )

  const handleBold = () => applyFormat('**')
  const handleItalic = () => applyFormat('*')
  const handleBulletList = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const before = value.slice(0, start)
    const lineStart = before.lastIndexOf('\n') + 1
    const newText = value.slice(0, lineStart) + '- ' + value.slice(lineStart)
    onChange(newText)
    setTimeout(() => textarea.setSelectionRange(start + 2, start + 2), 0)
  }
  const handleNumberedList = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const before = value.slice(0, start)
    const lineStart = before.lastIndexOf('\n') + 1
    const newText = value.slice(0, lineStart) + '1. ' + value.slice(lineStart)
    onChange(newText)
    setTimeout(() => textarea.setSelectionRange(start + 3, start + 3), 0)
  }
  const handleCode = () => applyFormat('`')

  const channelLabel =
    channel === 'instagram'
      ? 'Instagram'
      : channel === 'x'
        ? 'X (Twitter)'
        : channel === 'youtube'
          ? 'YouTube'
          : channel

  return (
    <div
      className={cn('flex flex-col gap-4 sm:gap-6', className)}
      role="region"
      aria-label="Content editor"
    >
      <section aria-labelledby="editor-toolbar-heading">
        <h2 id="editor-toolbar-heading" className="sr-only">
          Editor toolbar
        </h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 flex-wrap">
          <div
            className="flex items-center gap-1 rounded-lg border border-input bg-muted/30 p-1"
            role="toolbar"
            aria-label="Text formatting"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleBold}
              aria-label="Apply bold formatting"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleItalic}
              aria-label="Apply italic formatting"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleBulletList}
              aria-label="Insert bullet list"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleNumberedList}
              aria-label="Insert numbered list"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleCode}
              aria-label="Insert inline code"
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>
          <div
            className="flex rounded-lg border border-input overflow-hidden"
            role="group"
            aria-label="Editor mode"
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMode('visual')}
              aria-label="Switch to Visual editing mode"
              aria-pressed={mode === 'visual'}
              className={cn(
                'rounded-none flex-1 sm:flex-initial transition-colors duration-200 hover:scale-[1.02] active:scale-[0.98]',
                mode === 'visual'
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                  : 'bg-background hover:bg-muted/50'
              )}
            >
              Visual
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMode('markdown')}
              aria-label="Switch to Markdown editing mode"
              aria-pressed={mode === 'markdown'}
              className={cn(
                'rounded-none flex-1 sm:flex-initial flex items-center gap-1.5 transition-colors duration-200 hover:scale-[1.02] active:scale-[0.98]',
                mode === 'markdown'
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                  : 'bg-background hover:bg-muted/50'
              )}
            >
              <Type className="h-4 w-4" aria-hidden />
              Markdown
            </Button>
          </div>
        </div>
      </section>

      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[280px] sm:min-h-[320px] font-mono text-body resize-y focus-visible:ring-2"
          aria-label="Content text area"
        />
      </div>

      <Card className="animate-fade-in transition-shadow duration-300 hover:shadow-card-hover">
        <CardHeader className="p-4 sm:p-6 pb-0">
          <CardTitle as="h3" className="text-h3 font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" aria-hidden />
            Channel tips for {channelLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-3 sm:pt-4">
          {tips.length > 0 ? (
            <ul className="space-y-2 text-small text-muted-foreground">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="text-primary mt-0.5 shrink-0"
                    aria-hidden
                  >
                    •
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Lightbulb className="h-12 w-12 text-muted-foreground/50 mb-3" aria-hidden />
              <p className="text-small text-muted-foreground">
                No channel-specific tips available for {channelLabel}.
              </p>
              <p className="text-micro text-muted-foreground/80 mt-1">
                Write your content and use the formatting toolbar above.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
