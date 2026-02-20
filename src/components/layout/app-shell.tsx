import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
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
        onMobileMenuOpen={() => setMobileOpen(false)}
      />

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-64 p-0"
          aria-label="Mobile navigation menu"
        >
          <div className="flex flex-col h-full">
            <div className="flex h-16 items-center border-b px-4">
              <span className="font-semibold text-lg">Creator Ops</span>
            </div>
            <nav
              className="flex-1 space-y-1 p-4"
              aria-label="Main navigation"
            >
              {navItems.map(({ to, icon: Icon, label }) => {
                const isActive =
                  location.pathname === to ||
                  (to !== '/dashboard' && location.pathname.startsWith(to + '/')) ||
                  (to === '/dashboard/settings-&-preferences' &&
                    location.pathname.includes('settings'))
                return (
                  <Button
                    key={to}
                    asChild
                    variant="ghost"
                    className={cn(
                      'w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:scale-[1.02] active:scale-[0.98]',
                      isActive && 'bg-primary/10 text-primary'
                    )}
                  >
                    <Link
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      aria-label={`Navigate to ${label}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="h-5 w-5 shrink-0" aria-hidden />
                      <span>{label}</span>
                    </Link>
                  </Button>
                )
              })}
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
