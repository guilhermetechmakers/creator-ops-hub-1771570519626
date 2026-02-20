import { Link } from 'react-router-dom'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />

      <div className="container relative mx-auto px-4 py-24 md:py-32 lg:py-40">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <div className="mx-auto max-w-2xl lg:max-w-none text-center lg:text-left animate-slide-up">
            <h1 className="text-hero font-bold tracking-tight md:text-hero-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              One workspace for creators
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Centralize assets, research, and multi-platform publishing. From idea to published content—faster, with full traceability.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="text-base px-8 py-6 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                asChild
              >
                <Link to="/login-/-signup?mode=signup">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 py-6 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border-2"
                asChild
              >
                <Link to="#feature-highlights" className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Tour
                </Link>
              </Button>
            </div>
          </div>

          {/* Hero illustration - workflow: library -> research -> editor -> calendar */}
          <div className="relative flex justify-center lg:justify-end animate-fade-in" style={{ animationDelay: '200ms' }}>
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
      {/* Morphing blob background */}
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

function WorkflowNode({ icon, label, className, style }: WorkflowNodeProps) {
  const icons = {
    library: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 text-primary">
        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    research: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 text-primary">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
    editor: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 text-primary">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    calendar: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 text-primary">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-card-hover hover:border-primary/40',
        className
      )}
      style={style}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
        {icons[icon]}
      </div>
      <span className="text-small font-medium text-foreground text-center">{label}</span>
    </div>
  )
}
