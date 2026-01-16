import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Building2, Bell, Users, CreditCard, ArrowRight } from 'lucide-react'

const settingsItems = [
  {
    title: 'Profile',
    description: 'Manage your personal information and preferences',
    href: '/settings/profile',
    icon: User,
  },
  {
    title: 'Organization',
    description: 'Manage organization settings and branding',
    href: '/settings/organization',
    icon: Building2,
  },
  {
    title: 'Team Members',
    description: 'Invite and manage team members',
    href: '/settings/team',
    icon: Users,
  },
  {
    title: 'Notifications',
    description: 'Configure notification preferences',
    href: '/settings/notifications',
    icon: Bell,
  },
  {
    title: 'Billing',
    description: 'Manage subscription and payment methods',
    href: '/settings/billing',
    icon: CreditCard,
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account and organization settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <item.icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
