import { useCallback, useState } from 'react'
import { Download, FileSpreadsheet, FileText, Instagram, Loader2 } from 'lucide-react'
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
import { PremiumGate } from '@/components/premium-gate'
import { useAnalytics } from '@/hooks/use-analytics'
import { useInstagramIntegration } from '@/hooks/use-instagram-integration'
import { exportAnalyticsToCsv, exportAnalyticsToPdf } from '@/lib/analytics-export'
import { fetchInstagramEngagement } from '@/lib/instagram-ops'
import { toast } from 'sonner'

export function AnalyticsPage() {
  return (
    <PremiumGate featureName="Analytics">
      <AnalyticsPageContent />
    </PremiumGate>
  )
}

function AnalyticsPageContent() {
  const { data, filters, updateFilters, isLoading, error, refetch } = useAnalytics()
  const { connected: instagramConnected } = useInstagramIntegration()
  const [isSyncingInstagram, setIsSyncingInstagram] = useState(false)

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
    } catch {
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
    } catch {
      toast.error('Failed to export PDF')
    }
  }, [data, filters.dateFrom, filters.dateTo])

  const handleFiltersChange = useCallback(
    (newFilters: Parameters<typeof updateFilters>[0]) => {
      updateFilters(newFilters)
    },
    [updateFilters]
  )

  const handleSyncInstagram = useCallback(async () => {
    if (!instagramConnected) {
      toast.error('Connect Instagram in Integrations first')
      return
    }
    setIsSyncingInstagram(true)
    const toastId = toast.loading('Syncing Instagram engagement...')
    try {
      await fetchInstagramEngagement()
      toast.dismiss(toastId)
      toast.success('Instagram engagement data synced')
      refetch()
    } catch (err) {
      toast.dismiss(toastId)
      toast.error((err as Error).message ?? 'Failed to sync Instagram')
    } finally {
      setIsSyncingInstagram(false)
    }
  }, [instagramConnected, refetch])

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

      <div className="flex flex-col sm:flex-row gap-4">
        <AnalyticsFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          className="flex-1"
        />
        {instagramConnected && (
          <Button
            variant="outline"
            onClick={handleSyncInstagram}
            disabled={isSyncingInstagram || isLoading}
            className="shrink-0 gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm self-end sm:self-auto"
          >
            {isSyncingInstagram ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Instagram className="h-4 w-4" />
            )}
            {isSyncingInstagram ? 'Syncing...' : 'Sync Instagram'}
          </Button>
        )}
      </div>

      <AnalyticsOverviewCards
        overview={
          data?.overview &&
          (data.overview.impressions > 0 ||
            data.overview.engagement > 0 ||
            data.overview.topPostsCount > 0 ||
            data.overview.followerGrowth !== 0)
            ? data.overview
            : null
        }
        isLoading={isLoading}
      />

      <AnalyticsCharts
        chartData={data?.chartData ?? []}
        isLoading={isLoading}
        onRefresh={async () => {
          const toastId = toast.loading('Refreshing charts...')
          const result = await refetch()
          toast.dismiss(toastId)
          if (result.success) {
            toast.success('Charts refreshed')
          } else {
            toast.error('Failed to refresh charts')
          }
        }}
        isRefreshing={isLoading}
      />

      <AnalyticsTopPosts
        topPosts={data?.topPosts ?? []}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
      />
    </div>
  )
}
