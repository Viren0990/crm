import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('WARNING: Deleting all CRM data...')

  // Delete in order of dependencies (child records first, though Cascade should handle it)
  const activityCount = await prisma.activity.deleteMany({})
  console.log(`Deleted ${activityCount.count} activities`)

  const followUpCount = await prisma.followUp.deleteMany({})
  console.log(`Deleted ${followUpCount.count} follow-ups`)

  const demoCount = await prisma.demo.deleteMany({})
  console.log(`Deleted ${demoCount.count} demos`)

  const onboardingCount = await prisma.onboarding.deleteMany({})
  console.log(`Deleted ${onboardingCount.count} onboarding records`)

  const leadCount = await prisma.lead.deleteMany({})
  console.log(`Deleted ${leadCount.count} leads`)

  console.log('✅ Database wiped successfully for a fresh start.')
}

main()
  .catch((e) => {
    console.error('Error wiping database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
