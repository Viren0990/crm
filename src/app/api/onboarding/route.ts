import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  
  try {
    const where: any = {}
    if (status) where.status = status

    const onboardings = await prisma.onboarding.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        demo: {
          include: {
            lead: true
          }
        }
      }
    })

    return NextResponse.json(onboardings)
  } catch (error) {
    console.error('Error fetching onboardings:', error)
    return NextResponse.json({ error: 'Failed to fetch onboardings' }, { status: 500 })
  }
}
