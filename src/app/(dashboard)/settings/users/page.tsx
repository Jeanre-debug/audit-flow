import { redirect } from 'next/navigation'
import { requireOrganization } from '@/actions/auth'
import { getOrganizationUsers } from '@/actions/users'
import { getAccessRequests } from '@/actions/access-requests'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Users, Clock } from 'lucide-react'
import { UsersList } from './users-list'
import { AccessRequestsList } from './access-requests-list'
import { CreateUserDialog } from './create-user-dialog'

export default async function UsersManagementPage() {
  const { membership } = await requireOrganization()

  // Only admins and owners can access this page
  if (!['admin', 'owner'].includes(membership.role)) {
    redirect('/dashboard')
  }

  const [users, pendingRequests] = await Promise.all([
    getOrganizationUsers(),
    getAccessRequests('pending'),
  ])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage users and access requests
          </p>
        </div>
        <CreateUserDialog />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div className="text-xl sm:text-2xl font-bold">{users.length}</div>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-green-500" />
              <div className="text-xl sm:text-2xl font-bold">
                {users.filter((u) => u.isActive).length}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">Active</p>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div className="text-xl sm:text-2xl font-bold">{pendingRequests.length}</div>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">Pending Requests</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="users" className="flex-1 sm:flex-none">
            <Users className="h-4 w-4 mr-2" />
            Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex-1 sm:flex-none">
            <Clock className="h-4 w-4 mr-2" />
            Requests
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Users</CardTitle>
              <CardDescription>
                Manage user roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsersList users={users} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Requests</CardTitle>
              <CardDescription>
                Review and approve access requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccessRequestsList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
