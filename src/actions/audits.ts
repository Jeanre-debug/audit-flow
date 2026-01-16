'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireOrganization } from './auth'

export async function getAudits(filters?: {
  status?: string
  siteId?: string
  templateId?: string
}) {
  const { organization, user } = await requireOrganization()

  return prisma.audit.findMany({
    where: {
      organizationId: organization.id,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.siteId && { siteId: filters.siteId }),
      ...(filters?.templateId && { templateId: filters.templateId }),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      template: { select: { name: true, category: true } },
      site: { select: { id: true, name: true } },
      auditor: { select: { id: true, name: true } },
    },
  })
}

export async function getAudit(id: string) {
  const { organization } = await requireOrganization()

  return prisma.audit.findFirst({
    where: { id, organizationId: organization.id },
    include: {
      template: {
        include: {
          sections: {
            orderBy: { order: 'asc' },
            include: {
              questions: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      },
      site: true,
      auditor: { select: { id: true, name: true, email: true } },
      reviewer: { select: { id: true, name: true, email: true } },
      responses: {
        include: {
          media: true,
        },
      },
    },
  })
}

export async function startAudit(data: {
  templateId: string
  siteId: string
  scheduledFor?: Date
}) {
  const { organization, user } = await requireOrganization()

  try {
    const template = await prisma.auditTemplate.findFirst({
      where: { id: data.templateId, organizationId: organization.id },
    })

    if (!template) {
      return { success: false, error: 'Template not found' }
    }

    const audit = await prisma.audit.create({
      data: {
        organizationId: organization.id,
        templateId: data.templateId,
        siteId: data.siteId,
        auditorId: user.id,
        status: 'in_progress',
        startedAt: new Date(),
        scheduledFor: data.scheduledFor,
      },
    })

    revalidatePath('/audits')
    return { success: true, auditId: audit.id }
  } catch (error) {
    console.error('Failed to start audit:', error)
    return { success: false, error: 'Failed to start audit' }
  }
}

export async function saveAuditResponse(data: {
  auditId: string
  questionId: string
  value?: string
  boolValue?: boolean
  numericValue?: number
  notes?: string
  flagged?: boolean
}) {
  const { organization } = await requireOrganization()

  // Verify audit belongs to organization
  const audit = await prisma.audit.findFirst({
    where: { id: data.auditId, organizationId: organization.id },
    include: {
      template: {
        include: {
          sections: {
            include: { questions: true },
          },
        },
      },
    },
  })

  if (!audit) {
    return { success: false, error: 'Audit not found' }
  }

  // Find the question to calculate score
  const question = audit.template.sections
    .flatMap((s) => s.questions)
    .find((q) => q.id === data.questionId)

  if (!question) {
    return { success: false, error: 'Question not found' }
  }

  // Calculate score based on question type and response
  let score = 0
  let maxScore = question.weight
  let passed = true

  if (question.type === 'yes_no' || question.type === 'pass_fail') {
    passed = data.boolValue === true
    score = passed ? maxScore : 0
  } else if (question.type === 'numeric' && data.numericValue !== undefined) {
    // Check if within acceptable range
    const inRange =
      (question.minValue === null || data.numericValue >= question.minValue) &&
      (question.maxValue === null || data.numericValue <= question.maxValue)
    passed = inRange
    score = passed ? maxScore : 0
  } else if (question.type === 'rating' && data.numericValue !== undefined) {
    // Rating is typically 1-5, calculate proportional score
    score = (data.numericValue / 5) * maxScore
    passed = data.numericValue >= 3
  } else if (question.type === 'text' || question.type === 'photo') {
    // Text and photo questions are always "passed" if answered
    score = maxScore
    passed = true
  }

  try {
    await prisma.auditResponse.upsert({
      where: {
        auditId_questionId: {
          auditId: data.auditId,
          questionId: data.questionId,
        },
      },
      create: {
        auditId: data.auditId,
        questionId: data.questionId,
        value: data.value,
        boolValue: data.boolValue,
        numericValue: data.numericValue,
        notes: data.notes,
        flagged: data.flagged,
        score,
        maxScore,
        passed,
      },
      update: {
        value: data.value,
        boolValue: data.boolValue,
        numericValue: data.numericValue,
        notes: data.notes,
        flagged: data.flagged,
        score,
        maxScore,
        passed,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to save response:', error)
    return { success: false, error: 'Failed to save response' }
  }
}

export async function completeAudit(auditId: string, signature?: string) {
  const { organization } = await requireOrganization()

  try {
    const audit = await prisma.audit.findFirst({
      where: { id: auditId, organizationId: organization.id },
      include: {
        responses: true,
        template: true,
      },
    })

    if (!audit) {
      return { success: false, error: 'Audit not found' }
    }

    // Calculate total scores
    const totalScore = audit.responses.reduce((sum, r) => sum + (r.score || 0), 0)
    const maxScore = audit.responses.reduce((sum, r) => sum + (r.maxScore || 0), 0)
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0
    const passed = percentage >= audit.template.passingScore

    // Check for critical failures
    const hasCriticalFailure = audit.responses.some(
      (r) => !r.passed && r.flagged
    )

    await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        totalScore,
        maxScore,
        percentage,
        passed: passed && !hasCriticalFailure,
        auditorSignature: signature,
        auditorSignedAt: signature ? new Date() : undefined,
      },
    })

    // Create issues for failed responses
    const failedResponses = audit.responses.filter((r) => !r.passed)
    if (failedResponses.length > 0) {
      // We'll create issues in the issues module
    }

    revalidatePath('/audits')
    revalidatePath(`/audits/${auditId}`)
    return { success: true, passed: passed && !hasCriticalFailure, percentage }
  } catch (error) {
    console.error('Failed to complete audit:', error)
    return { success: false, error: 'Failed to complete audit' }
  }
}

export async function deleteAudit(id: string) {
  const { organization } = await requireOrganization()

  try {
    await prisma.audit.delete({
      where: { id, organizationId: organization.id },
    })

    revalidatePath('/audits')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete audit:', error)
    return { success: false, error: 'Failed to delete audit' }
  }
}
