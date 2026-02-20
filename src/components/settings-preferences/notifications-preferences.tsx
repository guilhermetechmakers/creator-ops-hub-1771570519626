import { useState, useEffect } from 'react'
import { Bell, Mail, Webhook, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export interface NotificationPreferences {
  emailDigest: boolean
  inAppNotifications: boolean
  marketingEmails: boolean
}

export interface WebhookEndpoint {
  id: string
  url: string
  events: string[]
  created_at: string
}

export interface NotificationsPreferencesProps {
  preferences?: NotificationPreferences
  webhooks?: WebhookEndpoint[]
  isLoading?: boolean
  onUpdatePreferences?: (prefs: NotificationPreferences) => Promise<void>
  onAddWebhook?: (url: string) => Promise<void>
  onRemoveWebhook?: (id: string) => Promise<void>
}

export function NotificationsPreferences({
  preferences = {
    emailDigest: true,
    inAppNotifications: true,
    marketingEmails: false,
  },
  webhooks = [],
  isLoading = false,
  onUpdatePreferences,
  onAddWebhook,
  onRemoveWebhook,
}: NotificationsPreferencesProps) {
  const [prefs, setPrefs] = useState(preferences)

  useEffect(() => {
    setPrefs(preferences)
  }, [preferences.emailDigest, preferences.inAppNotifications, preferences.marketingEmails])
  const [webhookUrl, setWebhookUrl] = useState('')
  const [showWebhookForm, setShowWebhookForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [webhookToRemove, setWebhookToRemove] = useState<WebhookEndpoint | null>(null)

  const handlePrefChange = async (key: keyof NotificationPreferences, value: boolean) => {
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    setIsSaving(true)
    try {
      await onUpdatePreferences?.(next)
      toast.success('Preferences updated')
    } catch {
      toast.error('Failed to update preferences')
      setPrefs(prefs)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddWebhook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!webhookUrl.trim()) return
    try {
      await onAddWebhook?.(webhookUrl.trim())
      toast.success('Webhook added')
      setWebhookUrl('')
      setShowWebhookForm(false)
    } catch {
      toast.error('Failed to add webhook')
    }
  }

  const handleRemoveWebhook = async () => {
    if (!webhookToRemove) return
    try {
      await onRemoveWebhook?.(webhookToRemove.id)
      toast.success('Webhook removed')
      setWebhookToRemove(null)
    } catch {
      toast.error('Failed to remove webhook')
    }
  }

  if (isLoading) {
    return (
      <Card className="overflow-hidden transition-all duration-300">
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notifications
        </CardTitle>
        <CardDescription>
          Email, in-app preferences, and webhook endpoints
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email / In-app preferences */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="email-digest" className="text-base font-medium">
                  Email digest
                </Label>
                <p className="text-small text-muted-foreground">
                  Weekly summary of activity
                </p>
              </div>
            </div>
            <Switch
              id="email-digest"
              checked={prefs.emailDigest}
              onCheckedChange={(v) => handlePrefChange('emailDigest', v)}
              disabled={isSaving}
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="in-app" className="text-base font-medium">
                  In-app notifications
                </Label>
                <p className="text-small text-muted-foreground">
                  Show notifications in the app
                </p>
              </div>
            </div>
            <Switch
              id="in-app"
              checked={prefs.inAppNotifications}
              onCheckedChange={(v) => handlePrefChange('inAppNotifications', v)}
              disabled={isSaving}
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <Label htmlFor="marketing" className="text-base font-medium">
                Marketing emails
              </Label>
              <p className="text-small text-muted-foreground">
                Product updates and tips
              </p>
            </div>
            <Switch
              id="marketing"
              checked={prefs.marketingEmails}
              onCheckedChange={(v) => handlePrefChange('marketingEmails', v)}
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Webhook endpoints */}
        <div className="space-y-3">
          <p className="text-small font-medium flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhook endpoints
          </p>
          {!showWebhookForm ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWebhookForm(true)}
              className="transition-transform duration-200 hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add endpoint
            </Button>
          ) : (
            <form
              onSubmit={handleAddWebhook}
              className="flex gap-2 animate-fade-in"
            >
              <Input
                placeholder="https://your-server.com/webhook"
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="flex-1 focus:border-primary/50"
              />
              <Button type="submit" disabled={!webhookUrl.trim()}>
                Add
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowWebhookForm(false)
                  setWebhookUrl('')
                }}
              >
                Cancel
              </Button>
            </form>
          )}
          {webhooks.length === 0 && !showWebhookForm ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/20 border-dashed">
              <Webhook className="h-12 w-12 text-muted-foreground mb-4 opacity-60" />
              <p className="text-small font-medium text-muted-foreground">
                No webhook endpoints
              </p>
              <p className="text-micro text-muted-foreground mt-1 max-w-[240px]">
                Add a webhook URL to receive real-time events from your workspace
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setShowWebhookForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add your first endpoint
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {webhooks.map((wh) => (
                <div
                  key={wh.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="text-small font-mono truncate max-w-[240px]">{wh.url}</p>
                    <p className="text-micro text-muted-foreground">
                      {wh.events.join(', ')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setWebhookToRemove(wh)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    <AlertDialog open={!!webhookToRemove} onOpenChange={() => setWebhookToRemove(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove webhook endpoint?</AlertDialogTitle>
          <AlertDialogDescription>
            This will stop sending events to {webhookToRemove?.url}. Any integrations using this endpoint will no longer receive updates.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemoveWebhook}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
