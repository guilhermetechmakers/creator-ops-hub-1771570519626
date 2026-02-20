import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  FolderOpen,
  FileEdit,
  FileText,
  LayoutList,
  Search,
  Calendar,
  Plug,
  BarChart3,
  Send,
  Settings,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/dashboard/library', icon: FolderOpen, label: 'Library' },
  { to: '/dashboard/studio', icon: FileEdit, label: 'Studio' },
  { to: '/dashboard/content-studio', icon: LayoutList, label: 'Content Studio' },
  { to: '/dashboard/research', icon: Search, label: 'Research' },
  { to: '/dashboard/calendar', icon: Calendar, label: 'Editorial Calendar' },
  { to: '/dashboard/content-editor', icon: FileText, label: 'Content Editor' },
  { to: '/dashboard/integrations', icon: Plug, label: 'Integrations' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/dashboard/publishing-queue-logs', icon: Send, label: 'Publishing Queue' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

interface DashboardLeftNavProps {
  collapsed: boolean
  onCollapseToggle: () => void
  onMobileMenuOpen?: () => void
}

export function DashboardLeftNav({
  collapsed,
  onCollapseToggle,
  onMobileMenuOpen: _onMobileMenuOpen,
}: DashboardLeftNavProps) {
  const location = useLocation()

  return (
    <>
      <aside
        className={cn(
          'hidden md:flex flex-col border-r bg-card transition-all duration-300',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && (
            <span className="font-semibold text-lg">Creator Ops</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onCollapseToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive =
              location.pathname === to ||
              (to !== '/dashboard' && location.pathname.startsWith(to + '/'))
            return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:text-primary',
                isActive && 'bg-primary/10 text-primary',
                collapsed && 'justify-center px-0'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          )})}
        </nav>
      </aside>
    </>
  )
}

export { navItems }
