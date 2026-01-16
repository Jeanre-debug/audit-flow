'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireOrganization } from './auth'
import { z } from 'zod'

const questionSchema = z.object({
  text: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['yes_no', 'pass_fail', 'numeric', 'text', 'photo', 'multi_choice', 'rating']),
  isRequired: z.boolean().default(true),
  isCritical: z.boolean().default(false),
  order: z.number().default(0),
  weight: z.number().default(1),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  targetValue: z.number().optional(),
  unit: z.string().optional(),
  options: z.array(z.string()).optional(),
})

const sectionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number().default(0),
  weight: z.number().default(1),
  questions: z.array(questionSchema),
})

const templateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  passingScore: z.number().min(0).max(100).default(80),
  sections: z.array(sectionSchema),
})

export type TemplateFormData = z.infer<typeof templateSchema>

export async function getTemplates() {
  const { organization } = await requireOrganization()

  return prisma.auditTemplate.findMany({
    where: { organizationId: organization.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: {
          sections: true,
          audits: true,
        },
      },
    },
  })
}

export async function getTemplate(id: string) {
  const { organization } = await requireOrganization()

  return prisma.auditTemplate.findFirst({
    where: { id, organizationId: organization.id },
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
  })
}

export async function createTemplate(data: TemplateFormData) {
  const { organization } = await requireOrganization()

  const validated = templateSchema.safeParse(data)
  if (!validated.success) {
    return { success: false, error: validated.error.message }
  }

  try {
    const template = await prisma.auditTemplate.create({
      data: {
        organizationId: organization.id,
        name: validated.data.name,
        description: validated.data.description,
        category: validated.data.category,
        passingScore: validated.data.passingScore,
        sections: {
          create: validated.data.sections.map((section, sIndex) => ({
            title: section.title,
            description: section.description,
            order: sIndex,
            weight: section.weight,
            questions: {
              create: section.questions.map((question, qIndex) => ({
                text: question.text,
                description: question.description,
                type: question.type,
                isRequired: question.isRequired,
                isCritical: question.isCritical,
                order: qIndex,
                weight: question.weight,
                minValue: question.minValue,
                maxValue: question.maxValue,
                targetValue: question.targetValue,
                unit: question.unit,
                options: question.options || [],
              })),
            },
          })),
        },
      },
    })

    revalidatePath('/audits/templates')
    return { success: true, templateId: template.id }
  } catch (error) {
    console.error('Failed to create template:', error)
    return { success: false, error: 'Failed to create template' }
  }
}

export async function updateTemplate(id: string, data: TemplateFormData) {
  const { organization } = await requireOrganization()

  const validated = templateSchema.safeParse(data)
  if (!validated.success) {
    return { success: false, error: validated.error.message }
  }

  try {
    // Delete existing sections and questions (cascade)
    await prisma.templateSection.deleteMany({
      where: { templateId: id },
    })

    // Update template with new sections
    await prisma.auditTemplate.update({
      where: { id, organizationId: organization.id },
      data: {
        name: validated.data.name,
        description: validated.data.description,
        category: validated.data.category,
        passingScore: validated.data.passingScore,
        version: { increment: 1 },
        sections: {
          create: validated.data.sections.map((section, sIndex) => ({
            title: section.title,
            description: section.description,
            order: sIndex,
            weight: section.weight,
            questions: {
              create: section.questions.map((question, qIndex) => ({
                text: question.text,
                description: question.description,
                type: question.type,
                isRequired: question.isRequired,
                isCritical: question.isCritical,
                order: qIndex,
                weight: question.weight,
                minValue: question.minValue,
                maxValue: question.maxValue,
                targetValue: question.targetValue,
                unit: question.unit,
                options: question.options || [],
              })),
            },
          })),
        },
      },
    })

    revalidatePath('/audits/templates')
    revalidatePath(`/audits/templates/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update template:', error)
    return { success: false, error: 'Failed to update template' }
  }
}

export async function deleteTemplate(id: string) {
  const { organization } = await requireOrganization()

  try {
    await prisma.auditTemplate.delete({
      where: { id, organizationId: organization.id },
    })

    revalidatePath('/audits/templates')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete template:', error)
    return { success: false, error: 'Failed to delete template' }
  }
}

export async function duplicateTemplate(id: string) {
  const { organization } = await requireOrganization()

  try {
    const original = await prisma.auditTemplate.findFirst({
      where: { id, organizationId: organization.id },
      include: {
        sections: {
          include: { questions: true },
        },
      },
    })

    if (!original) {
      return { success: false, error: 'Template not found' }
    }

    const newTemplate = await prisma.auditTemplate.create({
      data: {
        organizationId: organization.id,
        name: `${original.name} (Copy)`,
        description: original.description,
        category: original.category,
        passingScore: original.passingScore,
        sections: {
          create: original.sections.map((section) => ({
            title: section.title,
            description: section.description,
            order: section.order,
            weight: section.weight,
            questions: {
              create: section.questions.map((question) => ({
                text: question.text,
                description: question.description,
                type: question.type,
                isRequired: question.isRequired,
                isCritical: question.isCritical,
                order: question.order,
                weight: question.weight,
                minValue: question.minValue,
                maxValue: question.maxValue,
                targetValue: question.targetValue,
                unit: question.unit,
                options: question.options,
              })),
            },
          })),
        },
      },
    })

    revalidatePath('/audits/templates')
    return { success: true, templateId: newTemplate.id }
  } catch (error) {
    console.error('Failed to duplicate template:', error)
    return { success: false, error: 'Failed to duplicate template' }
  }
}
