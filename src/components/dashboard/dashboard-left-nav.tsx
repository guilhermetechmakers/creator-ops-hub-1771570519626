import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  FolderOpen,
  LayoutList,
  Search,
  Calendar,
  Plug,
  BarChart3,
  Settings,
  Menu,
  FileEdit,
  HelpCircle,
  CreditCard,
  Receipt,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/dashboard/file-library', icon: FolderOpen, label: 'Library' },
  { to: '/dashboard/content-studio', icon: LayoutList, label: 'Content Studio' },
  { to: '/dashboard/content-editor', icon: FileEdit, label: 'Content Editor' },
  { to: '/dashboard/research', icon: Search, label: 'Research' },
  { to: '/dashboard/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/dashboard/integrations', icon: Plug, label: 'Integrations' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  { to: '/dashboard/checkout-/-payment', icon: CreditCard, label: 'Billing' },
  { to: '/dashboard/order-transaction-history', icon: Receipt, label: 'Transactions' },
  { to: '/dashboard/help-and-about', icon: HelpCircle, label: 'Help & About' },
]

const SIDEBAR_COLLAPSED_KEY = 'creator-ops-sidebar-collapsed'

interface DashboardLeftNavProps {
  collapsed: boolean
  onCollapseToggle: () => void
  onMobileMenuOpen?: () => void
}

export function DashboardLeftNav({
  collapsed,
  onCollapseToggle,
  onMobileMenuOpen,
}: DashboardLeftNavProps) {
  const handleToggle = () => {
    const next = !collapsed
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next))
    } catch {
      // ignore
    }
    onCollapseToggle()
  }

  const location = useLocation()

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r bg-card transition-all duration-300 shrink-0 min-w-0',
        collapsed ? 'w-[72px] max-w-[90vw]' : 'w-56 lg:w-64 max-w-[90vw]'
      )}
      aria-label="Creator Ops navigation"
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {collapsed ? (
          <h2 className="sr-only">Creator Ops</h2>
        ) : (
          <h2 className="font-semibold text-lg truncate">Creator Ops</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hover:scale-[1.02] active:scale-[0.98]"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto min-h-0" aria-label="Main navigation">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive =
            location.pathname === to ||
            (to !== '/dashboard' && location.pathname.startsWith(to + '/')) ||
            (to === '/dashboard/settings' && location.pathname.includes('settings'))
          return (
            <Link
              key={to}
              to={to}
              onClick={onMobileMenuOpen}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                'hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive && 'bg-primary/10 text-primary',
                collapsed && 'justify-center px-0'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
