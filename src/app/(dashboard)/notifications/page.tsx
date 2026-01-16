import Link from 'next/link'
import { getNotifications, markAllNotificationsRead } from '@/actions/notifications'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  ClipboardCheck,
  AlertTriangle,
  MessageSquare,
  CheckCheck,
  Settings,
} from 'lucide-react'
import { NotificationItem } from './notification-item'

function getNotificationIcon(type: string) {
  switch (type) {
    case 'audit_due':
    case 'audit_completed':
      return <ClipboardCheck className="h-5 w-5 text-blue-500" />
    case 'issue_assigned':
    case 'issue_escalated':
    case 'issue_due_soon':
    case 'issue_overdue':
      return <AlertTriangle className="h-5 w-5 text-orange-500" />
    case 'comment_added':
      return <MessageSquare className="h-5 w-5 text-green-500" />
    default:
      return <Bell className="h-5 w-5 text-gray-500" />
  }
}

export default async function NotificationsPage() {
  const notifications = await getNotifications(50)
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <form action={markAllNotificationsRead}>
              <Button variant="outline" type="submit">
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            </form>
          )}
          <Button variant="outline" asChild>
            <Link href="/settings/notifications">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>
            Stay updated on audits, issues, and team activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-500">
                You&apos;ll be notified about audits, issues, and team updates here.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  icon={getNotificationIcon(notification.type)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
