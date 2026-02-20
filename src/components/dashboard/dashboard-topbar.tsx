import { Link, useNavigate } from 'react-router-dom'
import { Menu, User, LogOut, Settings } from 'lucide-react'
import { logout } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { GlobalSearch } from '@/components/dashboard/global-search'
import { NotificationsDropdown } from '@/components/dashboard/notifications-dropdown'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface DashboardTopbarProps {
  onMobileMenuOpen?: () => void
  className?: string
}

export function DashboardTopbar({ onMobileMenuOpen, className }: DashboardTopbarProps) {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await logout()
    navigate('/login-/-signup', { replace: true })
  }

  return (
    <header
      className={cn(
        'flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 transition-all duration-200',
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden shrink-0"
        onClick={onMobileMenuOpen}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1 flex items-center gap-4 min-w-0">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <NotificationsDropdown />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:ring-2 hover:ring-primary/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              aria-label="User menu"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  U
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/dashboard/settings"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" className="cursor-pointer" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
