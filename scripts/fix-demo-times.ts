import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const demos = await prisma.demo.findMany()
  
  console.log(`Found ${demos.length} demos to fix.`)

  const OFFSET_MS = 5.5 * 60 * 60 * 1000 // 5.5 hours in milliseconds

  for (const demo of demos) {
    const dataToUpdate: any = {}
    
    // Subtract 5.5 hours to correct the UTC drift
    if (demo.scheduledAt) {
      dataToUpdate.scheduledAt = new Date(demo.scheduledAt.getTime() - OFFSET_MS)
    }
    
    if (demo.followUpDate) {
      dataToUpdate.followUpDate = new Date(demo.followUpDate.getTime() - OFFSET_MS)
    }

    await prisma.demo.update({
      where: { id: demo.id },
      data: dataToUpdate
    })
  }

  console.log('Successfully fixed all old demo times!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
