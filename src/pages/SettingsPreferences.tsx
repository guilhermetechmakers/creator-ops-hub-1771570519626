import { useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { User, CreditCard, Users, Shield, Bell, Lock, ChevronRight, Home } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSettingsPreferences } from '@/hooks/use-settings-preferences'
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
  } = useSettingsPreferences()

  const handleRetry = useCallback(() => {
    refetch()
  }, [refetch])

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-small text-muted-foreground animate-fade-in"
      >
        <Link
          to="/dashboard"
          className="hover:text-foreground transition-colors duration-200 flex items-center gap-1"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Settings & Preferences</span>
      </nav>

      <div className="animate-fade-in">
        <h1 className="text-h1 font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Settings & Preferences
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage account, workspace, team, security, notifications, and privacy
        </p>
      </div>

      {hasError && (
        <ErrorState
          title="Could not load settings"
          description="Some data failed to load. You can retry or continue with available options."
          onRetry={handleRetry}
          retryLabel="Retry"
        />
      )}

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1 bg-muted/50 w-full sm:w-auto">
          {tabItems.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Icon className="h-4 w-4" />
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
            isLoading={isLoading}
            onSaveAccount={onSaveAccount}
            onChangePassword={onChangePassword}
          />
        </TabsContent>

        <TabsContent value="workspace" className="mt-6 animate-fade-in data-[state=inactive]:hidden">
          <WorkspaceBilling plan={plan ?? undefined} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="team" className="mt-6 animate-fade-in data-[state=inactive]:hidden">
          <TeamManagement
            members={members}
            isLoading={isLoading}
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
            isLoading={isLoading}
            onToggle2FA={onToggle2FA}
            onRevokeSession={onRevokeSession}
            onCreateApiKey={onCreateApiKey}
            onRevokeApiKey={onRevokeApiKey}
          />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 animate-fade-in data-[state=inactive]:hidden">
          <NotificationsPreferences
            preferences={notificationPrefs}
            isLoading={isLoading}
            onUpdatePreferences={onUpdatePreferences}
            onAddWebhook={onAddWebhook}
            onRemoveWebhook={onRemoveWebhook}
          />
        </TabsContent>

        <TabsContent value="privacy" className="mt-6 animate-fade-in data-[state=inactive]:hidden">
          <PrivacySettings
            isLoading={isLoading}
            onUpdateDataRetention={onUpdateDataRetention}
            onUpdateSnapshotRetention={onUpdateSnapshotRetention}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SettingsPreferencesPage
