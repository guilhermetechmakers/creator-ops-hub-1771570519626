import { useState } from 'react'
import {
  FileText,
  Link2,
  Image,
  FileCode,
  Sparkles,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
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
  className?: string
}

export function ContentEditorSidebar({
  brief = '',
  onBriefChange,
  researchLinks = [],
  onResearchLinksChange,
  className,
}: ContentEditorSidebarProps) {
  const [expandedTabs, setExpandedTabs] = useState<Set<SidebarTab>>(
    new Set(['brief'])
  )

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
  }

  const updateResearchLink = (index: number, value: string) => {
    const next = [...researchLinks]
    next[index] = value
    onResearchLinksChange?.(next)
  }

  const removeResearchLink = (index: number) => {
    onResearchLinksChange?.(researchLinks.filter((_, i) => i !== index))
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
                <CardContent className="pt-0 pb-4 px-3 border-t">
                  {tab === 'brief' && (
                    <Textarea
                      value={brief}
                      onChange={(e) => onBriefChange?.(e.target.value)}
                      placeholder="Add content brief, goals, and key messages..."
                      className="min-h-[120px] text-small"
                    />
                  )}
                  {tab === 'research' && (
                    <div className="space-y-2">
                      {researchLinks.map((link, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            value={link}
                            onChange={(e) =>
                              updateResearchLink(i, e.target.value)
                            }
                            placeholder="https://..."
                            className="text-small"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeResearchLink(i)}
                            aria-label="Remove link"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={addResearchLink}
                      >
                        Add link
                      </Button>
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
                      <Button variant="outline" size="sm" className="w-full">
                        Browse templates
                      </Button>
                    </div>
                  )}
                  {tab === 'openclaw' && (
                    <div className="space-y-2">
                      <p className="text-small text-muted-foreground">
                        AI-powered actions
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
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
