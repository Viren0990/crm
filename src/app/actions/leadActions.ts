'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath, revalidateTag } from 'next/cache'

// Get all leads
export async function getLeads() {
  return prisma.lead.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      demo: true,
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  })
}

// Create a new lead
export async function createLeadAction(formData: FormData) {
  try {
    const data = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      company: formData.get('company') as string,
      city: formData.get('city') as string,
      notes: formData.get('notes') as string,
      type: (formData.get('type') as string) || 'N/A',
      source: formData.get('source') as string,
      staff: formData.get('staff') as string,
      priority: formData.get('priority') as string,
      status: (formData.get('status') as string) || 'NEW',
    }

    const demoTime = formData.get('demoTime') as string

    const lead = await prisma.lead.create({
      data: {
        ...data,
        activities: {
          create: {
            type: 'CREATED',
            title: 'Lead created',
            performedBy: data.staff || 'System',
          }
        }
      }
    })

    // If created as DEMO_SCHEDULED directly
    if (data.status === 'DEMO_SCHEDULED' && demoTime) {
      await prisma.demo.create({
        data: {
          leadId: lead.id,
          type: data.type || 'Both',
          scheduledAt: new Date(demoTime),
          conductedBy: data.staff || 'TBD',
        }
      })
      revalidatePath('/demos')
    }

    revalidatePath('/leads')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to create lead:', error)
    return { success: false, error: 'Failed to create lead.' }
  }
}

// Update an existing lead
export async function updateLeadAction(leadId: string, formData: FormData) {
  try {
    const data: any = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      company: formData.get('company') as string,
      city: formData.get('city') as string,
      notes: formData.get('notes') as string,
      type: (formData.get('type') as string) || 'N/A',
      source: formData.get('source') as string,
      staff: formData.get('staff') as string,
      priority: formData.get('priority') as string,
      status: formData.get('status') as string,
    }

    const demoTime = formData.get('demoTime') as string

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data
    })

    // Auto-create Demo if status is DEMO_SCHEDULED and it doesn't exist yet
    if (data.status === 'DEMO_SCHEDULED') {
      const existingDemo = await prisma.demo.findUnique({ where: { leadId } })
      if (!existingDemo) {
        await prisma.demo.create({
          data: {
            leadId,
            type: data.type || 'Both',
            scheduledAt: demoTime ? new Date(demoTime) : new Date(Date.now() + 24 * 60 * 60 * 1000),
            conductedBy: data.staff || 'TBD',
          }
        })
        revalidatePath('/leads')
        revalidatePath('/demos')
        revalidatePath('/')
      } else if (demoTime) {
        // Update the existing demo's scheduled time if it was changed
        await prisma.demo.update({
          where: { id: existingDemo.id },
          data: {
            scheduledAt: new Date(demoTime)
          }
        })
        revalidatePath('/demos')
        revalidatePath('/')
      }
    } else {
      // If status is changed away from DEMO_SCHEDULED, delete the demo if it's still pending
      const existingDemo = await prisma.demo.findUnique({ where: { leadId } })
      if (existingDemo && (existingDemo.status === 'PENDING' || existingDemo.status === 'RESCHEDULED')) {
        await prisma.demo.delete({ where: { leadId } })
        revalidatePath('/demos')
        revalidatePath('/')
      }
    }

    // Log the edit activity
    await prisma.activity.create({
      data: {
        leadId,
        type: 'NOTE',
        title: 'Lead details updated',
        performedBy: data.staff || 'System',
      }
    })

    revalidatePath('/leads')
    revalidatePath('/demos')
    revalidatePath('/followups')
    revalidatePath('/onboarding')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to update lead:', error)
    return { success: false, error: 'Failed to update lead.' }
  }
}

// Toggle boolean fields directly from the table
export async function toggleLeadFieldAction(leadId: string, field: 'whatsappSent' | 'called', currentValue: boolean) {
  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        [field]: !currentValue
      }
    })

    // Log the activity
    await prisma.activity.create({
      data: {
        leadId,
        type: field === 'whatsappSent' ? 'WHATSAPP' : 'CALL',
        title: field === 'whatsappSent' ? 'WhatsApp marked as sent' : 'Marked as called',
        performedBy: 'System', // Replace with auth user later
      }
    })

    revalidatePath('/leads')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error(`Failed to toggle ${field}:`, error)
    return { success: false, error: `Failed to update ${field}` }
  }
}

// Update lead status
export async function updateLeadStatusAction(leadId: string, newStatus: string) {
  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: newStatus }
    })

    await prisma.activity.create({
      data: {
        leadId,
        type: 'STATUS_CHANGE',
        title: `Status changed to ${newStatus}`,
        performedBy: 'System',
      }
    })

    if (newStatus !== 'DEMO_SCHEDULED') {
      const existingDemo = await prisma.demo.findUnique({ where: { leadId } })
      if (existingDemo && (existingDemo.status === 'PENDING' || existingDemo.status === 'RESCHEDULED')) {
        await prisma.demo.delete({ where: { leadId } })
        revalidatePath('/demos')
      }
    } else {
      const existingDemo = await prisma.demo.findUnique({ where: { leadId } })
      if (!existingDemo) {
        await prisma.demo.create({
          data: {
            leadId,
            type: 'Both',
            scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to tomorrow
            conductedBy: 'TBD',
          }
        })
        revalidatePath('/demos')
      }
    }

    revalidatePath('/leads')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to update status:', error)
    return { success: false, error: 'Failed to update status' }
  }
}

// Add a custom note activity
export async function addActivityNoteAction(leadId: string, note: string) {
  try {
    await prisma.activity.create({
      data: {
        leadId,
        type: 'NOTE',
        title: 'Custom Note',
        description: note,
        performedBy: 'User', // Replace with Auth user
      }
    })
    
    revalidatePath('/leads')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to add note:', error)
    return { success: false, error: 'Failed to add note' }
  }
}

// Bulk import leads
export async function importLeadsAction(leadsData: any[]) {
  try {
    // Map CSV data to Prisma schema
    const dataToInsert = leadsData.map(row => ({
      name: row.name || 'Unknown Lead',
      email: row.email || null,
      phone: row.phone || null,
      company: row.company || null,
      city: row.city || null,
      address: row.address || null,
      type: row.type || 'N/A',
      source: row.source || 'CSV Import',
      staff: row.staff || null,
      priority: row.priority || 'WARM',
      notes: row.notes || null,
      status: 'NEW',
    }))

    // Process in batches if list is huge, but assuming < 500 for now.
    // Transaction ensures all or nothing, and lets us log activity for each
    await prisma.$transaction(
      dataToInsert.map(data => prisma.lead.create({
        data: {
          ...data,
          activities: {
            create: {
              type: 'CREATED',
              title: 'Lead imported via CSV',
              performedBy: 'System'
            }
          }
        }
      }))
    )

    revalidatePath('/leads')
    revalidatePath('/') // Dashboard
    return { success: true, count: dataToInsert.length }
  } catch (error) {
    console.error('Failed to import leads:', error)
    return { success: false, error: 'Failed to import leads' }
  }
}
