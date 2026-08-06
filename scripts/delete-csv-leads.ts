import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const csvLeads = await prisma.lead.findMany({
    where: { source: 'CSV Import' },
    select: { id: true }
  })

  console.log(`Found ${csvLeads.length} CSV-imported leads to delete.`)

  if (csvLeads.length === 0) {
    console.log('Nothing to delete!')
    return
  }

  const leadIds = csvLeads.map(l => l.id)

  // Delete activities first (foreign key constraint)
  const deletedActivities = await prisma.activity.deleteMany({
    where: { leadId: { in: leadIds } }
  })
  console.log(`Deleted ${deletedActivities.count} activities.`)

  // Delete the leads
  const deletedLeads = await prisma.lead.deleteMany({
    where: { id: { in: leadIds } }
  })
  console.log(`Deleted ${deletedLeads.count} leads.`)

  console.log('Done!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
