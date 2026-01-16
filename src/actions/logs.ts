'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireOrganization } from './auth'
import { z } from 'zod'

const logTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.string().min(1, 'Type is required'),
  frequency: z.enum(['hourly', 'daily', 'weekly', 'monthly']).default('daily'),
  fields: z.array(
    z.object({
      name: z.string(),
      label: z.string(),
      type: z.enum(['number', 'text', 'select', 'checkbox', 'time']),
      required: z.boolean(),
      assetId: z.string().optional(),
      options: z.array(z.string()).optional(),
      minValue: z.number().optional(),
      maxValue: z.number().optional(),
      unit: z.string().optional(),
    })
  ),
})

export type LogTemplateFormData = z.infer<typeof logTemplateSchema>

export async function getLogTemplates() {
  const { organization } = await requireOrganization()

  return prisma.logTemplate.findMany({
    where: { organizationId: organization.id },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { entries: true },
      },
    },
  })
}

export async function getLogTemplate(id: string) {
  const { organization } = await requireOrganization()

  return prisma.logTemplate.findFirst({
    where: { id, organizationId: organization.id },
  })
}

export async function createLogTemplate(data: LogTemplateFormData) {
  const { organization } = await requireOrganization()

  const validated = logTemplateSchema.safeParse(data)
  if (!validated.success) {
    return { success: false, error: validated.error.message }
  }

  try {
    await prisma.logTemplate.create({
      data: {
        organizationId: organization.id,
        name: validated.data.name,
        description: validated.data.description,
        type: validated.data.type,
        frequency: validated.data.frequency,
        fields: validated.data.fields,
      },
    })

    revalidatePath('/logs')
    return { success: true }
  } catch (error) {
    console.error('Failed to create log template:', error)
    return { success: false, error: 'Failed to create log template' }
  }
}

export async function getLogEntries(filters?: {
  templateId?: string
  siteId?: string
  startDate?: Date
  endDate?: Date
}) {
  const { organization } = await requireOrganization()

  return prisma.logEntry.findMany({
    where: {
      organizationId: organization.id,
      ...(filters?.templateId && { templateId: filters.templateId }),
      ...(filters?.siteId && { siteId: filters.siteId }),
      ...(filters?.startDate &&
        filters?.endDate && {
          date: {
            gte: filters.startDate,
            lte: filters.endDate,
          },
        }),
    },
    orderBy: { date: 'desc' },
    take: 100,
    include: {
      template: { select: { name: true, type: true } },
      site: { select: { id: true, name: true } },
      user: { select: { id: true, name: true } },
      readings: {
        include: {
          asset: { select: { id: true, name: true } },
        },
      },
    },
  })
}

export async function getLogEntry(id: string) {
  const { organization } = await requireOrganization()

  return prisma.logEntry.findFirst({
    where: { id, organizationId: organization.id },
    include: {
      template: true,
      site: { select: { id: true, name: true } },
      user: { select: { id: true, name: true } },
      readings: {
        include: {
          asset: { select: { id: true, name: true } },
        },
      },
    },
  })
}

export async function createLogEntry(data: {
  templateId: string
  siteId?: string
  shift?: string
  notes?: string
  readings: {
    fieldName: string
    value: string
    numericValue?: number
    assetId?: string
    isException?: boolean
    exceptionNote?: string
  }[]
}) {
  const { organization, user } = await requireOrganization()

  try {
    await prisma.logEntry.create({
      data: {
        organizationId: organization.id,
        templateId: data.templateId,
        siteId: data.siteId,
        userId: user.id,
        shift: data.shift,
        notes: data.notes,
        readings: {
          create: data.readings.map((reading) => ({
            fieldName: reading.fieldName,
            value: reading.value,
            numericValue: reading.numericValue,
            assetId: reading.assetId,
            isException: reading.isException || false,
            exceptionNote: reading.exceptionNote,
          })),
        },
      },
    })

    revalidatePath('/logs')
    return { success: true }
  } catch (error) {
    console.error('Failed to create log entry:', error)
    return { success: false, error: 'Failed to create log entry' }
  }
}

export async function deleteLogEntry(id: string) {
  const { organization } = await requireOrganization()

  try {
    await prisma.logEntry.delete({
      where: { id, organizationId: organization.id },
    })

    revalidatePath('/logs')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete log entry:', error)
    return { success: false, error: 'Failed to delete log entry' }
  }
}
