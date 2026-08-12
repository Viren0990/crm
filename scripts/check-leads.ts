import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function check() {
  const count = await prisma.$queryRaw`SELECT count(*) FROM "Lead" WHERE "followUpDate" IS NOT NULL OR "followUpTime" IS NOT NULL;`
  console.log('Leads with follow up data:', count)
}

check().finally(() => prisma.$disconnect())
