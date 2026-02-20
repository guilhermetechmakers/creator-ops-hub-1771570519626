import { Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const integrations = [
  { name: 'Google', description: 'Gmail + Calendar', connected: true },
  { name: 'Instagram', description: 'Publishing', connected: false },
  { name: 'X (Twitter)', description: 'Publishing', connected: false },
  { name: 'YouTube', description: 'Publishing', connected: false },
]

export function IntegrationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold">Integrations</h1>
          <p className="text-muted-foreground mt-1">Manage connected services</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add connector
        </Button>
      </div>

      <div className="grid gap-4">
        {integrations.map(({ name, description, connected }) => (
          <Card key={name}>
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
              <div>
                <h3 className="font-semibold">{name}</h3>
                <p className="text-small text-muted-foreground">{description}</p>
              </div>
              {connected ? (
                <div className="flex items-center gap-2 text-success">
                  <Check className="h-4 w-4" />
                  <span className="text-small font-medium">Connected</span>
                </div>
              ) : (
                <Button variant="outline" size="sm">Connect</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
