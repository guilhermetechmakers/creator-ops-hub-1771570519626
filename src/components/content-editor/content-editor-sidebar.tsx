import { useState } from 'react'
import {
  FileText,
  Link2,
  Image,
  FileCode,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Search,
  ShieldCheck,
  Loader2,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type SidebarTab = 'brief' | 'research' | 'assets' | 'templates' | 'openclaw'

const TAB_CONFIG: Record<
  SidebarTab,
  { icon: React.ElementType; label: string }
> = {
  brief: { icon: FileText, label: 'Content Brief' },
  research: { icon: Link2, label: 'Research Links' },
  assets: { icon: Image, label: 'Asset Browser' },
  templates: { icon: FileCode, label: 'Templates' },
  openclaw: { icon: Sparkles, label: 'OpenClaw Actions' },
}

export interface ContentEditorSidebarProps {
  brief?: string
  onBriefChange?: (value: string) => void
  researchLinks?: string[]
  onResearchLinksChange?: (links: string[]) => void
  onOpenClawResearch?: (topic: string) => void
  onOpenClawFactCheck?: () => void
  isResearching?: boolean
  isFactChecking?: boolean
  /** When true, shows skeleton loaders for research links (e.g. when fetching from API) */
  isResearchLinksLoading?: boolean
  className?: string
}

export function ContentEditorSidebar({
  brief = '',
  onBriefChange,
  researchLinks = [],
  onResearchLinksChange,
  onOpenClawResearch,
  onOpenClawFactCheck,
  isResearching = false,
  isFactChecking = false,
  isResearchLinksLoading = false,
  className,
}: ContentEditorSidebarProps) {
  const [expandedTabs, setExpandedTabs] = useState<Set<SidebarTab>>(
    new Set(['brief'])
  )
  const [openClawTopic, setOpenClawTopic] = useState('')

  const toggleExpand = (tab: SidebarTab) => {
    setExpandedTabs((prev) => {
      const next = new Set(prev)
      if (next.has(tab)) next.delete(tab)
      else next.add(tab)
      return next
    })
  }

  const addResearchLink = () => {
    onResearchLinksChange?.([...researchLinks, ''])
    toast.success('Research link added')
  }

  const updateResearchLink = (index: number, value: string) => {
    const next = [...researchLinks]
    next[index] = value
    onResearchLinksChange?.(next)
  }

  const removeResearchLink = (index: number) => {
    onResearchLinksChange?.(researchLinks.filter((_, i) => i !== index))
    toast.success('Research link removed')
  }

  return (
    <aside
      className={cn(
        'w-72 shrink-0 border-l bg-card flex flex-col overflow-hidden',
        className
      )}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {(Object.keys(TAB_CONFIG) as SidebarTab[]).map((tab) => {
          const { icon: Icon, label } = TAB_CONFIG[tab]
          const isExpanded = expandedTabs.has(tab)
          return (
            <Card key={tab} className="overflow-hidden">
              <button
                type="button"
                onClick={() => toggleExpand(tab)}
                className="w-full flex items-center gap-2 p-3 text-left hover:bg-muted/30 transition-colors"
                aria-expanded={isExpanded}
                aria-controls={`sidebar-tab-${tab}`}
                id={`sidebar-tab-trigger-${tab}`}
                aria-label={isExpanded ? `Collapse ${label}` : `Expand ${label}`}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <Icon className="h-4 w-4 text-primary" />
                <span className="font-medium text-small">{label}</span>
              </button>
              {isExpanded && (
                <CardContent
                  id={`sidebar-tab-${tab}`}
                  role="region"
                  aria-labelledby={`sidebar-tab-trigger-${tab}`}
                  className="pt-0 pb-4 px-3 border-t"
                >
                  {tab === 'brief' && (
                    <Textarea
                      value={brief}
                      onChange={(e) => onBriefChange?.(e.target.value)}
                      placeholder="Add content brief, goals, and key messages..."
                      className="min-h-[120px] text-small"
                      aria-label="Content brief"
                    />
                  )}
                  {tab === 'research' && (
                    <div className="space-y-2" role="group" aria-label="Research links">
                      {isResearchLinksLoading ? (
                        <div className="space-y-2" role="status" aria-live="polite" aria-label="Loading research links">
                          <Skeleton className="h-9 w-full" shimmer />
                          <Skeleton className="h-9 w-full" shimmer />
                          <Skeleton className="h-9 w-full" shimmer />
                        </div>
                      ) : researchLinks.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-input p-4 text-center">
                          <Link2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" aria-hidden />
                          <p className="text-small text-muted-foreground mb-3">
                            No research links yet. Add URLs to reference when writing or researching.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                            onClick={addResearchLink}
                            aria-label="Add your first research link"
                          >
                            <Link2 className="h-4 w-4 mr-1.5" />
                            Add first link
                          </Button>
                        </div>
                      ) : (
                        <>
                          {researchLinks.map((link, i) => (
                            <div key={i} className="flex gap-2">
                              <Input
                                value={link}
                                onChange={(e) =>
                                  updateResearchLink(i, e.target.value)
                                }
                                placeholder="https://..."
                                className="text-small"
                                aria-label={`Research link ${i + 1}`}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => removeResearchLink(i)}
                                aria-label={`Remove research link ${i + 1}${link ? `: ${link.slice(0, 30)}${link.length > 30 ? '…' : ''}` : ''}`}
                                className="shrink-0 transition-all duration-200 hover:scale-105"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                            onClick={addResearchLink}
                            aria-label="Add another research link"
                          >
                            <Link2 className="h-4 w-4 mr-1.5" />
                            Add link
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                  {tab === 'assets' && (
                    <div className="rounded-lg border border-dashed border-input p-6 text-center text-small text-muted-foreground">
                      <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Drag assets here or browse from library</p>
                    </div>
                  )}
                  {tab === 'templates' && (
                    <div className="space-y-2">
                      <p className="text-small text-muted-foreground">
                        Insert from template pack
                      </p>
                      <Button variant="outline" size="sm" className="w-full" aria-label="Browse templates">
                        Browse templates
                      </Button>
                    </div>
                  )}
                  {tab === 'openclaw' && (
                    <div className="space-y-3">
                      <p className="text-small text-muted-foreground">
                        AI-powered research and fact-checking
                      </p>
                      <div className="space-y-2">
                        <Input
                          value={openClawTopic}
                          onChange={(e) => setOpenClawTopic(e.target.value)}
                          placeholder="Enter topic to research..."
                          className="text-small"
                          aria-label="Topic to research"
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1.5 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                            onClick={() => {
                              if (openClawTopic.trim()) {
                                onOpenClawResearch?.(openClawTopic.trim())
                              }
                            }}
                            disabled={!openClawTopic.trim() || isResearching}
                            aria-busy={isResearching}
                            aria-label={isResearching ? 'Researching topic…' : 'Research topic'}
                          >
                            {isResearching ? (
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                            ) : (
                              <Search className="h-4 w-4" />
                            )}
                            {isResearching ? 'Researching…' : 'Research'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1.5 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                            onClick={() => onOpenClawFactCheck?.()}
                            disabled={isFactChecking}
                            aria-busy={isFactChecking}
                            aria-label={isFactChecking ? 'Fact-checking content…' : 'Fact-check content'}
                          >
                            {isFactChecking ? (
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                            ) : (
                              <ShieldCheck className="h-4 w-4" />
                            )}
                            {isFactChecking ? 'Checking…' : 'Fact-check'}
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                        aria-label="Expand content with OpenClaw AI"
                      >
                        <Sparkles className="h-4 w-4" />
                        Expand with OpenClaw
                      </Button>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </aside>
  )
}
