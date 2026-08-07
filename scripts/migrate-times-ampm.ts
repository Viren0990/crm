import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

function formatToAmPm(time: string | null): string | null {
  if (!time) return null
  const [hourStr, minuteStr] = time.split(':')
  if (!hourStr || !minuteStr) return time
  
  let hour = parseInt(hourStr, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  
  if (hour === 0) {
    hour = 12
  } else if (hour > 12) {
    hour -= 12
  }
  
  return `${hour}:${minuteStr} ${ampm}`
}

async function main() {
  const demos = await prisma.demo.findMany()
  console.log(`Migrating ${demos.length} demos to AM/PM string time fields...`)

  for (const demo of demos) {
    const dataToUpdate: any = {}
    
    if (demo.scheduledTime) {
      dataToUpdate.scheduledTime = formatToAmPm(demo.scheduledTime)
    }
    
    if (demo.followUpTime) {
      dataToUpdate.followUpTime = formatToAmPm(demo.followUpTime)
    }

    if (Object.keys(dataToUpdate).length > 0) {
      await prisma.demo.update({
        where: { id: demo.id },
        data: dataToUpdate
      })
    }
  }
  
  const leads = await prisma.lead.findMany({
    where: { followUpTime: { not: null } }
  })
  
  for (const lead of leads) {
    if (lead.followUpTime) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { followUpTime: formatToAmPm(lead.followUpTime) }
      })
    }
  }

  console.log('Successfully migrated all times to AM/PM format!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
