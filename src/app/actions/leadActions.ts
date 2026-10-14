'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath, revalidateTag } from 'next/cache'
import { LEAD_STAFF, VISIBLE_FROM } from '@/lib/constants'
import { fromIndiaDateTime, timeInputToText, timeTextToInput, toIndiaDateInput, formatDate, parseIndiaDate } from '@/lib/utils'

// Get all basic leads
export async function getLeads() {
  return prisma.lead.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      demo: true,
      followUps: {
        orderBy: { attemptNumber: 'asc' }
      }
    }
  })
}

// Get all positive leads with their follow ups
export async function getPositiveLeads() {
  return prisma.lead.findMany({
    where: { isPositive: true },
    orderBy: { updatedAt: 'desc' },
    include: {
      demo: true,
      followUps: {
        orderBy: { attemptNumber: 'desc' }
      }
    }
  })
}

// Get activities for a specific lead
export async function getLeadActivitiesAction(leadId: string) {
  return prisma.activity.findMany({
    where: { leadId },
    orderBy: { createdAt: 'desc' }
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

    // Demo date + time are entered in India time ('YYYY-MM-DD' and 'HH:mm')
    const demoDate = formData.get('demoDate') as string
    const demoTimeInput = formData.get('demoTime') as string
    const demoTime = timeInputToText(demoTimeInput)
    const scheduleDemo = formData.get('scheduleDemo') === 'on'

    if (scheduleDemo) {
      data.status = 'DEMO_SCHEDULED'
    }

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
    if (scheduleDemo && demoTime && demoDate) {
      await prisma.demo.create({
        data: {
          leadId: lead.id,
          type: data.type || 'Both',
          scheduledAt: fromIndiaDateTime(demoDate, demoTimeInput),
          scheduledTime: demoTime,
          conductedBy: data.staff || 'TBD',
        }
      })

      // Log activity for demo scheduling
      await prisma.activity.create({
        data: {
          leadId: lead.id,
          type: 'DEMO_SCHEDULED',
          title: 'Demo Scheduled',
          description: `Demo scheduled for ${formatDate(fromIndiaDateTime(demoDate))} at ${demoTime}`,
          performedBy: data.staff || 'System',
        }
      })

      revalidatePath('/demos')
    }

    revalidatePath('/leads')
    revalidatePath('/positive-leads')
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

    // Demo date + time are entered in India time ('YYYY-MM-DD' and 'HH:mm')
    const demoDate = formData.get('demoDate') as string
    const demoTimeInput = formData.get('demoTime') as string
    const demoTime = timeInputToText(demoTimeInput)
    const scheduleDemo = formData.get('scheduleDemo') === 'on'

    if (scheduleDemo) {
      data.status = 'DEMO_SCHEDULED'
    }

    const existingLead = await prisma.lead.findUnique({ where: { id: leadId } })
    
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data
    })

    // Log if notes were changed
    if (existingLead && data.notes !== existingLead.notes) {
      await prisma.activity.create({
        data: {
          leadId,
          type: 'NOTE',
          title: 'Notes Updated',
          description: `Notes were changed. Previous notes: "${existingLead.notes || 'None'}"`,
          performedBy: 'System', // Replace with auth user later
        }
      })
    }

    // Auto-create Demo if scheduleDemo is true and it doesn't exist yet
    if (scheduleDemo) {
      const existingDemo = await prisma.demo.findUnique({ where: { leadId } })
      if (!existingDemo) {
        await prisma.demo.create({
          data: {
            leadId,
            type: data.type || 'Both',
            scheduledAt: demoDate ? fromIndiaDateTime(demoDate, demoTimeInput) : new Date(Date.now() + 24 * 60 * 60 * 1000),
            scheduledTime: demoTime || '12:00 PM',
            conductedBy: data.staff || 'TBD',
          }
        })
        
        // Log activity for demo scheduling
        await prisma.activity.create({
          data: {
            leadId,
            type: 'DEMO_SCHEDULED',
            title: 'Demo Scheduled',
            description: `Demo scheduled for ${demoDate ? formatDate(fromIndiaDateTime(demoDate)) : 'TBD'} at ${demoTime || '12:00 PM'}`,
            performedBy: data.staff || 'System',
          }
        })

        revalidatePath('/leads')
    revalidatePath('/positive-leads')
        revalidatePath('/demos')
        revalidatePath('/')
      } else if (demoTime || demoDate) {
        // Update the existing demo only if the date or time actually changed
        const newDate = demoDate || toIndiaDateInput(existingDemo.scheduledAt)
        const newTime = demoTime || existingDemo.scheduledTime
        const dateChanged = newDate !== toIndiaDateInput(existingDemo.scheduledAt)
        const timeChanged = timeTextToInput(newTime) !== timeTextToInput(existingDemo.scheduledTime)

        if (dateChanged || timeChanged) {
          await prisma.demo.update({
            where: { id: existingDemo.id },
            data: {
              scheduledAt: fromIndiaDateTime(newDate, timeTextToInput(newTime)),
              scheduledTime: newTime,
            }
          })
          await prisma.activity.create({
            data: {
              leadId,
              type: 'DEMO_SCHEDULED',
              title: 'Demo Rescheduled',
              description: `Demo time updated to ${formatDate(fromIndiaDateTime(newDate))} at ${newTime}`,
              performedBy: data.staff || 'System',
            }
          })
        }

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
    revalidatePath('/positive-leads')
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

// Update only the status of an existing lead
export async function updateLeadStatusOnlyAction(leadId: string, status: string) {
  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: { status }
    })
    revalidatePath('/leads')
    revalidatePath('/positive-leads')
    revalidatePath('/demos')
    revalidatePath('/followups')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to update lead status:', error)
    return { success: false, error: 'Failed to update lead status.' }
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
    revalidatePath('/positive-leads')
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
    revalidatePath('/positive-leads')
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
    revalidatePath('/positive-leads')
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
    const dataToInsert = leadsData.map(row => {
      // Parse custom date if provided, in India time, day first (e.g. "05/10/2026" = 5 Oct,
      // "2026-10-05", "5 Oct 2026", or an Excel date cell)
      const createdAt = parseIndiaDate(row.date)

      return {
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
        status: 'CONTACTED',  // Hardcoded: Needs Call Back
        ...(createdAt ? { createdAt, updatedAt: createdAt } : {}),
      }
    })

    // Process in batches of 10 to avoid transaction timeout
    const BATCH_SIZE = 10
    for (let i = 0; i < dataToInsert.length; i += BATCH_SIZE) {
      const batch = dataToInsert.slice(i, i + BATCH_SIZE)
      await prisma.$transaction(
        batch.map(data => prisma.lead.create({
          data: {
            ...data,
            activities: {
              create: {
                type: 'CREATED',
                title: 'Lead imported via CSV',
                performedBy: 'System',
                ...(data.createdAt ? { createdAt: data.createdAt } : {}),
              }
            }
          }
        }))
      )
    }

    revalidatePath('/leads')
    revalidatePath('/positive-leads')
    revalidatePath('/') // Dashboard
    return { success: true, count: dataToInsert.length }
  } catch (error) {
    console.error('Failed to import leads:', error)
    return { success: false, error: 'Failed to import leads' }
  }
}

