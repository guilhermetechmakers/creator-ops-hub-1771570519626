import type { AnalyticsData } from '@/types/analytics'

function escapeCsvValue(val: string | number): string {
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportAnalyticsToCsv(data: AnalyticsData, dateRange: { from: string; to: string }): void {
  const rows: string[][] = []

  rows.push(['Workspace Analytics Report', ''])
  rows.push(['Date Range', `${dateRange.from} to ${dateRange.to}`])
  rows.push([])

  rows.push(['Overview', ''])
  rows.push(['Metric', 'Value'])
  rows.push(['Impressions', String(data.overview.impressions)])
  rows.push(['Engagement', String(data.overview.engagement)])
  rows.push(['Top Posts Count', String(data.overview.topPostsCount)])
  rows.push(['Follower Growth', String(data.overview.followerGrowth)])
  rows.push([])

  rows.push(['Top Posts', ''])
  rows.push(['Title', 'Channel', 'Impressions', 'Engagement', 'Engagement Rate'])
  for (const post of data.topPosts) {
    rows.push([
      post.title,
      post.channel,
      String(post.impressions),
      String(post.engagement),
      `${post.engagementRate.toFixed(1)}%`,
    ])
  }
  rows.push([])

  rows.push(['Daily Chart Data', ''])
  rows.push(['Date', 'Day', 'Impressions', 'Engagement', 'Followers'])
  for (const point of data.chartData) {
    rows.push([
      point.date,
      point.name,
      String(point.impressions),
      String(point.engagement),
      String(point.followers),
    ])
  }

  const csv = rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `analytics-report-${dateRange.from}-to-${dateRange.to}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function prepareAnalyticsForPrint(
  data: AnalyticsData,
  dateRange: { from: string; to: string }
): { title: string; html: string } {
  const overviewRows = [
    ['Impressions', data.overview.impressions.toLocaleString()],
    ['Engagement', data.overview.engagement.toLocaleString()],
    ['Top Posts', String(data.overview.topPostsCount)],
    ['Follower Growth', `+${data.overview.followerGrowth.toLocaleString()}`],
  ]

  const overviewTable = `
    <table style="width:100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead><tr><th style="text-align:left; padding: 8px; border-bottom: 1px solid #e5e7eb;">Metric</th><th style="text-align:right; padding: 8px; border-bottom: 1px solid #e5e7eb;">Value</th></tr></thead>
      <tbody>
        ${overviewRows.map(([k, v]) => `<tr><td style="padding: 8px; border-bottom: 1px solid #f3f4f6;">${k}</td><td style="text-align:right; padding: 8px; border-bottom: 1px solid #f3f4f6;">${v}</td></tr>`).join('')}
      </tbody>
    </table>
  `

  const topPostsTable = data.topPosts.length > 0
    ? `
    <h3 style="margin: 24px 0 12px; font-size: 16px;">Top Posts</h3>
    <table style="width:100%; border-collapse: collapse;">
      <thead><tr><th style="text-align:left; padding: 8px; border-bottom: 1px solid #e5e7eb;">Title</th><th>Channel</th><th style="text-align:right;">Impressions</th><th style="text-align:right;">Engagement</th><th style="text-align:right;">Rate</th></tr></thead>
      <tbody>
        ${data.topPosts.map((p) => `<tr><td style="padding: 8px; border-bottom: 1px solid #f3f4f6;">${p.title}</td><td style="padding: 8px; border-bottom: 1px solid #f3f4f6;">${p.channel}</td><td style="text-align:right; padding: 8px; border-bottom: 1px solid #f3f4f6;">${p.impressions.toLocaleString()}</td><td style="text-align:right; padding: 8px; border-bottom: 1px solid #f3f4f6;">${p.engagement.toLocaleString()}</td><td style="text-align:right; padding: 8px; border-bottom: 1px solid #f3f4f6;">${p.engagementRate.toFixed(1)}%</td></tr>`).join('')}
      </tbody>
    </table>
  `
    : ''

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Workspace Analytics Report - ${dateRange.from} to ${dateRange.to}</title>
      <style>
        body { font-family: Inter, system-ui, sans-serif; padding: 24px; color: #1f2933; }
        h1 { font-size: 24px; margin-bottom: 8px; }
        .meta { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
      </style>
    </head>
    <body>
      <h1>Workspace Analytics Report</h1>
      <p class="meta">Date range: ${dateRange.from} to ${dateRange.to}</p>
      <h3 style="margin: 0 0 12px; font-size: 16px;">Overview</h3>
      ${overviewTable}
      ${topPostsTable}
    </body>
    </html>
  `

  return {
    title: `Analytics Report ${dateRange.from} - ${dateRange.to}`,
    html,
  }
}

export function exportAnalyticsToPdf(data: AnalyticsData, dateRange: { from: string; to: string }): void {
  const { html } = prepareAnalyticsForPrint(data, dateRange)
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    return
  }
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}
