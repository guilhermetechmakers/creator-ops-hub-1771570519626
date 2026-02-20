import { useState } from 'react'
import { Sparkles, RefreshCw, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface AIPanelProps {
  onInsertResearch?: (summary: string) => void
  onRegenerate?: () => void
  onInsertVariant?: (variant: string) => void
  className?: string
}

export function AIPanel({
  onInsertResearch,
  onRegenerate,
  onInsertVariant,
  className,
}: AIPanelProps) {
  const [prompt, setPrompt] = useState('')
  const [researchSummary, setResearchSummary] = useState('')
  const [variants, setVariants] = useState<string[]>([])

  const handleOpenClawPrompt = () => {
    if (prompt.trim()) {
      setVariants([
        `Variant 1 based on: ${prompt}`,
        `Variant 2 based on: ${prompt}`,
        `Variant 3 based on: ${prompt}`,
      ])
    }
  }

  return (
    <div className={cn('flex flex-col border-t', className)}>
      <div className="flex items-center gap-2 p-4 border-b">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">OpenClaw AI</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card>
          <CardHeader className="p-3">
            <p className="text-small font-medium">OpenClaw prompts</p>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask OpenClaw to expand, shorten, or rewrite..."
              className="min-h-[80px] text-small"
            />
            <Button size="sm" className="w-full gap-2" onClick={handleOpenClawPrompt}>
              <Sparkles className="h-4 w-4" />
              Generate
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3">
            <p className="text-small font-medium">Research summary</p>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            <Textarea
              value={researchSummary}
              onChange={(e) => setResearchSummary(e.target.value)}
              placeholder="Paste or generate research summary..."
              className="min-h-[80px] text-small"
            />
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => onInsertResearch?.(researchSummary)}
            >
              Insert into editor
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 flex flex-row items-center justify-between">
            <p className="text-small font-medium">Regenerate / variants</p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onRegenerate?.()}
              aria-label="Regenerate"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            {variants.length === 0 ? (
              <p className="text-small text-muted-foreground">
                Generate variants using OpenClaw prompts above.
              </p>
            ) : (
              variants.map((v, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-2 rounded-lg border p-2"
                >
                  <p className="text-small flex-1 line-clamp-2">{v}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onInsertVariant?.(v)}
                    aria-label="Insert variant"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
