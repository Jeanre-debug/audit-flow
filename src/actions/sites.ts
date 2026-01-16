'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireOrganization } from './auth'
import { z } from 'zod'

const siteSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
})

export type SiteFormState = {
  errors?: {
    name?: string[]
    address?: string[]
    city?: string[]
    state?: string[]
    postalCode?: string[]
    country?: string[]
    phone?: string[]
    email?: string[]
  }
  message?: string
  success?: boolean
}

export async function getSites() {
  const { organization } = await requireOrganization()

  return prisma.site.findMany({
    where: { organizationId: organization.id },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          assets: true,
          audits: true,
          issues: { where: { status: { in: ['open', 'in_progress'] } } },
        },
      },
    },
  })
}

export async function getSite(id: string) {
  const { organization } = await requireOrganization()

  return prisma.site.findFirst({
    where: { id, organizationId: organization.id },
    include: {
      assets: {
        orderBy: { name: 'asc' },
      },
      _count: {
        select: {
          audits: true,
          issues: true,
        },
      },
    },
  })
}

export async function createSite(
  prevState: SiteFormState,
  formData: FormData
): Promise<SiteFormState> {
  const { organization } = await requireOrganization()

  const validatedFields = siteSchema.safeParse({
    name: formData.get('name'),
    address: formData.get('address') || undefined,
    city: formData.get('city') || undefined,
    state: formData.get('state') || undefined,
    postalCode: formData.get('postalCode') || undefined,
    country: formData.get('country') || undefined,
    phone: formData.get('phone') || undefined,
    email: formData.get('email') || undefined,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please fix the errors above.',
    }
  }

  try {
    await prisma.site.create({
      data: {
        ...validatedFields.data,
        organizationId: organization.id,
      },
    })

    revalidatePath('/sites')
    return { success: true, message: 'Site created successfully' }
  } catch (error) {
    console.error('Failed to create site:', error)
    return { message: 'Failed to create site. Please try again.' }
  }
}

export async function updateSite(
  id: string,
  prevState: SiteFormState,
  formData: FormData
): Promise<SiteFormState> {
  const { organization } = await requireOrganization()

  const validatedFields = siteSchema.safeParse({
    name: formData.get('name'),
    address: formData.get('address') || undefined,
    city: formData.get('city') || undefined,
    state: formData.get('state') || undefined,
    postalCode: formData.get('postalCode') || undefined,
    country: formData.get('country') || undefined,
    phone: formData.get('phone') || undefined,
    email: formData.get('email') || undefined,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please fix the errors above.',
    }
  }

  try {
    await prisma.site.update({
      where: { id, organizationId: organization.id },
      data: validatedFields.data,
    })

    revalidatePath('/sites')
    revalidatePath(`/sites/${id}`)
    return { success: true, message: 'Site updated successfully' }
  } catch (error) {
    console.error('Failed to update site:', error)
    return { message: 'Failed to update site. Please try again.' }
  }
}

export async function deleteSite(id: string) {
  const { organization } = await requireOrganization()

  try {
    await prisma.site.delete({
      where: { id, organizationId: organization.id },
    })

    revalidatePath('/sites')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete site:', error)
    return { success: false, error: 'Failed to delete site' }
  }
}

export async function toggleSiteActive(id: string, isActive: boolean) {
  const { organization } = await requireOrganization()

  try {
    await prisma.site.update({
      where: { id, organizationId: organization.id },
      data: { isActive },
    })

    revalidatePath('/sites')
    return { success: true }
  } catch (error) {
    console.error('Failed to toggle site status:', error)
    return { success: false, error: 'Failed to update site status' }
  }
}
