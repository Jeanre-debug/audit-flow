import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOrganization } from '@/actions/auth'

export async function GET() {
  try {
    const { user } = await requireOrganization()
    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PUT(request: Request) {
  try {
    const { user } = await requireOrganization()
    const body = await request.json()

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: body.name,
        phone: body.phone,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
