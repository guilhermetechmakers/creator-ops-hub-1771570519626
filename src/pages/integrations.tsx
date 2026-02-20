import { useState } from 'react'
import { Plus, Check, Loader2, Unplug } from 'lucide-react'
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
import { useGoogleIntegration } from '@/hooks/use-google-integration'

const otherIntegrations = [
  { id: 'instagram', name: 'Instagram', description: 'Publishing' },
  { id: 'twitter', name: 'X (Twitter)', description: 'Publishing' },
  { id: 'youtube', name: 'YouTube', description: 'Publishing' },
]

export function IntegrationsPage() {
  const { connected, loading, connect, revoke } = useGoogleIntegration()
  const [revokeOpen, setRevokeOpen] = useState(false)

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
    </div>
  )
}
