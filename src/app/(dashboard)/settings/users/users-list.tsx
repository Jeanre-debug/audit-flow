'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MoreHorizontal, Shield, User, UserX, UserCheck } from 'lucide-react'
import { updateUserRole, toggleUserStatus, removeUserFromOrganization } from '@/actions/users'

interface UserWithMembership {
  id: string
  role: string
  isActive: boolean
  jobTitle: string | null
  department: string | null
  joinedAt: Date
  user: {
    id: string
    email: string
    name: string | null
    avatarUrl: string | null
    phone: string | null
    lastLoginAt: Date | null
    createdAt: Date
  }
}

const roles = [
  { value: 'owner', label: 'Owner', description: 'Full access to everything' },
  { value: 'admin', label: 'Admin', description: 'Manage users and settings' },
  { value: 'manager', label: 'Manager', description: 'Manage audits and issues' },
  { value: 'member', label: 'Member', description: 'Perform audits and log entries' },
  { value: 'viewer', label: 'Viewer', description: 'View-only access' },
]

function getRoleBadge(role: string) {
  const variants: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
    owner: 'destructive',
    admin: 'default',
    manager: 'secondary',
    member: 'outline',
    viewer: 'outline',
  }
  return <Badge variant={variants[role] || 'outline'}>{role}</Badge>
}

export function UsersList({ users }: { users: UserWithMembership[] }) {
  const [updating, setUpdating] = useState<string | null>(null)

  const handleRoleChange = async (userId: string, role: string) => {
    setUpdating(userId)
    await updateUserRole(userId, role)
    setUpdating(null)
  }

  const handleToggleStatus = async (userId: string) => {
    setUpdating(userId)
    await toggleUserStatus(userId)
    setUpdating(null)
  }

  const handleRemove = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user from the organization?')) {
      return
    }
    setUpdating(userId)
    await removeUserFromOrganization(userId)
    setUpdating(null)
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No users found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {users.map((member) => (
        <div
          key={member.id}
          className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 border rounded-lg ${
            !member.isActive ? 'opacity-60 bg-gray-50 dark:bg-gray-800/50' : ''
          }`}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={member.user.avatarUrl || undefined} />
              <AvatarFallback>
                {member.user.name?.[0]?.toUpperCase() || member.user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium truncate">
                  {member.user.name || 'Unnamed User'}
                </p>
                {getRoleBadge(member.role)}
                {!member.isActive && (
                  <Badge variant="outline" className="text-gray-500">
                    Inactive
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate">{member.user.email}</p>
              {member.jobTitle && (
                <p className="text-xs text-gray-400">{member.jobTitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 justify-end">
            <Select
              value={member.role}
              onValueChange={(value) => handleRoleChange(member.user.id, value)}
              disabled={updating === member.user.id}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div>
                      <p>{role.label}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={updating === member.user.id}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleToggleStatus(member.user.id)}>
                  {member.isActive ? (
                    <>
                      <UserX className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleRemove(member.user.id)}
                  className="text-red-600"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Remove from Organization
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  )
}
