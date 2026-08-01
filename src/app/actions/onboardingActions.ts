'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'

export async function getOnboardings() {
  return prisma.onboarding.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      demo: {
        include: {
          lead: true
        }
      }
    }
  })
}

// Update onboarding details (form)
export async function updateOnboardingAction(id: string, formData: FormData) {
  try {
    const status = formData.get('status') as string
    const assignedTo = formData.get('assignedTo') as string
    const notes = formData.get('notes') as string
    const paymentAmountStr = formData.get('paymentAmount') as string
    
    const data: any = {
      status,
      assignedTo,
      notes,
    }

    if (paymentAmountStr) {
      data.paymentAmount = parseFloat(paymentAmountStr)
    }

    if (status === 'COMPLETED') {
      data.completedAt = new Date()
    } else {
      data.completedAt = null
    }

    await prisma.onboarding.update({
      where: { id },
      data
    })

    revalidatePath('/onboarding')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to update onboarding:', error)
    return { success: false, error: 'Failed to update onboarding' }
  }
}

// Toggle a checklist boolean
export async function toggleOnboardingChecklistAction(id: string, field: string, currentValue: boolean) {
  try {
    await prisma.onboarding.update({
      where: { id },
      data: {
        [field]: !currentValue
      }
    })
    revalidatePath('/onboarding')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to toggle checklist:', error)
    return { success: false }
  }
}

// Create onboarding from follow up
export async function createOnboardingAction(demoId: string) {
  try {
    await prisma.onboarding.create({
      data: {
        demoId,
        status: 'PENDING'
      }
    })
    revalidatePath('/onboarding')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to create onboarding:', error)
    return { success: false, error: 'Failed to create onboarding' }
  }
}
