import { useState } from 'react'
import { Plus, Check, Loader2, Unplug, Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { PremiumGate } from '@/components/premium-gate'
import { useGoogleIntegration } from '@/hooks/use-google-integration'
import { useInstagramIntegration } from '@/hooks/use-instagram-integration'

const otherIntegrations = [
  { id: 'twitter', name: 'X (Twitter)', description: 'Publishing' },
  { id: 'youtube', name: 'YouTube', description: 'Publishing' },
]

export function IntegrationsPage() {
  return (
    <PremiumGate featureName="Integrations">
      <IntegrationsPageContent />
    </PremiumGate>
  )
}

function IntegrationsPageContent() {
  const { connected, loading, connect, revoke } = useGoogleIntegration()
  const {
    connected: instagramConnected,
    username: instagramUsername,
    loading: instagramLoading,
    connect: instagramConnect,
    revoke: instagramRevoke,
  } = useInstagramIntegration()
  const [revokeOpen, setRevokeOpen] = useState(false)
  const [instagramRevokeOpen, setInstagramRevokeOpen] = useState(false)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold">Integrations</h1>
          <p className="text-muted-foreground mt-1">
            Connect Gmail and Calendar for your workspace
          </p>
        </div>
      </div>

      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Google (Gmail + Calendar)</h3>
          <p className="text-small text-muted-foreground mb-4">
            Connect your Google account to surface Gmail conversations and calendar
            deadlines in the dashboard. Enables Research links, content planning, and
            OpenClaw workflows.
          </p>
          <p className="text-micro text-muted-foreground mb-4">
            We request read access to Gmail (including starred/important) and
            Calendar. Tokens are stored securely and can be revoked at any time.
          </p>
          {connected ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-success">
                <Check className="h-4 w-4" />
                <span className="text-small font-medium">Connected</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRevokeOpen(true)}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-pulse" />
                ) : (
                  <>
                    <Unplug className="h-4 w-4 mr-2" />
                    Disconnect
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button onClick={connect} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-pulse" />
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Google
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Instagram (Graph API)
          </h3>
          <p className="text-small text-muted-foreground mb-4">
            Connect your Instagram Business Account to publish posts and fetch
            engagement data. Requires Facebook Login for Business and an
            Instagram professional account linked to a Facebook Page.
          </p>
          <p className="text-micro text-muted-foreground mb-4">
            We request read access to your Instagram content and permission to
            publish. Tokens are stored securely and can be revoked at any time.
          </p>
          {instagramConnected ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-success">
                <Check className="h-4 w-4" />
                <span className="text-small font-medium">
                  Connected
                  {instagramUsername ? ` (@${instagramUsername})` : ''}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInstagramRevokeOpen(true)}
                disabled={instagramLoading}
              >
                {instagramLoading ? (
                  <Loader2 className="h-4 w-4 animate-pulse" />
                ) : (
                  <>
                    <Unplug className="h-4 w-4 mr-2" />
                    Disconnect
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button
              onClick={instagramConnect}
              disabled={instagramLoading}
              className="gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
            >
              {instagramLoading ? (
                <Loader2 className="h-4 w-4 animate-pulse" />
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Connect Instagram
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {otherIntegrations.map(({ id, name, description }) => (
          <Card key={id}>
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
              <div>
                <h3 className="font-semibold">{name}</h3>
                <p className="text-small text-muted-foreground">{description}</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Coming soon
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Google?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your Gmail and Calendar connection. You can
              reconnect at any time. Stored tokens will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                revoke()
                setRevokeOpen(false)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={instagramRevokeOpen}
        onOpenChange={setInstagramRevokeOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Instagram?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your Instagram connection. You can reconnect at
              any time. Stored tokens will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                instagramRevoke()
                setInstagramRevokeOpen(false)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
