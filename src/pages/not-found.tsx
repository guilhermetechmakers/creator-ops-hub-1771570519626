import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        <h1 className="text-8xl font-bold text-primary">404</h1>
        <p className="text-xl text-muted-foreground mt-4">Page not found</p>
        <p className="text-muted-foreground mt-2">The page you're looking for doesn't exist.</p>
        <Button asChild className="mt-8">
          <Link to="/">
            <Home className="h-4 w-4 mr-2" />
            Go home
          </Link>
        </Button>
      </div>
    </div>
  )
}
