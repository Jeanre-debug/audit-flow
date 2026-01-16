import { NextResponse } from 'next/server'
import { getTemplates } from '@/actions/templates'

export async function GET() {
  try {
    const templates = await getTemplates()
    return NextResponse.json({ data: templates })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}
