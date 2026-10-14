'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { formatForDateTimeLocal, fromIndiaDateTime, timeInputToText, toIndiaDateInput } from '@/lib/utils'

export async function getFollowUps() {
  return prisma.followUp.findMany({
    orderBy: { scheduledDate: 'asc' },
    include: { 
      lead: {
        include: {
          followUps: {
            orderBy: { attemptNumber: 'asc' }
          }
        }
      }
    }
  })
}

export async function getLeadsWithFollowUps() {
  return prisma.lead.findMany({
    where: {
      followUps: {
        some: {} // Only get leads that have at least one follow up
      }
    },
    include: {
      followUps: {
        orderBy: { attemptNumber: 'desc' } // Descending so the latest is first [0]
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })
}

export async function createFollowUpAction(leadId: string, formData: FormData) {
  try {
    // Entered in India time ('YYYY-MM-DD' and optional 'HH:mm')
    const scheduledDate = formData.get('scheduledDate') as string
    const scheduledTimeInput = formData.get('scheduledTime') as string
    const notes = formData.get('notes') as string
    const conductedBy = formData.get('conductedBy') as string

    if (!scheduledDate) {
      return { success: false, error: 'Date is required' }
    }

    const scheduledTime = timeInputToText(scheduledTimeInput) || null

    // Determine attempt number
    const existingFollowUps = await prisma.followUp.count({ where: { leadId } })
    const attemptNumber = existingFollowUps + 1

    await prisma.followUp.create({
      data: {
        leadId,
        attemptNumber,
        scheduledDate: fromIndiaDateTime(scheduledDate, scheduledTimeInput),
        scheduledTime,
        notes,
        conductedBy
      }
    })

    revalidatePath('/')
    revalidatePath('/leads')
    revalidatePath('/positive-leads')
    revalidatePath('/followups')
    return { success: true }
  } catch (error) {
    console.error('Error creating follow up:', error)
    return { success: false, error: 'Failed to create follow up' }
  }
}

export async function updateFollowUpAction(id: string, formData: FormData) {
  try {
    const status = formData.get('status') as string
    const notes = formData.get('notes') as string
    const result = formData.get('result') as string
    
    // Also allow updating date/time (entered in India time)
    const scheduledDate = formData.get('scheduledDate') as string
    const scheduledTimeInput = formData.get('scheduledTime') as string
    
    const data: any = { status, notes, result }
    
    if (scheduledDate) {
      data.scheduledDate = fromIndiaDateTime(scheduledDate, scheduledTimeInput)
    }
    if (formData.has('scheduledTime')) { // Empty means the time was cleared
      data.scheduledTime = timeInputToText(scheduledTimeInput) || null
    }

    await prisma.followUp.update({
      where: { id },
      data
    })

    revalidatePath('/')
    revalidatePath('/leads')
    revalidatePath('/positive-leads')
    revalidatePath('/followups')
    return { success: true }
  } catch (error) {
    console.error('Error updating follow up:', error)
    return { success: false, error: 'Failed to update follow up' }
  }
}

export async function deleteFollowUpAction(id: string) {
  try {
    await prisma.followUp.delete({
      where: { id }
    })
    revalidatePath('/')
    revalidatePath('/leads')
    revalidatePath('/positive-leads')
    revalidatePath('/followups')
    return { success: true }
  } catch (error) {
    console.error('Error deleting follow up:', error)
    return { success: false, error: 'Failed to delete follow up' }
  }
}

export async function markDetailsSentAction(leadId: string) {
  try {
    // 1. Update lead status
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'DETAILS_SENT' }
    })
    
    // 2. Check if a follow up already exists
    const existingFollowUps = await prisma.followUp.count({ where: { leadId } })
    
    // 3. Create FollowUp 1 if none exist
    if (existingFollowUps === 0) {
 // Tomorrow at 12:00 PM India time
      const tomorrow = fromIndiaDateTime(toIndiaDateInput(new Date(Date.now() + 24 * 60 * 60 * 1000)), '12:00')
      
      await prisma.followUp.create({
        data: {
          leadId,
          attemptNumber: 1,
          scheduledDate: tomorrow, // Default to tomorrow
          scheduledTime: '12:00 PM', // Default time
          notes: 'System: Details sent via WhatsApp.',
        }
      })
    }
    
    revalidatePath('/')
    revalidatePath('/leads')
    revalidatePath('/positive-leads')
    revalidatePath('/followups')
    return { success: true }
  } catch (error) {
    console.error('Error marking details sent:', error)
    return { success: false, error: 'Failed to update lead and create follow up' }
  }
}

export async function updateLeadFollowUpStatusAction(leadId: string, status: string) {
  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: { followUpStatus: status }
    })
    
    if (status === 'LOST') {
      await prisma.lead.update({
        where: { id: leadId },
        data: { status: 'LOST', isPositive: false }
      })
    }

    revalidatePath('/')
    revalidatePath('/leads', 'layout')
    revalidatePath('/positive-leads')
    revalidatePath('/followups')
    return { success: true }
  } catch (error) {
    console.error('Error updating follow up status:', error)
    return { success: false, error: 'Failed to update status' }
  }
}
