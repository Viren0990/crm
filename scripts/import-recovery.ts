import { prisma } from '../src/lib/prisma'
import fs from 'fs'
import Papa from 'papaparse'

async function main() {
  console.log('Importing recovery.csv...')
  const fileContent = fs.readFileSync('recovery.csv', 'utf-8')
  
  const results = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
  })

  let importedCount = 0;
  for (const row of results.data as any[]) {
    // Basic validation
    if (!row['Name'] && !row['Phone'] && !row['Email']) {
      continue;
    }

    const lead = {
      name: row['Name'] || 'Unknown',
      email: row['Email'] || null,
      phone: row['Phone'] || null,
      company: row['Company'] || null,
      city: row['City'] || null,
      status: row['Status'] || 'NEW',
      type: row['Type'] || 'B2C',
      source: row['Source'] || null,
      notes: row['Notes'] || null,
      createdAt: row['Created At'] ? new Date(row['Created At']) : new Date(),
    }

    await prisma.lead.create({
      data: lead
    })
    importedCount++
  }
  
  console.log(`✅ Successfully imported ${importedCount} leads!`)
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
