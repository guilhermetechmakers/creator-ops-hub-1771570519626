import { Plus, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function ResearchPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold">Research Hub</h1>
          <p className="text-muted-foreground mt-1">OpenClaw research outputs with citations and traceability</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Research
        </Button>
      </div>

      {/* Trigger form */}
      <Card>
        <CardHeader>
          <CardTitle>Trigger OpenClaw</CardTitle>
          <CardDescription>Configure query, domains, and depth for research</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-small font-medium mb-2 block">Query</label>
            <Input placeholder="Enter research topic..." />
          </div>
          <Button>Start Research</Button>
        </CardContent>
      </Card>

      {/* Research list */}
      <div className="space-y-4">
        <h2 className="text-h3 font-semibold">Recent Research</h2>
        <div className="grid gap-4">
          {[
            { title: 'Competitor analysis Q1', confidence: 92, sources: 5, date: '2h ago' },
            { title: 'Industry trends 2025', confidence: 88, sources: 8, date: '1d ago' },
            { title: 'Best practices for content', confidence: 95, sources: 4, date: '2d ago' },
          ].map((r, i) => (
            <Card key={i} className="hover:shadow-card-hover transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{r.title}</h3>
                    <p className="text-small text-muted-foreground mt-1">{r.sources} sources</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{r.confidence}% confidence</Badge>
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
