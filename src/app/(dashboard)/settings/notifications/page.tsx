import { getNotificationPreferences } from '@/actions/notifications'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

const notificationTypes = [
  {
    type: 'audit_due',
    title: 'Audit Due Reminders',
    description: 'Get notified when audits are coming due',
  },
  {
    type: 'audit_completed',
    title: 'Audit Completed',
    description: 'Get notified when audits are completed',
  },
  {
    type: 'issue_assigned',
    title: 'Issue Assigned',
    description: 'Get notified when an issue is assigned to you',
  },
  {
    type: 'issue_due_soon',
    title: 'Issue Due Soon',
    description: 'Get notified when assigned issues are due soon',
  },
  {
    type: 'issue_overdue',
    title: 'Issue Overdue',
    description: 'Get notified when assigned issues become overdue',
  },
  {
    type: 'comment_added',
    title: 'New Comments',
    description: 'Get notified when someone comments on your issues',
  },
]

export default async function NotificationSettingsPage() {
  const preferences = await getNotificationPreferences()
  const prefsMap = Object.fromEntries(preferences.map((p) => [p.type, p]))

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Notification Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose how you want to be notified
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Configure which notifications you receive via email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {notificationTypes.map((item) => {
            const pref = prefsMap[item.type]
            const emailEnabled = pref?.email ?? true

            return (
              <div key={item.type} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{item.title}</Label>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <Switch defaultChecked={emailEnabled} />
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>In-App Notifications</CardTitle>
          <CardDescription>
            Configure which notifications appear in the app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {notificationTypes.map((item) => {
            const pref = prefsMap[item.type]
            const inAppEnabled = pref?.inApp ?? true

            return (
              <div key={item.type} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{item.title}</Label>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <Switch defaultChecked={inAppEnabled} />
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
