import {
  Home,
  FolderOpen,
  LayoutList,
  Search,
  Calendar,
  Plug,
  BarChart3,
  Settings,
  FileEdit,
  HelpCircle,
  CreditCard,
  Receipt,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  icon: LucideIcon
  label: string
}

export const navItems: NavItem[] = [
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
