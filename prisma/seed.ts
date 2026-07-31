import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const rawData = [
  { name: 'Iqbal Ahmad', phone: '+917897153234', notes: "Not answering, informed on what's app", city: 'gorakh', whatsappSent: true, email: 'iqbalmurshida463@gmail.com' },
  { name: 'Guruji Jewellers', phone: '+917567525679', notes: "session book for 1st aug at 12pm", city: 'Bhavnagar', whatsappSent: true, email: 'mg17021984@gmail.com' },
  { name: 'Anoop Bajpai', phone: '+919389014377', notes: "Not answering, informed on what's app", city: 'Kanpur', whatsappSent: true, email: 'anoopkumarbajpai7@gmail.com' },
  { name: 'Dhiraj Soni', phone: '+917905049284', notes: "called, also informed on what's app", city: 'Sonbhadra', whatsappSent: true, email: 'dhirjsoni828@gmail.com' },
  { name: 'SIRAJUDEEN', phone: '+919566242701', notes: "Not answering, informed on what's app", city: 'Pondicherry', whatsappSent: true, email: 'asirajudeen189@gmail.com' },
  { name: 'Narendra Soni', phone: '+919414241635', notes: "call failed", city: 'Nagaur', whatsappSent: false, email: 'nks25051975@gmail.com' },
  { name: 'Sunil sony', phone: '+919660144936', notes: "", city: 'Ahore jalore', whatsappSent: false, email: 'sunilsony8619@gmail.com' },
  { name: 'Shobu', phone: '+919596176738', notes: "", city: 'srinagar', whatsappSent: false, email: 'jannahida21@gmail.com' },
  { name: 'Upkar Bhikhiwind', phone: '+919815431505', notes: "", city: 'Bhikhiwind', whatsappSent: false, email: 'upkar0200@gmail.com' },
  { name: 'Sumit kumar', phone: '+917717763989', notes: "", city: 'Muzaffarpur', whatsappSent: false, email: 'sumeet_pam2004@yahoo.co.in' },
  { name: 'Umeed Alam', phone: '+919627921844', notes: "", city: 'Bulandshahr', whatsappSent: false, email: 'umeedalam404@gmail.com' },
  { name: 'Swadesh Kumar', phone: '+919927502930', notes: "", city: 'Kasganj', whatsappSent: false, email: 'swadeshk867@gmail.com' },
  { name: 'Rajendra Singh', phone: '+917727910311', notes: "", city: 'Jalore', whatsappSent: false, email: 'singh910311@yahoo.com' },
  { name: 'Sadakat', phone: '+918005753629', notes: "", city: 'Udaipur', whatsappSent: false, email: 'arartsjewellers@gmail.com' },
  { name: 'lokesh', phone: '+918303189430', notes: "", city: 'Bahraich', whatsappSent: false, email: 'lv4991946@gmail.com' },
  { name: 'Kanchan Sharma', phone: '+919785021287', notes: "", city: 'bhiwadi', whatsappSent: false, email: 'kanchan.bhiwadi@yahoo.com' },
  { name: 'Vikram Verma', phone: '+919816171000', notes: "", city: 'Shimla', whatsappSent: false, email: 'Vikram71000@gmail.com' },
  { name: 'Rattan Lal Rattan', phone: '+919419135316', notes: "", city: 'Tawi - Jammu', whatsappSent: false, email: 'rrattanlal936@gmail.com' },
  { name: 'Pradip Kashyap', phone: '+918840394387', notes: "", city: 'Farrukhabad', whatsappSent: false, email: 'pradipkumarpradip109@gmail.com' },
  { name: 'mitesh', phone: '9874651230', notes: "not responding", city: 'NA', whatsappSent: false, email: '' },
  { name: 'Sanjit Kumar', phone: '+919708453213', notes: "B2C , demo @ 5pm , 31/07/26", city: 'Nawada', whatsappSent: false, email: 'sanjitjyoti16031976@gmail.com' },
  { name: 'Rubul Haque', phone: '+918486460011', notes: "Disconnecting call", city: 'Barpeta assam', whatsappSent: false, email: 'rubulhaque12@gmail.com' },
  { name: 'Pawan Kumar Soni', phone: '+919830027511', notes: "he will call on 3th August for demo booking", city: 'Kolka', whatsappSent: false, email: 'sonissj18@gmail.com' },
  { name: 'Metro ornaments', phone: '+919810503127', notes: "not reachable", city: 'Baramula', whatsappSent: false, email: 'sasjks@yahoo.in' },
  { name: 'Kishan sonjia u ubu', phone: '+919026725042', notes: "", city: 'Kanpur', whatsappSent: false, email: 'sonikishan488r@gmail.com' },
  { name: 'Sandeep Verma', phone: '+919889421346', notes: "", city: 'sitapur up', whatsappSent: false, email: 'sv8616677@gmail.com' }
]

async function main() {
  console.log('🗑️  Clearing existing data...')
  await prisma.activity.deleteMany()
  await prisma.onboarding.deleteMany()
  await prisma.demo.deleteMany()
  await prisma.lead.deleteMany()

  console.log('🌱 Seeding specific lead data...')
  
  for (const item of rawData) {
    let status = 'NEW'
    if (item.notes.includes('demo @')) {
      status = 'DEMO_SCHEDULED'
    } else if (item.notes.includes('informed on') || item.notes.includes('called')) {
      status = 'CONTACTED'
    }

    const lead = await prisma.lead.create({
      data: {
        name: item.name,
        phone: item.phone,
        email: item.email || null,
        city: item.city !== 'NA' ? item.city : null,
        notes: item.notes || null,
        whatsappSent: item.whatsappSent,
        status: status,
      }
    })

    if (status === 'DEMO_SCHEDULED') {
      await prisma.demo.create({
        data: {
          leadId: lead.id,
          type: 'B2C',
          scheduledAt: new Date('2026-07-31T17:00:00Z'),
          conductedBy: 'TBD'
        }
      })
    }
  }

  console.log(`✅ Successfully seeded ${rawData.length} leads!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
