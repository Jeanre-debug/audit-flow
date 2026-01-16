'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireOrganization } from './auth'

export async function getNotifications(limit: number = 20) {
  const { organization, user } = await requireOrganization()

  return prisma.notification.findMany({
    where: {
      organizationId: organization.id,
      userId: user.id,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function getUnreadNotificationCount() {
  const { organization, user } = await requireOrganization()

  return prisma.notification.count({
    where: {
      organizationId: organization.id,
      userId: user.id,
      isRead: false,
    },
  })
}

export async function markNotificationRead(id: string) {
  const { organization, user } = await requireOrganization()

  try {
    await prisma.notification.update({
      where: {
        id,
        organizationId: organization.id,
        userId: user.id,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    revalidatePath('/notifications')
    return { success: true }
  } catch (error) {
    console.error('Failed to mark notification read:', error)
    return { success: false, error: 'Failed to mark notification read' }
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  const { organization, user } = await requireOrganization()

  try {
    await prisma.notification.updateMany({
      where: {
        organizationId: organization.id,
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    revalidatePath('/notifications')
  } catch (error) {
    console.error('Failed to mark all notifications read:', error)
  }
}

export async function deleteNotification(id: string) {
  const { organization, user } = await requireOrganization()

  try {
    await prisma.notification.delete({
      where: {
        id,
        organizationId: organization.id,
        userId: user.id,
      },
    })

    revalidatePath('/notifications')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete notification:', error)
    return { success: false, error: 'Failed to delete notification' }
  }
}

export async function createNotification(data: {
  userId: string
  type: string
  title: string
  message: string
  link?: string
}) {
  const { organization } = await requireOrganization()

  try {
    await prisma.notification.create({
      data: {
        organizationId: organization.id,
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to create notification:', error)
    return { success: false, error: 'Failed to create notification' }
  }
}

// Notification preference functions
export async function getNotificationPreferences() {
  const { user } = await requireOrganization()

  return prisma.notificationPreference.findMany({
    where: { userId: user.id },
  })
}

export async function updateNotificationPreference(data: {
  type: string
  email: boolean
  inApp: boolean
  push: boolean
}) {
  const { user } = await requireOrganization()

  try {
    await prisma.notificationPreference.upsert({
      where: {
        userId_type: {
          userId: user.id,
          type: data.type,
        },
      },
      create: {
        userId: user.id,
        type: data.type,
        email: data.email,
        inApp: data.inApp,
        push: data.push,
      },
      update: {
        email: data.email,
        inApp: data.inApp,
        push: data.push,
      },
    })

    revalidatePath('/settings/notifications')
    return { success: true }
  } catch (error) {
    console.error('Failed to update notification preference:', error)
    return { success: false, error: 'Failed to update notification preference' }
  }
}
