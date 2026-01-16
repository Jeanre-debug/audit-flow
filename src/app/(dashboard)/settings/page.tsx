import Link from 'next/link'
import { requireOrganization } from '@/actions/auth'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Building2, Bell, Users, CreditCard, ArrowRight, Shield } from 'lucide-react'

export default async function SettingsPage() {
  const { membership } = await requireOrganization()
  const isAdmin = ['admin', 'owner'].includes(membership.role)

  const settingsItems = [
    {
      title: 'Profile',
      description: 'Manage your personal information and preferences',
      href: '/settings/profile',
      icon: User,
      adminOnly: false,
    },
    {
      title: 'User Management',
      description: 'Create users and manage access requests',
      href: '/settings/users',
      icon: Shield,
      adminOnly: true,
    },
    {
      title: 'Organization',
      description: 'Manage organization settings and branding',
      href: '/settings/organization',
      icon: Building2,
      adminOnly: true,
    },
    {
      title: 'Team Members',
      description: 'View team members and roles',
      href: '/settings/team',
      icon: Users,
      adminOnly: false,
    },
    {
      title: 'Notifications',
      description: 'Configure notification preferences',
      href: '/settings/notifications',
      icon: Bell,
      adminOnly: false,
    },
    {
      title: 'Billing',
      description: 'Manage subscription and payment methods',
      href: '/settings/billing',
      icon: CreditCard,
      adminOnly: true,
    },
  ]

  const visibleItems = settingsItems.filter(
    (item) => !item.adminOnly || isAdmin
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          {isAdmin && (
            <Badge variant="secondary">
              <Shield className="h-3 w-3 mr-1" />
              {membership.role}
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage your account and organization settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {visibleItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:shadow-md transition-shadow h-full active:bg-gray-50 dark:active:bg-gray-800">
              <CardHeader className="flex flex-row items-center gap-3 sm:gap-4 p-4 sm:p-6">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg">{item.title}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {item.description}
                  </CardDescription>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
