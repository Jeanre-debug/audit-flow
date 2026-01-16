import { NextResponse } from 'next/server'
import { getSites } from '@/actions/sites'

export async function GET() {
  try {
    const sites = await getSites()
    return NextResponse.json({ data: sites })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 })
  }
}
