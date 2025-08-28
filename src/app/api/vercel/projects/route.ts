import { NextResponse } from 'next/server'
import { getProjects } from '@/lib/vercel'

export async function GET() {
  try {
    const projects = await getProjects()
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching Vercel projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Vercel projects' },
      { status: 500 }
    )
  }
} 