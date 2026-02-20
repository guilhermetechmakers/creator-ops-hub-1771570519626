import { useState, useEffect } from 'react'
import { Sparkles, RefreshCw, Copy, Search, ShieldCheck, ExternalLink, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ResearchResult, FactCheckResult } from '@/lib/openclaw-ops'

export interface AIPanelProps {
  content?: string
  lastResearchResult?: ResearchResult | null
  onInsertResearch?: (summary: string) => void
  onRegenerate?: () => void
  onInsertVariant?: (variant: string) => void
  onFactCheck?: (content: string) => Promise<FactCheckResult | null>
  onResearch?: (topic: string) => Promise<ResearchResult | null>
  className?: string
}

export function AIPanel({
  content = '',
  lastResearchResult,
  onInsertResearch,
  onRegenerate,
  onInsertVariant,
  onFactCheck,
  onResearch,
  className,
}: AIPanelProps) {
  const [prompt, setPrompt] = useState('')
  const [researchSummary, setResearchSummary] = useState('')
  const [researchSources, setResearchSources] = useState<ResearchResult['sources']>([])
  const [variants, setVariants] = useState<string[]>([])
  const [factCheckResult, setFactCheckResult] = useState<FactCheckResult | null>(null)
  const [isFactChecking, setIsFactChecking] = useState(false)
  const [isResearching, setIsResearching] = useState(false)

  useEffect(() => {
    if (lastResearchResult) {
      setResearchSummary(lastResearchResult.summary)
      setResearchSources(lastResearchResult.sources ?? [])
    }
  }, [lastResearchResult])

  const handleOpenClawPrompt = () => {
    if (prompt.trim()) {
      setVariants([
        `Variant 1 based on: ${prompt}`,
        `Variant 2 based on: ${prompt}`,
        `Variant 3 based on: ${prompt}`,
      ])
      toast.success('Variants generated')
    }
  }

  const handleFactCheck = async () => {
    if (!onFactCheck || !content.trim()) return
    setIsFactChecking(true)
    setFactCheckResult(null)
    try {
      const result = await onFactCheck(content)
      setFactCheckResult(result ?? null)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setIsFactChecking(false)
    }
  }

  const handleResearch = async () => {
    const topic = prompt.trim()
    if (!onResearch || !topic) return
    setIsResearching(true)
    setResearchSummary('')
    setResearchSources([])
    try {
      const result = await onResearch(topic)
      if (result) {
        setResearchSummary(result.summary)
        setResearchSources(result.sources ?? [])
      }
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setIsResearching(false)
    }
  }

  return (
    <div className={cn('flex flex-col border-t', className)}>
      <header className="flex items-center gap-2 p-4 border-b">
        <Sparkles className="h-5 w-5 text-primary" aria-hidden />
        <h1 className="text-lg font-semibold">OpenClaw AI</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card className="transition-all duration-200 hover:shadow-card-hover">
          <CardHeader className="p-3">
            <h2 className="text-small font-medium">OpenClaw prompts</h2>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter topic to research, or ask OpenClaw to expand, shorten, or rewrite..."
              className="min-h-[80px] text-small"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                onClick={handleOpenClawPrompt}
                disabled={!prompt.trim()}
              >
                <Sparkles className="h-4 w-4" />
                Generate
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                onClick={handleResearch}
                disabled={!prompt.trim() || isResearching}
                aria-busy={isResearching}
              >
                {isResearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {isResearching ? 'Researching...' : 'Research'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-card-hover">
          <CardHeader className="p-3 flex flex-row items-center justify-between">
            <h2 className="text-small font-medium">Fact-check draft</h2>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
              onClick={handleFactCheck}
              disabled={!content.trim() || isFactChecking}
              aria-busy={isFactChecking}
            >
              {isFactChecking ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              {isFactChecking ? 'Checking...' : 'Fact-check'}
            </Button>
          </CardHeader>
          {factCheckResult && (
            <CardContent className="p-3 pt-0 space-y-2 border-t">
              <p
                className={cn(
                  'text-small font-medium',
                  factCheckResult.validated ? 'text-success' : 'text-warning'
                )}
              >
                {factCheckResult.validated ? 'Validated' : 'Review findings'}
              </p>
              <ul className="space-y-2">
                {factCheckResult.findings.map((f, i) => (
                  <li
                    key={i}
                    className="rounded-lg border p-2 text-small flex items-start gap-2"
                  >
                    <span
                      className={cn(
                        'shrink-0 w-2 h-2 rounded-full mt-1.5',
                        f.status === 'verified' && 'bg-success',
                        f.status === 'unverified' && 'bg-warning',
                        f.status === 'disputed' && 'bg-destructive'
                      )}
                    />
                    <div>
                      <p>{f.claim}</p>
                      {f.note && (
                        <p className="text-muted-foreground text-micro mt-1">{f.note}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>

        <Card className="transition-all duration-200 hover:shadow-card-hover">
          <CardHeader className="p-3">
            <h2 className="text-small font-medium">Research summary</h2>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            <Textarea
              value={researchSummary}
              onChange={(e) => setResearchSummary(e.target.value)}
              placeholder="Paste or generate research summary via Research button above..."
              className="min-h-[80px] text-small"
            />
            {researchSources.length > 0 && (
              <div className="space-y-1">
                <p className="text-micro font-medium text-muted-foreground">Sources</p>
                {researchSources.slice(0, 3).map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-small text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {s.title || s.url}
                  </a>
                ))}
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              className="w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
              onClick={() => onInsertResearch?.(researchSummary)}
              disabled={!researchSummary.trim()}
            >
              Insert into editor
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-card-hover">
          <CardHeader className="p-3 flex flex-row items-center justify-between">
            <h2 className="text-small font-medium">Regenerate / variants</h2>
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
              <div
                className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 p-6 text-center"
                role="status"
                aria-label="No variants generated yet"
              >
                <div className="rounded-2xl bg-muted/50 p-4">
                  <FileText className="h-12 w-12 text-muted-foreground/70" aria-hidden />
                </div>
                <div className="space-y-1">
                  <p className="text-small font-medium text-foreground">
                    No variants yet
                  </p>
                  <p className="text-micro text-muted-foreground max-w-[200px]">
                    Enter a prompt above and click Generate to create content variants you can insert into your draft.
                  </p>
                </div>
                <p className="text-micro text-muted-foreground">
                  Use the OpenClaw prompts section above to get started.
                </p>
              </div>
            ) : (
              variants.map((v, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-2 rounded-lg border p-2 transition-colors hover:bg-muted/30"
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
