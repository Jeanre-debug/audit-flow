'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ClipboardCheck,
  AlertTriangle,
  MapPin,
  Package,
  FileText,
  ClipboardList,
  Settings,
  Bell,
} from 'lucide-react'

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Audits',
    href: '/audits',
    icon: ClipboardCheck,
  },
  {
    title: 'Issues',
    href: '/issues',
    icon: AlertTriangle,
  },
  {
    title: 'Sites',
    href: '/sites',
    icon: MapPin,
  },
  {
    title: 'Assets',
    href: '/assets',
    icon: Package,
  },
  {
    title: 'Daily Logs',
    href: '/logs',
    icon: ClipboardList,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: FileText,
  },
]

const bottomNavItems = [
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

interface NavItemsProps {
  collapsed?: boolean
}

export function NavItems({ collapsed }: NavItemsProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
              )}
            >
              <item.icon className={cn('h-5 w-5 shrink-0', collapsed && 'mx-auto')} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-200 dark:border-gray-700 px-2 py-4 space-y-1">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
              )}
            >
              <item.icon className={cn('h-5 w-5 shrink-0', collapsed && 'mx-auto')} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function MobileNavItems() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {[...navItems, ...bottomNavItems].map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors',
              isActive
                ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}
