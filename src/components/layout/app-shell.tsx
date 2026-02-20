import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import { DashboardLeftNav } from '@/components/dashboard/dashboard-left-nav'
import { navItems } from '@/constants/nav-items'
import { cn } from '@/lib/utils'

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('creator-ops-sidebar-collapsed') === 'true'
    } catch {
      return false
    }
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const handleSidebarToggle = () => {
    setSidebarCollapsed((prev) => !prev)
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardLeftNav
        collapsed={sidebarCollapsed}
        onCollapseToggle={handleSidebarToggle}
      />

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="flex h-16 items-center border-b px-4">
              <span className="font-semibold text-lg">Creator Ops</span>
            </div>
            <nav className="flex-1 space-y-1 p-4">
              {navItems.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:text-primary',
                    location.pathname === to && 'bg-primary/10 text-primary'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardTopbar onMobileMenuOpen={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
