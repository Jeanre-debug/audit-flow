import { NextResponse } from 'next/server'
import { getLogTemplates } from '@/actions/logs'

export async function GET() {
  try {
    const templates = await getLogTemplates()
    return NextResponse.json({ data: templates })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch log templates' }, { status: 500 })
  }
}
