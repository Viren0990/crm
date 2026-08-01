'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath, revalidateTag } from 'next/cache'
import { unstable_cache } from 'next/cache'

// Get all demos
export async function getDemos() {
  return prisma.demo.findMany({
    where: {
      status: {
        not: 'COMPLETED'
      }
    },
    orderBy: { scheduledAt: 'asc' },
    include: {
      lead: true,
    }
  })
}

// Get all completed demos (Follow Ups)
export async function getFollowUps() {
  return prisma.demo.findMany({
    where: {
      status: 'COMPLETED'
    },
    orderBy: { followUpDate: 'asc' },
    include: {
      lead: true,
    }
  })
}

// Update an existing demo
export async function updateDemoAction(demoId: string, formData: FormData) {
  try {
    const status = formData.get('status') as string
    const notes = formData.get('notes') as string
    const result = formData.get('result') as string
    const durationStr = formData.get('duration') as string
    const conductedBy = formData.get('conductedBy') as string
    
    const data: any = {
      status,
      notes,
      result,
    }

    if (conductedBy) {
      data.conductedBy = conductedBy
    }

    if (durationStr) {
      data.duration = parseInt(durationStr, 10)
    }

    const demo = await prisma.demo.update({
      where: { id: demoId },
      data
    })

    // Log activity
    await prisma.activity.create({
      data: {
        leadId: demo.leadId,
        type: status === 'COMPLETED' ? 'DEMO_RESULT' : 'STATUS_CHANGE',
        title: `Demo marked as ${status}`,
        description: result || notes || undefined,
        performedBy: conductedBy || 'System'
      }
    })

    revalidatePath('/demos')
    revalidatePath('/followups')
    revalidatePath('/leads')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to update demo:', error)
    return { success: false, error: 'Failed to update demo' }
  }
}

// Update follow up details for a completed demo
export async function updateFollowUpAction(demoId: string, formData: FormData) {
  try {
    const followUpResult = formData.get('followUpResult') as string
    const followUpDateStr = formData.get('followUpDate') as string
    const followUpNotes = formData.get('followUpNotes') as string
    
    const data: any = {
      followUpResult,
      followUpNotes,
    }

    if (followUpDateStr) {
      data.followUpDate = new Date(followUpDateStr)
    } else {
      data.followUpDate = null
    }

    const demo = await prisma.demo.update({
      where: { id: demoId },
      data
    })

    // Log activity
    await prisma.activity.create({
      data: {
        leadId: demo.leadId,
        type: 'FOLLOW_UP',
        title: `Follow-up logged`,
        description: followUpResult || followUpNotes || undefined,
        performedBy: 'System'
      }
    })

    revalidatePath('/followups')
    revalidatePath('/leads')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to update follow up:', error)
    return { success: false, error: 'Failed to update follow up details' }
  }
}
