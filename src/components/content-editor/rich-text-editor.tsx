import { useState, useRef, useCallback } from 'react'
import { Bold, Italic, List, ListOrdered, Code, Type } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 rounded-lg border border-input bg-muted/30 p-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleBold}
            aria-label="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleItalic}
            aria-label="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleBulletList}
            aria-label="Bullet list"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleNumberedList}
            aria-label="Numbered list"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleCode}
            aria-label="Code"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex rounded-lg border border-input overflow-hidden">
          <button
            type="button"
            onClick={() => setMode('visual')}
            className={cn(
              'px-3 py-1.5 text-small font-medium transition-colors',
              mode === 'visual'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background hover:bg-muted/50'
            )}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => setMode('markdown')}
            className={cn(
              'px-3 py-1.5 text-small font-medium transition-colors flex items-center gap-1.5',
              mode === 'markdown'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background hover:bg-muted/50'
            )}
          >
            <Type className="h-4 w-4" />
            Markdown
          </button>
        </div>
      </div>

      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[320px] font-mono text-body resize-y focus-visible:ring-2"
        />
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-4">
        <p className="text-small font-medium text-muted-foreground mb-2">
          Channel tips ({channel})
        </p>
        <ul className="space-y-1 text-small text-muted-foreground">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
