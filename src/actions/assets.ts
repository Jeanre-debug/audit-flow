'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireOrganization } from './auth'
import { z } from 'zod'

const assetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  siteId: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  minTemp: z.coerce.number().optional(),
  maxTemp: z.coerce.number().optional(),
  notes: z.string().optional(),
})

export type AssetFormState = {
  errors?: {
    name?: string[]
    type?: string[]
    siteId?: string[]
    manufacturer?: string[]
    model?: string[]
    serialNumber?: string[]
    minTemp?: string[]
    maxTemp?: string[]
    notes?: string[]
  }
  message?: string
  success?: boolean
}

export async function getAssets(siteId?: string) {
  const { organization } = await requireOrganization()

  return prisma.asset.findMany({
    where: {
      organizationId: organization.id,
      ...(siteId ? { siteId } : {}),
    },
    orderBy: { name: 'asc' },
    include: {
      site: { select: { id: true, name: true } },
      _count: {
        select: {
          maintenanceRecords: true,
          logReadings: true,
        },
      },
    },
  })
}

export async function getAsset(id: string) {
  const { organization } = await requireOrganization()

  return prisma.asset.findFirst({
    where: { id, organizationId: organization.id },
    include: {
      site: { select: { id: true, name: true } },
      maintenanceRecords: {
        orderBy: { performedAt: 'desc' },
        take: 10,
      },
    },
  })
}

const initialState: AssetFormState = {}

export async function createAsset(
  prevState: AssetFormState,
  formData: FormData
): Promise<AssetFormState> {
  const { organization } = await requireOrganization()

  const validatedFields = assetSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    siteId: formData.get('siteId') || undefined,
    manufacturer: formData.get('manufacturer') || undefined,
    model: formData.get('model') || undefined,
    serialNumber: formData.get('serialNumber') || undefined,
    minTemp: formData.get('minTemp') || undefined,
    maxTemp: formData.get('maxTemp') || undefined,
    notes: formData.get('notes') || undefined,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please fix the errors above.',
    }
  }

  try {
    await prisma.asset.create({
      data: {
        ...validatedFields.data,
        organizationId: organization.id,
      },
    })

    revalidatePath('/assets')
    if (validatedFields.data.siteId) {
      revalidatePath(`/sites/${validatedFields.data.siteId}`)
    }
    return { success: true, message: 'Asset created successfully' }
  } catch (error) {
    console.error('Failed to create asset:', error)
    return { message: 'Failed to create asset. Please try again.' }
  }
}

export async function updateAsset(
  id: string,
  prevState: AssetFormState,
  formData: FormData
): Promise<AssetFormState> {
  const { organization } = await requireOrganization()

  const validatedFields = assetSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    siteId: formData.get('siteId') || undefined,
    manufacturer: formData.get('manufacturer') || undefined,
    model: formData.get('model') || undefined,
    serialNumber: formData.get('serialNumber') || undefined,
    minTemp: formData.get('minTemp') || undefined,
    maxTemp: formData.get('maxTemp') || undefined,
    notes: formData.get('notes') || undefined,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please fix the errors above.',
    }
  }

  try {
    await prisma.asset.update({
      where: { id, organizationId: organization.id },
      data: validatedFields.data,
    })

    revalidatePath('/assets')
    revalidatePath(`/assets/${id}`)
    return { success: true, message: 'Asset updated successfully' }
  } catch (error) {
    console.error('Failed to update asset:', error)
    return { message: 'Failed to update asset. Please try again.' }
  }
}

export async function deleteAsset(id: string) {
  const { organization } = await requireOrganization()

  try {
    await prisma.asset.delete({
      where: { id, organizationId: organization.id },
    })

    revalidatePath('/assets')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete asset:', error)
    return { success: false, error: 'Failed to delete asset' }
  }
}

export async function addMaintenanceRecord(
  assetId: string,
  data: {
    type: string
    description?: string
    performedBy?: string
    performedAt: Date
    nextDueAt?: Date
    notes?: string
  }
) {
  const { organization } = await requireOrganization()

  // Verify asset belongs to organization
  const asset = await prisma.asset.findFirst({
    where: { id: assetId, organizationId: organization.id },
  })

  if (!asset) {
    return { success: false, error: 'Asset not found' }
  }

  try {
    await prisma.assetMaintenance.create({
      data: {
        assetId,
        ...data,
      },
    })

    // Update asset's last calibration if this is a calibration record
    if (data.type === 'calibration') {
      await prisma.asset.update({
        where: { id: assetId },
        data: {
          lastCalibration: data.performedAt,
          nextCalibration: data.nextDueAt,
        },
      })
    }

    revalidatePath(`/assets/${assetId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to add maintenance record:', error)
    return { success: false, error: 'Failed to add maintenance record' }
  }
}