// Delete an existing lead
export async function deleteLeadAction(leadId: string) {
  try {
    await prisma.lead.delete({
      where: { id: leadId }
    })
    
    revalidatePath('/leads')
    revalidatePath('/positive-leads')
    revalidatePath('/demos')
    revalidatePath('/followups')
    revalidatePath('/onboarding')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete lead:', error)
    return { success: false, error: 'Failed to delete lead.' }
  }
}

// Mark a lead as positive
export async function markLeadPositiveAction(leadId: string) {
  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: { isPositive: true, followUpStatus: 'ONGOING' }
    })

    await prisma.activity.create({
      data: {
        leadId,
        type: 'STATUS_CHANGE',
        title: 'Lead marked as Positive',
        performedBy: 'System',
      }
    })

    revalidatePath('/leads')
    revalidatePath('/positive-leads')
    revalidatePath('/positive-leads')
    revalidatePath('/followups')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to mark lead as positive:', error)
    return { success: false, error: 'Failed to mark lead as positive.' }
  }
}

// ── New / Assigned leads ──────────────────────────
// A lead is "new" while staff is empty; claiming it sets staff to the caller's name.

// A lead counts as lost if either its status or its follow-up journey is LOST
const LOST_FILTER = { OR: [{ status: 'LOST' }, { followUpStatus: 'LOST' }] }

