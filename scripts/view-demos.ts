import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const demos = await prisma.demo.findMany({
    select: {
      id: true,
      scheduledAt: true,
      followUpDate: true
    },
    take: 5,
    orderBy: { createdAt: 'desc' }
  })
  
  console.log("Demos in DB (Raw UTC representation):")
  demos.forEach(d => {
    console.log(`ID: ${d.id}`)
    console.log(`  Scheduled: ${d.scheduledAt.toISOString()}`)
    if (d.followUpDate) console.log(`  FollowUp:  ${d.followUpDate.toISOString()}`)
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())
