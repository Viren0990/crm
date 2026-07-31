import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  
  try {
    const where: any = {}
    if (status) where.status = status

    const demos = await prisma.demo.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      include: {
        lead: true,
      }
    })

    return NextResponse.json(demos)
  } catch (error) {
    console.error('Error fetching demos:', error)
    return NextResponse.json({ error: 'Failed to fetch demos' }, { status: 500 })
  }
}
