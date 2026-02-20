import { useState } from 'react'
import { Shield, Database, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

const DATA_RETENTION_OPTIONS = [
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '365', label: '1 year' },
  { value: 'forever', label: 'Forever' },
]

const SNAPSHOT_RETENTION_OPTIONS = [
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '365', label: '1 year' },
]

export interface PrivacySettingsProps {
  dataRetentionDays?: string
  researchSnapshotRetentionDays?: string
  isLoading?: boolean
  onUpdateDataRetention?: (days: string) => Promise<void>
  onUpdateSnapshotRetention?: (days: string) => Promise<void>
}

export function PrivacySettings({
  dataRetentionDays = '90',
  researchSnapshotRetentionDays = '30',
  isLoading = false,
  onUpdateDataRetention,
  onUpdateSnapshotRetention,
}: PrivacySettingsProps) {
  const [dataRetention, setDataRetention] = useState(dataRetentionDays)
  const [snapshotRetention, setSnapshotRetention] = useState(researchSnapshotRetentionDays)
  const [isSavingData, setIsSavingData] = useState(false)
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false)

  const handleDataRetentionChange = async (value: string) => {
    setDataRetention(value)
    setIsSavingData(true)
    try {
      await onUpdateDataRetention?.(value)
      toast.success('Data retention updated')
    } catch {
      toast.error('Failed to update')
      setDataRetention(dataRetentionDays)
    } finally {
      setIsSavingData(false)
    }
  }

  const handleSnapshotRetentionChange = async (value: string) => {
    setSnapshotRetention(value)
    setIsSavingSnapshot(true)
    try {
      await onUpdateSnapshotRetention?.(value)
      toast.success('Research snapshot retention updated')
    } catch {
      toast.error('Failed to update')
      setSnapshotRetention(researchSnapshotRetentionDays)
    } finally {
      setIsSavingSnapshot(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="overflow-hidden transition-all duration-300">
        <CardHeader>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-56 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Privacy
        </CardTitle>
        <CardDescription>
          Data retention and research snapshot settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data retention */}
        <div className="space-y-2">
          <Label htmlFor="data-retention" className="flex items-center gap-2 text-base font-medium">
            <Database className="h-4 w-4 text-muted-foreground" />
            Data retention
          </Label>
          <p className="text-small text-muted-foreground">
            How long to keep your workspace data before automatic deletion
          </p>
          <Select
            id="data-retention"
            options={DATA_RETENTION_OPTIONS}
            value={dataRetention}
            onChange={(e) => handleDataRetentionChange(e.target.value)}
            disabled={isSavingData}
            className="mt-2 max-w-xs focus:border-primary/50"
          />
        </div>

        {/* Research snapshot retention */}
        <div className="space-y-2">
          <Label htmlFor="snapshot-retention" className="flex items-center gap-2 text-base font-medium">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Research snapshot retention
          </Label>
          <p className="text-small text-muted-foreground">
            How long to keep research snapshots
          </p>
          <Select
            id="snapshot-retention"
            options={SNAPSHOT_RETENTION_OPTIONS}
            value={snapshotRetention}
            onChange={(e) => handleSnapshotRetentionChange(e.target.value)}
            disabled={isSavingSnapshot}
            className="mt-2 max-w-xs focus:border-primary/50"
          />
        </div>
      </CardContent>
    </Card>
  )
}
