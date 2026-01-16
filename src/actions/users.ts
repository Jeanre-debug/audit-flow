'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireOrganization } from './auth'
import { createClient } from '@/lib/supabase/server'

export async function getOrganizationUsers() {
  const { organization, membership } = await requireOrganization()

  // Only admins and owners can view all users
  if (!['admin', 'owner'].includes(membership.role)) {
    throw new Error('Unauthorized')
  }

  const members = await prisma.organizationMember.findMany({
    where: { organizationId: organization.id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          phone: true,
          lastLoginAt: true,
          createdAt: true,
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  })

  return members
}

export async function createUser(data: {
  email: string
  name: string
  password: string
  role: string
  phone?: string
  jobTitle?: string
  department?: string
}) {
  const { organization, membership } = await requireOrganization()

  // Only admins and owners can create users
  if (!['admin', 'owner'].includes(membership.role)) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const supabase = await createClient()

    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        name: data.name,
      },
    })

    if (authError) {
      console.error('Supabase auth error:', authError)
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user in auth system' }
    }

    // Create the user in our database
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        authId: authData.user.id,
      },
    })

    // Add user to organization
    await prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        role: data.role,
        jobTitle: data.jobTitle,
        department: data.department,
      },
    })

    revalidatePath('/settings/users')
    return { success: true }
  } catch (error) {
    console.error('Failed to create user:', error)
    return { success: false, error: 'Failed to create user' }
  }
}

export async function updateUserRole(userId: string, role: string) {
  const { organization, membership } = await requireOrganization()

  // Only owners can change roles, admins can only manage non-admin roles
  if (membership.role !== 'owner' && (role === 'owner' || role === 'admin')) {
    return { success: false, error: 'Only owners can assign admin roles' }
  }

  if (!['admin', 'owner'].includes(membership.role)) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await prisma.organizationMember.updateMany({
      where: {
        organizationId: organization.id,
        userId,
      },
      data: { role },
    })

    revalidatePath('/settings/users')
    return { success: true }
  } catch (error) {
    console.error('Failed to update user role:', error)
    return { success: false, error: 'Failed to update role' }
  }
}

export async function toggleUserStatus(userId: string) {
  const { organization, membership } = await requireOrganization()

  if (!['admin', 'owner'].includes(membership.role)) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const member = await prisma.organizationMember.findFirst({
      where: {
        organizationId: organization.id,
        userId,
      },
    })

    if (!member) {
      return { success: false, error: 'User not found' }
    }

    await prisma.organizationMember.update({
      where: { id: member.id },
      data: { isActive: !member.isActive },
    })

    revalidatePath('/settings/users')
    return { success: true }
  } catch (error) {
    console.error('Failed to toggle user status:', error)
    return { success: false, error: 'Failed to update user status' }
  }
}

export async function removeUserFromOrganization(userId: string) {
  const { organization, membership, user } = await requireOrganization()

  if (!['admin', 'owner'].includes(membership.role)) {
    return { success: false, error: 'Unauthorized' }
  }

  // Cannot remove yourself
  if (userId === user.id) {
    return { success: false, error: 'Cannot remove yourself' }
  }

  try {
    await prisma.organizationMember.deleteMany({
      where: {
        organizationId: organization.id,
        userId,
      },
    })

    revalidatePath('/settings/users')
    return { success: true }
  } catch (error) {
    console.error('Failed to remove user:', error)
    return { success: false, error: 'Failed to remove user' }
  }
}
