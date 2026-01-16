'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NavItems } from './nav-items'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  organizationName?: string
}

export function Sidebar({ organizationName }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo and brand */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AF</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                AuditFlow
              </span>
              {organizationName && (
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
                  {organizationName}
                </span>
              )}
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <NavItems collapsed={collapsed} />
    </aside>
  )
}
