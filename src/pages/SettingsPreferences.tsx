import { useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { User, CreditCard, Users, Shield, Bell, Lock, ChevronRight, Home } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useSettingsPreferences } from '@/hooks/use-settings-preferences'
import { AdminOverview } from '@/components/settings-preferences/admin-overview'
import { AccountProfile } from '@/components/settings-preferences/account-profile'
import { WorkspaceBilling } from '@/components/settings-preferences/workspace-billing'
import { TeamManagement } from '@/components/settings-preferences/team-management'
import { SecuritySettings } from '@/components/settings-preferences/security-settings'
import { NotificationsPreferences } from '@/components/settings-preferences/notifications-preferences'
import { PrivacySettings } from '@/components/settings-preferences/privacy-settings'
import { ErrorState } from '@/components/ui/error-state'

const tabItems = [
  { value: 'account', label: 'Account', icon: User },
  { value: 'workspace', label: 'Workspace', icon: CreditCard },
  { value: 'team', label: 'Team', icon: Users },
  { value: 'security', label: 'Security', icon: Shield },
  { value: 'notifications', label: 'Notifications', icon: Bell },
  { value: 'privacy', label: 'Privacy', icon: Lock },
] as const

export function SettingsPreferencesPage() {
  useEffect(() => {
    document.title = 'Settings & Preferences | Creator Ops Hub'
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Manage account, workspace, team, security, notifications, and privacy settings.'
      )
    }
  }, [])

  const {
    profile,
    plan,
    members,
    sessions,
    apiKeys,
    isLoading,
    hasError,
    twoFactorEnabled,
    refetch,
    onSaveAccount,
    onChangePassword,
    onInvite,
    onRemoveMember,
    onUpdateRole,
    onToggle2FA,
    onRevokeSession,
    onCreateApiKey,
    onRevokeApiKey,
    onUpdatePreferences,
    onAddWebhook,
    onRemoveWebhook,
    onUpdateDataRetention,
    onUpdateSnapshotRetention,
    notificationPrefs,
    webhooks,
    dataRetentionDays,
    researchSnapshotRetentionDays,
  } = useSettingsPreferences()

  const handleRetry = useCallback(async () => {
    const toastId = toast.loading('Retrying...')
    try {
      await refetch()
      toast.dismiss(toastId)
      toast.success('Settings loaded successfully')
    } catch {
      toast.dismiss(toastId)
      toast.error('Failed to load settings. Please try again.')
    }
  }, [refetch])

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb navigation"
        className="flex items-center gap-2 text-small text-muted-foreground animate-fade-in"
      >
        <Link
          to="/dashboard"
          aria-label="Navigate to dashboard"
          className="hover:text-foreground transition-colors duration-200 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
        <span className="text-foreground font-medium">Settings & Preferences</span>
      </nav>

      <div className="animate-slide-up">
        <h1 className="text-h1 font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
          Settings & Preferences
        </h1>
        <p className="text-muted-foreground mt-1 text-body">
          Manage account, workspace, team, security, notifications, and privacy
        </p>
      </div>

      {/* Admin overview: usage, users, billing, moderation */}
      <section aria-label="Admin overview">
        <h2 className="sr-only">Admin overview</h2>
        <AdminOverview
          plan={plan ?? undefined}
          members={members}
          memberCount={members.length + (profile ? 1 : 0)}
          moderationAlerts={0}
          isLoading={isLoading}
        />
      </section>

      {hasError && (
        <ErrorState
          title="Could not load settings"
          description="Some data failed to load. You can retry or continue with available options."
          onRetry={handleRetry}
          retryLabel="Retry"
          buttonAriaLabel="Retry loading settings"
        />
      )}

      {isLoading ? (
        <Card className="overflow-hidden transition-all duration-300 border-primary/5">
          <CardHeader className="space-y-2">
            <Skeleton className="h-8 w-48" shimmer />
            <Skeleton className="h-4 w-72" shimmer />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {tabItems.map(({ value }) => (
                <Skeleton key={value} className="h-10 w-24 rounded-md" shimmer />
              ))}
            </div>
            <div className="space-y-4 pt-4">
              <Skeleton className="h-32 w-full rounded-lg" shimmer />
              <Skeleton className="h-48 w-full rounded-lg" shimmer />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover border-primary/5">
          <CardContent className="pt-6">
            <Tabs defaultValue="account" className="w-full">
              <TabsList
                aria-label="Settings sections"
                className="flex flex-wrap h-auto gap-1 p-1 bg-muted/50 w-full sm:w-auto"
              >
                {tabItems.map(({ value, label, icon: Icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    aria-label={`Open ${label} settings`}
                    className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="account" className="mt-6 animate-fade-in data-[state=inactive]:hidden">
                <AccountProfile
                  key={profile?.id ?? 'loading'}
                  name={profile?.full_name ?? profile?.email?.split('@')[0] ?? ''}
                  email={profile?.email ?? ''}
                  avatarUrl={profile?.avatar_url}
                  isLoading={false}
                  onSaveAccount={onSaveAccount}
                  onChangePassword={onChangePassword}
                />
              </TabsContent>

              <TabsContent value="workspace" className="mt-6 animate-fade-in data-[state=inactive]:hidden">
                <WorkspaceBilling plan={plan ?? undefined} isLoading={false} />
              </TabsContent>

              <TabsContent value="team" className="mt-6 animate-fade-in data-[state=inactive]:hidden">
                <TeamManagement
                  members={members}
                  isLoading={false}
                  onInvite={onInvite}
                  onRemoveMember={onRemoveMember}
                  onUpdateRole={onUpdateRole}
                />
              </TabsContent>

              <TabsContent value="security" className="mt-6 animate-fade-in data-[state=inactive]:hidden">
                <SecuritySettings
                  twoFactorEnabled={twoFactorEnabled}
                  sessions={sessions}
                  apiKeys={apiKeys}
                  isLoading={false}
                  onToggle2FA={onToggle2FA}
                  onRevokeSession={onRevokeSession}
                  onCreateApiKey={onCreateApiKey}
                  onRevokeApiKey={onRevokeApiKey}
                />
              </TabsContent>

              <TabsContent value="notifications" className="mt-6 animate-fade-in data-[state=inactive]:hidden">
                <NotificationsPreferences
                  preferences={notificationPrefs}
                  webhooks={webhooks}
                  isLoading={false}
                  onUpdatePreferences={onUpdatePreferences}
                  onAddWebhook={onAddWebhook}
                  onRemoveWebhook={onRemoveWebhook}
                />
              </TabsContent>

              <TabsContent value="privacy" className="mt-6 animate-fade-in data-[state=inactive]:hidden">
                <PrivacySettings
                  dataRetentionDays={dataRetentionDays}
                  researchSnapshotRetentionDays={researchSnapshotRetentionDays}
                  isLoading={isLoading}
                  onUpdateDataRetention={onUpdateDataRetention}
                  onUpdateSnapshotRetention={onUpdateSnapshotRetention}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SettingsPreferencesPage
