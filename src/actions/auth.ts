'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const dbUser = await prisma.user.findUnique({
    where: { authId: user.id },
    include: {
      memberships: {
        where: { isActive: true },
        include: {
          organization: true,
        },
      },
    },
  })

  return dbUser
}

export async function getCurrentSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const dbUser = await prisma.user.findUnique({
    where: { authId: user.id },
    include: {
      memberships: {
        where: { isActive: true },
        include: {
          organization: true,
        },
        take: 1,
      },
    },
  })

  if (!dbUser) {
    return null
  }

  const membership = dbUser.memberships[0]

  return {
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      avatarUrl: dbUser.avatarUrl,
    },
    organization: membership ? {
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
      role: membership.role as 'owner' | 'admin' | 'manager' | 'member' | 'viewer',
    } : null,
  }
}

export async function ensureUserAndOrganization() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user exists in our database
  let dbUser = await prisma.user.findUnique({
    where: { authId: user.id },
    include: {
      memberships: {
        where: { isActive: true },
        include: {
          organization: true,
        },
      },
    },
  })

  // If user doesn't exist, create them along with their organization
  if (!dbUser) {
    const metadata = user.user_metadata
    const organizationName = metadata?.organization_name || `${metadata?.name || 'User'}'s Organization`
    const slug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36)

    // Create user and organization in a transaction
    dbUser = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          authId: user.id,
          email: user.email!,
          name: metadata?.name || null,
        },
      })

      const newOrg = await tx.organization.create({
        data: {
          name: organizationName,
          slug,
        },
      })

      await tx.organizationMember.create({
        data: {
          organizationId: newOrg.id,
          userId: newUser.id,
          role: 'owner',
        },
      })

      return tx.user.findUnique({
        where: { id: newUser.id },
        include: {
          memberships: {
            where: { isActive: true },
            include: {
              organization: true,
            },
          },
        },
      })
    })
  }

  return dbUser!
}

export async function requireAuth() {
  const session = await getCurrentSession()

  if (!session) {
    redirect('/login')
  }

  return session
}

export async function requireOrganization() {
  const user = await ensureUserAndOrganization()

  if (!user.memberships.length) {
    redirect('/onboarding')
  }

  return {
    user,
    organization: user.memberships[0].organization,
    role: user.memberships[0].role,
  }
}
