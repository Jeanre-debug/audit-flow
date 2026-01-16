'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Check, Trash2 } from 'lucide-react'
import { markNotificationRead, deleteNotification } from '@/actions/notifications'
import { cn } from '@/lib/utils'

interface NotificationItemProps {
  notification: {
    id: string
    type: string
    title: string
    message: string
    link: string | null
    isRead: boolean
    createdAt: Date
  }
  icon: React.ReactNode
}

export function NotificationItem({ notification, icon }: NotificationItemProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleMarkRead = async () => {
    if (notification.isRead) return
    setLoading(true)
    await markNotificationRead(notification.id)
    setLoading(false)
    router.refresh()
  }

  const handleDelete = async () => {
    setLoading(true)
    await deleteNotification(notification.id)
    setLoading(false)
    router.refresh()
  }

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(date).toLocaleDateString()
  }

  const content = (
    <div
      className={cn(
        'flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
        !notification.isRead && 'bg-blue-50/50 dark:bg-blue-900/10'
      )}
    >
      <div className="shrink-0 mt-1">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <p className={cn('font-medium', !notification.isRead && 'text-blue-600')}>
              {notification.title}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {notification.message}
            </p>
          </div>
          <span className="text-xs text-gray-500 shrink-0 ml-4">
            {timeAgo(notification.createdAt)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {!notification.isRead && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault()
              handleMarkRead()
            }}
            disabled={loading}
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-600"
          onClick={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          disabled={loading}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  if (notification.link) {
    return (
      <Link href={notification.link} onClick={handleMarkRead}>
        {content}
      </Link>
    )
  }

  return content
}
