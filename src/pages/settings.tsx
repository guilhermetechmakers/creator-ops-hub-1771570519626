import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-h1 font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage account and workspace</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Your name" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <Button>Save changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>Billing and plan</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-small text-muted-foreground">Free plan</p>
          <Button variant="outline" className="mt-4">Upgrade</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>2FA and sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline">Enable 2FA</Button>
          <p className="text-small text-muted-foreground">Manage active sessions</p>
        </CardContent>
      </Card>
    </div>
  )
}
