import { useState, useEffect } from 'react'
import {
  Sparkles,
  RefreshCw,
  Copy,
  Search,
  ShieldCheck,
  ExternalLink,
  Loader2,
  FileText,
  SearchX,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ResearchResult, FactCheckResult } from '@/lib/openclaw-ops'

export interface AIPanelProps {
  content?: string
  lastResearchResult?: ResearchResult | null
  /** When true, shows loading skeleton for research summary (e.g. when parent fetches research) */
  isResearchLoading?: boolean
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
  isResearchLoading = false,
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
  const [factCheckError, setFactCheckError] = useState<string | null>(null)
  const [isFactChecking, setIsFactChecking] = useState(false)
  const [isResearching, setIsResearching] = useState(false)
  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false)

  useEffect(() => {
    if (lastResearchResult) {
      setResearchSummary(lastResearchResult.summary)
      setResearchSources(lastResearchResult.sources ?? [])
    }
  }, [lastResearchResult])

  const handleOpenClawPrompt = () => {
    if (!prompt.trim()) return
    setIsGeneratingVariants(true)
    setVariants([])
    setTimeout(() => {
      setVariants([
        `Variant 1 based on: ${prompt}`,
        `Variant 2 based on: ${prompt}`,
        `Variant 3 based on: ${prompt}`,
      ])
      setIsGeneratingVariants(false)
      toast.success('Variants generated')
    }, 400)
  }

  const handleFactCheck = async () => {
    if (!onFactCheck || !content.trim()) return
    setIsFactChecking(true)
    setFactCheckResult(null)
    setFactCheckError(null)
    try {
      const result = await onFactCheck(content)
      setFactCheckResult(result ?? null)
    } catch (e) {
      const message = (e as Error).message
      setFactCheckError(message)
      toast.error(message)
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
    <div
      className={cn('flex flex-col border-t', className)}
      role="region"
      aria-label="OpenClaw AI assistant panel"
    >
      <header className="flex items-center gap-2 p-4 border-b">
        <Sparkles className="h-5 w-5 text-primary" aria-hidden />
        <h1 className="text-xl font-semibold">OpenClaw AI</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card className="transition-all duration-200 hover:shadow-card-hover">
          <CardHeader className="p-3">
            <h2 className="text-sm font-medium">OpenClaw prompts</h2>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter topic to research, or ask OpenClaw to expand, shorten, or rewrite..."
              className="min-h-[80px] text-small"
              aria-label="OpenClaw prompt or topic to research"
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                size="sm"
                className="flex-1 gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                onClick={handleOpenClawPrompt}
                disabled={!prompt.trim() || isGeneratingVariants}
                aria-busy={isGeneratingVariants}
                aria-label={isGeneratingVariants ? 'Generating variants' : 'Generate content variants from prompt'}
              >
                {isGeneratingVariants ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Sparkles className="h-4 w-4" aria-hidden />
                )}
                {isGeneratingVariants ? 'Generating...' : 'Generate'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                onClick={handleResearch}
                disabled={!prompt.trim() || isResearching}
                aria-busy={isResearching}
                aria-label={isResearching ? 'Researching topic' : 'Research topic'}
              >
                {isResearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Search className="h-4 w-4" aria-hidden />
                )}
                {isResearching ? 'Researching...' : 'Research'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-card-hover">
          <CardHeader className="p-3 flex flex-row items-center justify-between gap-2">
            <h2 id="fact-check-heading" className="text-sm font-medium">Fact-check draft</h2>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm shrink-0"
              onClick={handleFactCheck}
              disabled={!content.trim() || isFactChecking}
              aria-busy={isFactChecking}
              aria-describedby={factCheckError ? 'fact-check-error' : undefined}
              aria-label={isFactChecking ? 'Fact-check in progress' : 'Run fact-check on draft'}
            >
              {isFactChecking ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <ShieldCheck className="h-4 w-4" aria-hidden />
              )}
              {isFactChecking ? 'Checking...' : 'Fact-check'}
            </Button>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-3">
            {factCheckError && (
              <div
                id="fact-check-error"
                role="alert"
                className={cn(
                  'flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4',
                  'animate-fade-in'
                )}
              >
                <AlertCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" aria-hidden />
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-sm font-medium text-foreground">Fact-check failed</p>
                  <p className="text-small text-muted-foreground">{factCheckError}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleFactCheck}
                    disabled={isFactChecking}
                    aria-label="Retry fact-check"
                    className="mt-2"
                  >
                    Try again
                  </Button>
                </div>
              </div>
            )}
            {factCheckResult && !factCheckError && (
              <div className="space-y-2 border-t pt-3">
                <p
                  className={cn(
                    'text-small font-medium',
                    factCheckResult.validated ? 'text-success' : 'text-warning'
                  )}
                >
                  {factCheckResult.validated ? 'Validated' : 'Review findings'}
                </p>
                <ul className="space-y-2" role="list">
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
                        aria-hidden
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
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-card-hover">
          <CardHeader className="p-3">
            <h2 className="text-sm font-medium">Research summary</h2>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            {isResearching || isResearchLoading ? (
              <div
                className="space-y-2"
                role="status"
                aria-label="Loading research results"
                aria-live="polite"
              >
                <Skeleton className="h-20 w-full" shimmer />
                <Skeleton className="h-4 w-3/4" shimmer />
                <Skeleton className="h-4 w-1/2" shimmer />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 flex-1" shimmer />
                </div>
              </div>
            ) : !researchSummary.trim() && researchSources.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 p-6 text-center"
                role="status"
                aria-label="No research summary yet"
              >
                <div className="rounded-2xl bg-muted/50 p-4">
                  <SearchX className="h-12 w-12 text-muted-foreground/70" aria-hidden />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">No research yet</p>
                  <p className="text-sm text-muted-foreground max-w-[220px]">
                    Enter a topic above and click Research to get a summary with sources. You can also paste
                    research here.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                  onClick={handleResearch}
                  disabled={!prompt.trim()}
                  aria-label="Research topic"
                >
                  <Search className="h-4 w-4" aria-hidden />
                  Research topic
                </Button>
              </div>
            ) : (
              <>
                <Textarea
                  value={researchSummary}
                  onChange={(e) => setResearchSummary(e.target.value)}
                  placeholder="Paste or generate research summary via Research button above..."
                  className="min-h-[80px] text-small"
                  aria-label="Research summary"
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
                        aria-label={`Open source: ${s.title || s.url}`}
                      >
                        <ExternalLink className="h-3 w-3" aria-hidden />
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
                  aria-label="Insert research summary into editor"
                >
                  Insert into editor
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-card-hover">
          <CardHeader className="p-3 flex flex-row items-center justify-between">
            <h2 className="text-sm font-medium">Regenerate / variants</h2>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onRegenerate?.()}
              aria-label="Regenerate all content variants"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
            </Button>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            {isGeneratingVariants ? (
              <div className="space-y-2" role="status" aria-label="Loading variants">
                <Skeleton className="h-14 w-full" shimmer />
                <Skeleton className="h-14 w-full" shimmer />
                <Skeleton className="h-14 w-full" shimmer />
              </div>
            ) : variants.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-6 sm:p-8 text-center min-h-[180px]"
                role="status"
                aria-label="No variants generated yet"
                aria-live="polite"
              >
                <div className="rounded-2xl bg-muted/50 p-4">
                  <FileText className="h-12 w-12 text-muted-foreground/70" aria-hidden />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">No variants yet</p>
                  <p className="text-sm text-muted-foreground max-w-[220px]">
                    Enter a prompt above and click Generate to create content variants you can insert into your draft.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                  onClick={handleOpenClawPrompt}
                  disabled={!prompt.trim()}
                  aria-label="Generate content variants from prompt"
                >
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Generate variants
                </Button>
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
                    aria-label={`Insert variant ${i + 1} into editor`}
                  >
                    <Copy className="h-4 w-4" aria-hidden />
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
