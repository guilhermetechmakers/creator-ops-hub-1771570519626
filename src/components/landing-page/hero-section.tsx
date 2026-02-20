import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, FileEdit, FolderOpen, Play, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-heading">
      {/* Animated gradient background - uses design tokens */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent animate-pulse"
        style={{ animationDuration: '4s' }}
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent animate-pulse"
        style={{ animationDuration: '5s', animationDelay: '1s' }}
      />

      <div className="container relative mx-auto px-4 py-24 md:py-32 lg:py-40">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <div className="mx-auto max-w-2xl lg:max-w-none text-center lg:text-left animate-slide-up">
            <h1
              id="hero-heading"
              className="text-hero font-bold tracking-tight md:text-hero-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            >
              One workspace for creators
            </h1>
            <h2 className="mt-6 text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Centralize assets, research, and multi-platform publishing.
            </h2>
            <p className="mt-4 text-body text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              From idea to published content—faster, with full traceability.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="text-base px-8 py-6 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                asChild
              >
                <Link to="/login-/-signup?mode=signup" aria-label="Get started with Creator Ops Hub">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 py-6 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border-2"
                asChild
              >
                <Link to="#feature-highlights" className="flex items-center gap-2" aria-label="View product tour and feature highlights">
                  <Play className="h-5 w-5" aria-hidden />
                  Tour
                </Link>
              </Button>
            </div>
          </div>

          {/* Hero illustration - workflow: library -> research -> editor -> calendar */}
          <div
            className="relative flex justify-center lg:justify-end animate-fade-in"
            style={{ animationDelay: '200ms' }}
            aria-labelledby="workflow-heading"
          >
            <h3 id="workflow-heading" className="sr-only">
              Your workflow: File Library, Research, Content Studio, Editorial Calendar
            </h3>
            <HeroWorkflowIllustration />
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroWorkflowIllustration() {
  return (
    <div className="relative w-full max-w-lg aspect-square">
      {/* Morphing blob background - uses design tokens */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 animate-float-subtle" />
      <div className="absolute inset-4 rounded-2xl border-2 border-primary/20 bg-background/80 backdrop-blur-sm shadow-elevated" />

      {/* Workflow nodes - library -> research -> editor -> calendar */}
      <div className="absolute inset-8 flex flex-col gap-4 p-4">
        {/* Row 1: Library + Research */}
        <div className="flex gap-4 flex-1 min-h-0">
          <WorkflowNode
            icon="library"
            label="File Library"
            className="flex-1 animate-slide-up"
            style={{ animationDelay: '300ms', animationFillMode: 'both' }}
          />
          <WorkflowNode
            icon="research"
            label="OpenClaw Research"
            className="flex-1 animate-slide-up"
            style={{ animationDelay: '400ms', animationFillMode: 'both' }}
          />
        </div>
        {/* Row 2: Editor + Calendar */}
        <div className="flex gap-4 flex-1 min-h-0">
          <WorkflowNode
            icon="editor"
            label="Content Studio"
            className="flex-1 animate-slide-up"
            style={{ animationDelay: '500ms', animationFillMode: 'both' }}
          />
          <WorkflowNode
            icon="calendar"
            label="Editorial Calendar"
            className="flex-1 animate-slide-up"
            style={{ animationDelay: '600ms', animationFillMode: 'both' }}
          />
        </div>
      </div>

    </div>
  )
}

interface WorkflowNodeProps {
  icon: 'library' | 'research' | 'editor' | 'calendar'
  label: string
  className?: string
  style?: React.CSSProperties
}

const WORKFLOW_ICONS = {
  library: FolderOpen,
  research: Search,
  editor: FileEdit,
  calendar: Calendar,
} as const

function WorkflowNode({ icon, label, className, style }: WorkflowNodeProps) {
  const IconComponent = WORKFLOW_ICONS[icon]
  const iconAriaLabel = `${label} icon`

  return (
    <Card
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-card-hover hover:border-primary/40',
        className
      )}
      style={style}
      aria-labelledby={`workflow-node-${icon}-label`}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2"
        role="img"
        aria-label={iconAriaLabel}
      >
        <IconComponent
          className="h-8 w-8 text-primary"
          aria-hidden
        />
      </div>
      <span id={`workflow-node-${icon}-label`} className="text-small font-medium text-foreground text-center">
        {label}
      </span>
    </Card>
  )
}
