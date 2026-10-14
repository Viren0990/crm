import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAssignedLeads } from '@/app/actions/leadActions'
import { PageHeader } from '@/components/layout/PageHeader'
import { LeadTable } from '@/components/leads/LeadTable'
import { LEAD_STAFF } from '@/lib/constants'

export const dynamic = 'force-dynamic'

// /leads/assigned/ritu, /anuja, /pooja, plus /other for leads assigned to a typed-in name
const OTHER_SLUG = 'other'

export default async function AssignedLeadsPage({
  params,
}: {
  params: Promise<{ staff: string }>
}) {
  const { staff: slug } = await params
  const staffName = LEAD_STAFF.find(name => name.toLowerCase() === slug.toLowerCase())
  if (!staffName && slug !== OTHER_SLUG) notFound()

  const leads = await getAssignedLeads()
  const isKnownStaff = (name: string | null) => (LEAD_STAFF as readonly (string | null)[]).includes(name)
  const otherLeads = leads.filter(l => !isKnownStaff(l.staff))
  const pageLeads = staffName ? leads.filter(l => l.staff === staffName) : otherLeads

  return (
    <div className="flex flex-col h-full min-h-0 p-6 gap-6 animate-fade-in">
      <PageHeader 
        title={staffName ? `Assigned to ${staffName}` : 'Assigned to Others'} 
        description={`${pageLeads.length} assigned ${pageLeads.length === 1 ? 'lead' : 'leads'}.`}
      />

      {staffName && otherLeads.length > 0 && (
        <Link href={`/leads/assigned/${OTHER_SLUG}`} className="text-sm text-indigo-600 hover:underline -mt-3">
          {otherLeads.length} {otherLeads.length === 1 ? 'lead is' : 'leads are'} assigned to other names — view them
        </Link>
      )}
      
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-auto">
        <LeadTable key={slug} initialLeads={pageLeads} mode="assigned" />
      </div>
    </div>
  )
}
