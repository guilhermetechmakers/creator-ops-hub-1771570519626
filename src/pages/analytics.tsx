import { useCallback } from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AnalyticsFiltersComponent } from '@/components/analytics/analytics-filters'
import { AnalyticsOverviewCards } from '@/components/analytics/analytics-overview-cards'
import { AnalyticsCharts } from '@/components/analytics/analytics-charts'
import { AnalyticsTopPosts } from '@/components/analytics/analytics-top-posts'
import { useAnalytics } from '@/hooks/use-analytics'
import { exportAnalyticsToCsv, exportAnalyticsToPdf } from '@/lib/analytics-export'
import { toast } from 'sonner'

export function AnalyticsPage() {
  const { data, filters, updateFilters, isLoading, error, refetch } = useAnalytics()

  const handleExportCsv = useCallback(() => {
    if (!data) {
      toast.error('No data to export')
      return
    }
    try {
      exportAnalyticsToCsv(data, {
        from: filters.dateFrom ?? '',
        to: filters.dateTo ?? '',
      })
      toast.success('Report exported as CSV')
    } catch (err) {
      toast.error('Failed to export CSV')
    }
  }, [data, filters.dateFrom, filters.dateTo])

  const handleExportPdf = useCallback(() => {
    if (!data) {
      toast.error('No data to export')
      return
    }
    try {
      exportAnalyticsToPdf(data, {
        from: filters.dateFrom ?? '',
        to: filters.dateTo ?? '',
      })
      toast.success('Opening print dialog for PDF')
    } catch (err) {
      toast.error('Failed to export PDF')
    }
  }, [data, filters.dateFrom, filters.dateTo])

  const handleFiltersChange = useCallback(
    (newFilters: Parameters<typeof updateFilters>[0]) => {
      updateFilters(newFilters)
    },
    [updateFilters]
  )

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-h1 font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Performance insights</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border bg-card">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <FileText className="h-8 w-8 text-destructive" />
          </div>
          <p className="font-medium text-foreground">Unable to load analytics</p>
          <p className="text-small text-muted-foreground mt-1 max-w-md text-center">
            {error}
          </p>
          <Button
            variant="outline"
            className="mt-6 hover:scale-[1.02] transition-transform"
            onClick={() => refetch()}
          >
            Try again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Core engagement and performance metrics across content and channels
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="hover:scale-[1.02] transition-transform shrink-0"
              disabled={isLoading || !data}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={handleExportCsv}
              className="cursor-pointer focus:bg-primary/10"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export CSV
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleExportPdf}
              className="cursor-pointer focus:bg-primary/10"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AnalyticsFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      <AnalyticsOverviewCards
        overview={data?.overview ?? null}
        isLoading={isLoading}
      />

      <AnalyticsCharts
        chartData={data?.chartData ?? []}
        isLoading={isLoading}
      />

      <AnalyticsTopPosts
        topPosts={data?.topPosts ?? []}
        isLoading={isLoading}
      />
    </div>
  )
}
