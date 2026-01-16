'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireOrganization } from './auth'

export async function submitAccessRequest(data: {
  name: string
  email: string
  phone?: string
  company?: string
  message?: string
}) {
  try {
    // Check if request already exists for this email
    const existing = await prisma.accessRequest.findFirst({
      where: { email: data.email, status: 'pending' },
    })

    if (existing) {
      return { success: false, error: 'A request with this email is already pending' }
    }

    await prisma.accessRequest.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        message: data.message,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to submit access request:', error)
    return { success: false, error: 'Failed to submit request' }
  }
}

export async function getAccessRequests(status?: string) {
  const { membership } = await requireOrganization()

  // Only admins and owners can view access requests
  if (!['admin', 'owner'].includes(membership.role)) {
    throw new Error('Unauthorized')
  }

  return prisma.accessRequest.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateAccessRequestStatus(
  id: string,
  status: 'approved' | 'rejected',
  notes?: string
) {
  const { user, membership } = await requireOrganization()

  // Only admins and owners can update access requests
  if (!['admin', 'owner'].includes(membership.role)) {
    throw new Error('Unauthorized')
  }

  try {
    await prisma.accessRequest.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedById: user.id,
        reviewNotes: notes,
      },
    })

    revalidatePath('/settings/users')
    return { success: true }
  } catch (error) {
    console.error('Failed to update access request:', error)
    return { success: false, error: 'Failed to update request' }
  }
}

export async function deleteAccessRequest(id: string) {
  const { membership } = await requireOrganization()

  // Only admins and owners can delete access requests
  if (!['admin', 'owner'].includes(membership.role)) {
    throw new Error('Unauthorized')
  }

  try {
    await prisma.accessRequest.delete({
      where: { id },
    })

    revalidatePath('/settings/users')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete access request:', error)
    return { success: false, error: 'Failed to delete request' }
  }
}
