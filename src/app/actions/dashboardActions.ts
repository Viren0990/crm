'use server'

import { prisma } from '@/lib/prisma'

export async function getDashboardStats() {
  const [
    totalLeads,
    activeDemos,
    pendingOnboardings,
    completedClients,
    contactedLeads,
    totalDemos,
    totalOnboardings,
    todaysDemos,
    newLeads,
    pendingFollowUps
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.demo.count({ where: { status: { in: ['PENDING', 'RESCHEDULED'] } } }),
    prisma.onboarding.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
    prisma.onboarding.count({ where: { status: 'COMPLETED' } }),
    prisma.lead.count({ where: { status: { not: 'NEW' } } }),
    prisma.demo.count(),
    prisma.onboarding.count(),
    prisma.demo.findMany({
      where: { 
        status: { in: ['PENDING', 'RESCHEDULED'] },
        scheduledAt: {
          gte: new Date(new Date().setHours(0,0,0,0)),
          lt: new Date(new Date().setHours(23,59,59,999))
        }
      },
      include: { lead: true },
      orderBy: { scheduledAt: 'asc' }
    }),
    prisma.lead.findMany({
      where: { status: 'NEW' },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    prisma.demo.findMany({
      where: {
        status: 'COMPLETED',
        followUpDate: {
          lte: new Date(new Date().setHours(23,59,59,999))
        }
      },
      include: { lead: true },
      orderBy: { followUpDate: 'asc' },
      take: 5
    })
  ])

  return {
    stats: {
      totalLeads,
      activeDemos,
      pendingOnboardings,
      completedClients,
    },
    funnel: {
      leads: totalLeads,
      contacted: contactedLeads,
      demos: totalDemos,
      onboarding: totalOnboardings
    },
    focus: {
      demos: todaysDemos,
      followUps: pendingFollowUps,
      newLeads
    }
  }
}
