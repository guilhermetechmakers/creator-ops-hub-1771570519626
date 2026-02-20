import { useState } from 'react'
import { Shield, Key, Monitor, Plus, Trash2 } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import type { Session, ApiKey } from '@/types/settings-preferences'

export interface SecuritySettingsProps {
  twoFactorEnabled?: boolean
  sessions?: Session[]
  apiKeys?: ApiKey[]
  isLoading?: boolean
  onToggle2FA?: (enabled: boolean) => Promise<void>
  onRevokeSession?: (id: string) => Promise<void>
  onCreateApiKey?: (name: string) => Promise<string>
  onRevokeApiKey?: (id: string) => Promise<void>
}

export function SecuritySettings({
  twoFactorEnabled = false,
  sessions = [],
  apiKeys = [],
  isLoading = false,
  onToggle2FA,
  onRevokeSession,
  onCreateApiKey,
  onRevokeApiKey,
}: SecuritySettingsProps) {
  const [is2FALoading, setIs2FALoading] = useState(false)
  const [newApiKeyName, setNewApiKeyName] = useState('')
  const [showApiKeyForm, setShowApiKeyForm] = useState(false)
  const [sessionToRevoke, setSessionToRevoke] = useState<Session | null>(null)
  const [apiKeyToRevoke, setApiKeyToRevoke] = useState<ApiKey | null>(null)

  const handle2FAToggle = async (checked: boolean) => {
    setIs2FALoading(true)
    try {
      await onToggle2FA?.(checked)
      toast.success(checked ? '2FA enabled' : '2FA disabled')
    } catch {
      toast.error('Failed to update 2FA')
    } finally {
      setIs2FALoading(false)
    }
  }

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newApiKeyName.trim()) return
    try {
      await onCreateApiKey?.(newApiKeyName.trim())
      toast.success('API key created. Copy it now—you won\'t see it again.')
      setNewApiKeyName('')
      setShowApiKeyForm(false)
    } catch {
      toast.error('Failed to create API key')
    }
  }

  const handleRevokeSession = async () => {
    if (!sessionToRevoke) return
    try {
      await onRevokeSession?.(sessionToRevoke.id)
      toast.success('Session revoked')
      setSessionToRevoke(null)
    } catch {
      toast.error('Failed to revoke session')
    }
  }

  const handleRevokeApiKey = async () => {
    if (!apiKeyToRevoke) return
    try {
      await onRevokeApiKey?.(apiKeyToRevoke.id)
      toast.success('API key revoked')
      setApiKeyToRevoke(null)
    } catch {
      toast.error('Failed to revoke API key')
    }
  }

  if (isLoading) {
    return (
      <Card className="overflow-hidden transition-all duration-300">
        <CardHeader>
          <Skeleton className="h-6 w-28" shimmer />
          <Skeleton className="h-4 w-48 mt-2" shimmer />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-16 w-full" shimmer />
          <Skeleton className="h-32 w-full" shimmer />
          <Skeleton className="h-24 w-full" shimmer />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security
          </CardTitle>
          <CardDescription>
            2FA, active sessions, and API keys
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 2FA Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label htmlFor="2fa-toggle" className="text-base font-medium">
                Two-factor authentication
              </Label>
              <p className="text-small text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              id="2fa-toggle"
              checked={twoFactorEnabled}
              onCheckedChange={handle2FAToggle}
              disabled={is2FALoading}
            />
          </div>

          {/* Sessions */}
          <div className="space-y-3">
            <p className="text-small font-medium flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Active sessions
            </p>
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/20 border-dashed">
                <Monitor className="h-12 w-12 text-muted-foreground mb-4 opacity-60" />
                <p className="text-small font-medium text-muted-foreground">
                  No active sessions
                </p>
                <p className="text-micro text-muted-foreground mt-1 max-w-[240px]">
                  When you sign in on other devices, they will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border transition-colors',
                      session.current && 'bg-primary/5 border-primary/20'
                    )}
                  >
                    <div>
                      <p className="text-small font-medium">
                        {session.device ?? 'Unknown device'}
                        {session.current && (
                          <span className="ml-2 text-primary text-micro">Current</span>
                        )}
                      </p>
                      <p className="text-micro text-muted-foreground">
                        {session.location ?? 'Unknown location'} · Last active {session.last_active}
                      </p>
                    </div>
                    {!session.current && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setSessionToRevoke(session)}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* API Keys */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-small font-medium flex items-center gap-2">
                <Key className="h-4 w-4" />
                API keys
              </p>
              {!showApiKeyForm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKeyForm(true)}
                  className="transition-transform duration-200 hover:scale-[1.02]"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create key
                </Button>
              )}
            </div>
            {showApiKeyForm && (
              <form
                onSubmit={handleCreateApiKey}
                className="flex gap-2 animate-fade-in"
              >
                <Input
                  placeholder="Key name (e.g. Production)"
                  value={newApiKeyName}
                  onChange={(e) => setNewApiKeyName(e.target.value)}
                  className="flex-1 focus:border-primary/50"
                />
                <Button type="submit" disabled={!newApiKeyName.trim()}>
                  Create
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowApiKeyForm(false)
                    setNewApiKeyName('')
                  }}
                >
                  Cancel
                </Button>
              </form>
            )}
            {apiKeys.length === 0 && !showApiKeyForm ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/20 border-dashed">
                <Key className="h-12 w-12 text-muted-foreground mb-4 opacity-60" />
                <p className="text-small font-medium text-muted-foreground">
                  No API keys yet
                </p>
                <p className="text-micro text-muted-foreground mt-1 max-w-[240px]">
                  Create an API key to integrate with external services and automation
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowApiKeyForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first key
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="text-small font-medium">{key.name}</p>
                      <p className="text-micro text-muted-foreground font-mono">
                        {key.prefix}•••••••
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setApiKeyToRevoke(key)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!sessionToRevoke} onOpenChange={() => setSessionToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke session</AlertDialogTitle>
            <AlertDialogDescription>
              This will sign out the session on {sessionToRevoke?.device ?? 'that device'}. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeSession}>
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!apiKeyToRevoke} onOpenChange={() => setApiKeyToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API key</AlertDialogTitle>
            <AlertDialogDescription>
              Revoking {apiKeyToRevoke?.name} will break any integrations using it. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeApiKey}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