const leadListInclude = {
  demo: true,
  followUps: {
    orderBy: { attemptNumber: 'asc' as const }
  }
}

// Leads nobody has claimed yet
export async function getNewLeads() {
  return prisma.lead.findMany({
    where: {
      createdAt: { gte: VISIBLE_FROM },
      OR: [{ staff: null }, { staff: '' }],
      NOT: LOST_FILTER,
    },
    orderBy: { updatedAt: 'desc' },
    include: leadListInclude,
  })
}

// Leads claimed by one caller, or (with no name) leads assigned to names outside LEAD_STAFF
export async function getAssignedLeads(staffName?: string) {
  return prisma.lead.findMany({
    where: {
      createdAt: { gte: VISIBLE_FROM },
      ...(staffName
        ? { staff: staffName }
        : { AND: [{ staff: { not: null } }, { staff: { not: '' } }, { staff: { notIn: [...LEAD_STAFF] } }] }),
      NOT: LOST_FILTER,
    },
    orderBy: { updatedAt: 'desc' },
    include: leadListInclude,
  })
}

// Leads marked as lost (assigned or not)
export async function getLostLeads() {
  return prisma.lead.findMany({
    where: {
      createdAt: { gte: VISIBLE_FROM },
      ...LOST_FILTER,
    },
    orderBy: { updatedAt: 'desc' },
    include: leadListInclude,
  })
}

// Bring a lost lead back: it returns to Assigned (or New if nobody had claimed it)
export async function restoreLostLeadAction(leadId: string) {
  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'CONTACTED', followUpStatus: 'ONGOING' }
    })

    await prisma.activity.create({
      data: {
        leadId,
        type: 'STATUS_CHANGE',
        title: 'Restored from Lost Leads',
        performedBy: 'System',
      }
    })

    revalidatePath('/leads', 'layout')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to restore lead:', error)
    return { success: false, error: 'Failed to restore lead.' }
  }
}

// Assign an unclaimed lead to a caller. Only succeeds if the lead is still unassigned,
// so two people clicking at the same time can't both claim it.
export async function claimLeadAction(leadId: string, staffName: string) {
  try {
    if (!(LEAD_STAFF as readonly string[]).includes(staffName)) {
      return { success: false, error: 'Unknown staff member.' }
    }

    const result = await prisma.lead.updateMany({
      where: { id: leadId, OR: [{ staff: null }, { staff: '' }] },
      data: { staff: staffName }
    })

    if (result.count === 0) {
      const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { staff: true } })
      return { success: false, error: lead ? `Already assigned to ${lead.staff}.` : 'Lead not found.' }
    }

    await prisma.activity.create({
      data: {
        leadId,
        type: 'STATUS_CHANGE',
        title: `Assigned to ${staffName}`,
        performedBy: staffName,
      }
    })

    revalidatePath('/leads', 'layout')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to claim lead:', error)
    return { success: false, error: 'Failed to assign lead.' }
  }
}

// Send an assigned lead back to the New Leads pool
export async function unassignLeadAction(leadId: string) {
  try {
    const existingLead = await prisma.lead.findUnique({ where: { id: leadId }, select: { staff: true } })
    if (!existingLead) return { success: false, error: 'Lead not found.' }

    await prisma.lead.update({
      where: { id: leadId },
      data: { staff: null }
    })

    await prisma.activity.create({
      data: {
        leadId,
        type: 'STATUS_CHANGE',
        title: `Unassigned from ${existingLead.staff || 'staff'}`,
        description: 'Lead returned to New Leads',
        performedBy: existingLead.staff || 'System',
      }
    })

    revalidatePath('/leads', 'layout')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to unassign lead:', error)
    return { success: false, error: 'Failed to unassign lead.' }
  }
}
