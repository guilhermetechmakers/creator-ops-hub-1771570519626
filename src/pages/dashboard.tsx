import { useEffect } from 'react'
import { DashboardMainWidgets } from '@/components/dashboard/dashboard-main-widgets'
import { DashboardActivityFeed } from '@/components/dashboard/dashboard-activity-feed'
import { DashboardCtaBanner } from '@/components/dashboard/dashboard-cta-banner'
import { useDashboardData } from '@/hooks/use-dashboard-data'

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
  } = useDashboardData()

  useEffect(() => {
    document.title = 'Dashboard | Creator Ops Hub'
    return () => {
      document.title = 'Creator Ops Hub'
    }
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-h1 font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Your single-pane operational view
        </p>
      </div>

      <DashboardCtaBanner />

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
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardActivityFeed />
      </div>
    </div>
  )
}

export default DashboardPage
