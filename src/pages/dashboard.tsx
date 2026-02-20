import { useCallback, useEffect } from 'react'
import { Zap } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardMainWidgets } from '@/components/dashboard/dashboard-main-widgets'
import { DashboardActivityFeed } from '@/components/dashboard/dashboard-activity-feed'
import { DashboardCtaBanner } from '@/components/dashboard/dashboard-cta-banner'
import { ErrorState } from '@/components/ui/error-state'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function DashboardPage() {
  const {
    calendarEvents,
    gmailThreads,
    scheduledPosts,
    recentAssets,
    researchSummaries,
    googleConnected,
    loadingCalendar,
    loadingGmail,
    loadingScheduled,
    loadingAssets,
    loadingResearch,
    hasError,
    errorMessage,
    refetch,
    cacheMeta,
    isRefetching,
  } = useDashboardData()

  useEffect(() => {
    document.title = 'Dashboard | Creator Ops Hub'
    return () => {
      document.title = 'Creator Ops Hub'
    }
  }, [])

  const handleRetry = useCallback(async () => {
    const toastId = toast.loading('Retrying...')
    try {
      await refetch(true)
      toast.dismiss(toastId)
      toast.success('Dashboard loaded')
    } catch {
      toast.dismiss(toastId)
      toast.error('Failed to load dashboard')
    }
  }, [refetch])

  const handleRefresh = useCallback(async () => {
    const toastId = toast.loading('Refreshing dashboard...')
    try {
      await refetch(true)
      toast.dismiss(toastId)
      toast.success('Dashboard refreshed')
    } catch {
      toast.dismiss(toastId)
      toast.error('Failed to refresh dashboard')
    }
  }, [refetch])

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold">Dashboard</h1>
          <h2 className="text-base font-normal text-muted-foreground mt-1">
            Your single-pane operational view
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {cacheMeta && (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-micro font-medium',
                cacheMeta.cacheStatus === 'HIT'
                  ? 'bg-success/10 text-success'
                  : 'bg-muted text-muted-foreground'
              )}
              title={`${cacheMeta.cacheStatus} · ${cacheMeta.responseTimeMs}ms`}
              aria-label={`Data ${cacheMeta.cacheStatus === 'HIT' ? 'cached' : 'fresh'}, loaded in ${cacheMeta.responseTimeMs}ms`}
            >
              <Zap className="h-3.5 w-3.5" />
              {cacheMeta.cacheStatus === 'HIT' ? 'Cached' : 'Fresh'}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefetching}
            className="text-micro"
            aria-label="Refresh dashboard data"
          >
            {isRefetching ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <DashboardCtaBanner />

      {hasError && (
        <ErrorState
          title="Could not load dashboard"
          description={errorMessage ?? 'Some data failed to load. You can retry or continue with available data.'}
          onRetry={handleRetry}
          retryLabel="Retry"
          buttonAriaLabel="Retry loading dashboard"
        />
      )}

      <DashboardMainWidgets
        calendarEvents={calendarEvents}
        gmailThreads={gmailThreads}
        scheduledPosts={scheduledPosts}
        recentAssets={recentAssets}
        researchSummaries={researchSummaries}
        googleConnected={googleConnected}
        isLoadingCalendar={loadingCalendar}
        isLoadingGmail={loadingGmail}
        isLoadingScheduled={loadingScheduled}
        isLoadingAssets={loadingAssets}
        isLoadingResearch={loadingResearch}
        isLoading={loadingCalendar}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardActivityFeed />
      </div>
    </div>
  )
}

export default DashboardPage
