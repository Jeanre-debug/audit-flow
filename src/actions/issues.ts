'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireOrganization } from './auth'
import { z } from 'zod'

const issueSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['non_conformance', 'observation', 'recommendation']).default('non_conformance'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  siteId: z.string().optional(),
  assignedToId: z.string().optional(),
  dueDate: z.string().optional(),
})

export type IssueFormState = {
  errors?: Record<string, string[]>
  message?: string
  success?: boolean
}

export async function getIssues(filters?: {
  status?: string
  priority?: string
  siteId?: string
  assignedToId?: string
}) {
  const { organization } = await requireOrganization()

  return prisma.issue.findMany({
    where: {
      organizationId: organization.id,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.priority && { priority: filters.priority }),
      ...(filters?.siteId && { siteId: filters.siteId }),
      ...(filters?.assignedToId && { assignedToId: filters.assignedToId }),
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    include: {
      site: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      audit: { select: { id: true, template: { select: { name: true } } } },
      _count: {
        select: { comments: true, media: true },
      },
    },
  })
}

export async function getIssue(id: string) {
  const { organization } = await requireOrganization()

  return prisma.issue.findFirst({
    where: { id, organizationId: organization.id },
    include: {
      site: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      audit: {
        select: {
          id: true,
          template: { select: { name: true } },
          completedAt: true,
        },
      },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
      media: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

export async function createIssue(
  prevState: IssueFormState,
  formData: FormData
): Promise<IssueFormState> {
  const { organization, user } = await requireOrganization()

  const validatedFields = issueSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    type: formData.get('type') || 'non_conformance',
    priority: formData.get('priority') || 'medium',
    siteId: formData.get('siteId') || undefined,
    assignedToId: formData.get('assignedToId') || undefined,
    dueDate: formData.get('dueDate') || undefined,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please fix the errors above.',
    }
  }

  try {
    await prisma.issue.create({
      data: {
        organizationId: organization.id,
        createdById: user.id,
        title: validatedFields.data.title,
        description: validatedFields.data.description,
        type: validatedFields.data.type,
        priority: validatedFields.data.priority,
        siteId: validatedFields.data.siteId,
        assignedToId: validatedFields.data.assignedToId,
        dueDate: validatedFields.data.dueDate
          ? new Date(validatedFields.data.dueDate)
          : undefined,
      },
    })

    revalidatePath('/issues')
    return { success: true, message: 'Issue created successfully' }
  } catch (error) {
    console.error('Failed to create issue:', error)
    return { message: 'Failed to create issue. Please try again.' }
  }
}

export async function createIssueFromAudit(data: {
  auditId: string
  siteId: string
  title: string
  description?: string
  questionId?: string
}) {
  const { organization, user } = await requireOrganization()

  try {
    await prisma.issue.create({
      data: {
        organizationId: organization.id,
        createdById: user.id,
        auditId: data.auditId,
        siteId: data.siteId,
        title: data.title,
        description: data.description,
        type: 'non_conformance',
        priority: 'medium',
      },
    })

    revalidatePath('/issues')
    return { success: true }
  } catch (error) {
    console.error('Failed to create issue from audit:', error)
    return { success: false, error: 'Failed to create issue' }
  }
}

export async function updateIssue(
  id: string,
  prevState: IssueFormState,
  formData: FormData
): Promise<IssueFormState> {
  const { organization } = await requireOrganization()

  const validatedFields = issueSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    type: formData.get('type') || 'non_conformance',
    priority: formData.get('priority') || 'medium',
    siteId: formData.get('siteId') || undefined,
    assignedToId: formData.get('assignedToId') || undefined,
    dueDate: formData.get('dueDate') || undefined,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please fix the errors above.',
    }
  }

  try {
    await prisma.issue.update({
      where: { id, organizationId: organization.id },
      data: {
        title: validatedFields.data.title,
        description: validatedFields.data.description,
        type: validatedFields.data.type,
        priority: validatedFields.data.priority,
        siteId: validatedFields.data.siteId || null,
        assignedToId: validatedFields.data.assignedToId || null,
        dueDate: validatedFields.data.dueDate
          ? new Date(validatedFields.data.dueDate)
          : null,
      },
    })

    revalidatePath('/issues')
    revalidatePath(`/issues/${id}`)
    return { success: true, message: 'Issue updated successfully' }
  } catch (error) {
    console.error('Failed to update issue:', error)
    return { message: 'Failed to update issue. Please try again.' }
  }
}

export async function updateIssueStatus(
  id: string,
  status: string,
  data?: { resolution?: string; rootCause?: string; preventiveAction?: string }
) {
  const { organization } = await requireOrganization()

  const now = new Date()
  const updates: Record<string, unknown> = { status }

  if (status === 'resolved') {
    updates.resolvedAt = now
    updates.resolution = data?.resolution
    updates.rootCause = data?.rootCause
    updates.preventiveAction = data?.preventiveAction
  } else if (status === 'verified') {
    updates.verifiedAt = now
  } else if (status === 'closed') {
    updates.closedAt = now
  }

  try {
    await prisma.issue.update({
      where: { id, organizationId: organization.id },
      data: updates,
    })

    revalidatePath('/issues')
    revalidatePath(`/issues/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update issue status:', error)
    return { success: false, error: 'Failed to update issue status' }
  }
}

export async function addIssueComment(issueId: string, content: string) {
  const { organization, user } = await requireOrganization()

  // Verify issue belongs to organization
  const issue = await prisma.issue.findFirst({
    where: { id: issueId, organizationId: organization.id },
  })

  if (!issue) {
    return { success: false, error: 'Issue not found' }
  }

  try {
    await prisma.issueComment.create({
      data: {
        issueId,
        userId: user.id,
        content,
      },
    })

    revalidatePath(`/issues/${issueId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to add comment:', error)
    return { success: false, error: 'Failed to add comment' }
  }
}

export async function deleteIssue(id: string) {
  const { organization } = await requireOrganization()

  try {
    await prisma.issue.delete({
      where: { id, organizationId: organization.id },
    })

    revalidatePath('/issues')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete issue:', error)
    return { success: false, error: 'Failed to delete issue' }
  }
}

// Media upload/delete functions
export async function uploadIssueMedia(
  issueId: string,
  data: {
    base64: string
    filename: string
    mimeType: string
    stage: 'initial' | 'resolution' | 'verification'
    caption?: string
  }
) {
  const { organization } = await requireOrganization()

  // Verify issue belongs to organization
  const issue = await prisma.issue.findFirst({
    where: { id: issueId, organizationId: organization.id },
  })

  if (!issue) {
    return { success: false, error: 'Issue not found' }
  }

  try {
    // For now, store base64 directly (for production, use Supabase Storage)
    await prisma.issueMedia.create({
      data: {
        issueId,
        type: 'photo',
        url: data.base64,
        filename: data.filename,
        caption: data.caption,
        stage: data.stage,
      },
    })

    revalidatePath(`/issues/${issueId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to upload media:', error)
    return { success: false, error: 'Failed to upload image' }
  }
}

export async function deleteIssueMedia(issueId: string, mediaId: string) {
  const { organization } = await requireOrganization()

  // Verify issue belongs to organization
  const issue = await prisma.issue.findFirst({
    where: { id: issueId, organizationId: organization.id },
  })

  if (!issue) {
    return { success: false, error: 'Issue not found' }
  }

  try {
    await prisma.issueMedia.delete({
      where: { id: mediaId, issueId },
    })

    revalidatePath(`/issues/${issueId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete media:', error)
    return { success: false, error: 'Failed to delete image' }
  }
}
