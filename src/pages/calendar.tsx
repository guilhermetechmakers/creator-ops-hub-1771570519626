import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

const channels = [
  { name: 'Instagram', colorClass: 'bg-channel-instagram' },
  { name: 'X', colorClass: 'bg-channel-x' },
  { name: 'YouTube', colorClass: 'bg-channel-youtube' },
] as const

function getDaysForMonthView(year: number, month: number): number[] {
  if (Number.isNaN(year) || Number.isNaN(month) || month < 0 || month > 11) return []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startOffset = firstDay.getDay()
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7
  const days: number[] = []
  for (let i = 0; i < startOffset; i++) days.push(0)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  while (days.length < totalCells) days.push(0)
  return days
}

export function CalendarPage() {
  const [viewDate, setViewDate] = useState(() => new Date())
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const days = useMemo(() => getDaysForMonthView(year, month), [year, month])
  const hasDaysToDisplay = days.some((d) => d > 0)

  const goPrev = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1))
  const goNext = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold">Editorial Calendar</h1>
          <p className="text-muted-foreground mt-1">Plan and schedule Instagram, X, and YouTube</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/dashboard/content-editor/new">
              <Plus className="h-4 w-4 mr-2" />
              New post
            </Link>
          </Button>
          <Button variant="outline" size="icon" onClick={goPrev} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goNext} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline">Month</Button>
        </div>
      </div>

      {/* Channel legend - design tokens */}
      <div className="flex flex-wrap gap-4">
        {channels.map((c) => (
          <div key={c.name} className="flex items-center gap-2">
            <div className={cn('h-3 w-3 rounded-full shrink-0', c.colorClass)} aria-hidden />
            <span className="text-small">{c.name}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="p-2 text-center text-small font-medium text-muted-foreground border-r last:border-r-0"
              >
                {d}
              </div>
            ))}
          </div>
          {!hasDaysToDisplay ? (
            <div
              role="status"
              aria-live="polite"
              aria-labelledby="calendar-empty-heading"
              aria-describedby="calendar-empty-description"
              className={cn(
                'flex flex-col items-center justify-center gap-6 rounded-xl',
                'border-2 border-dashed border-muted bg-muted/20 p-8 sm:p-12 text-center',
                'animate-fade-in min-h-[280px] sm:min-h-[320px]'
              )}
            >
              <div className="rounded-2xl bg-muted/50 p-6 ring-1 ring-muted/80">
                <CalendarDays className="h-12 w-12 text-muted-foreground/70" aria-hidden />
              </div>
              <div className="space-y-2 max-w-[320px]">
                <h2
                  id="calendar-empty-heading"
                  className="text-base font-semibold text-foreground sm:text-lg"
                >
                  No days to display
                </h2>
                <p id="calendar-empty-description" className="text-sm text-muted-foreground leading-relaxed">
                  There are no days available for this calendar view. Try selecting a different month or check your date range.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goPrev}
                  className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  aria-label="Go to previous month"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" aria-hidden />
                  Previous month
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  asChild
                  className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  aria-label="Create new post"
                >
                  <Link to="/dashboard/content-editor/new">
                    <Plus className="h-4 w-4 mr-2" aria-hidden />
                    New post
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {days.map((d, i) => (
                <div
                  key={`${d}-${i}`}
                  className={cn(
                    'min-h-[120px] p-2 border-b border-r last:border-r-0 transition-colors duration-200',
                    d > 0
                      ? 'hover:bg-muted/30 cursor-pointer'
                      : 'bg-muted/10 cursor-default'
                  )}
                >
                  {d > 0 && (
                    <>
                      <span className="text-small text-muted-foreground">{d}</span>
                      {d === 15 && (
                        <div className="mt-2 p-2 rounded bg-primary/10 text-primary text-micro">
                          Launch post
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
