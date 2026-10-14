import { getLostLeads } from '@/app/actions/leadActions'
import { PageHeader } from '@/components/layout/PageHeader'
import { LeadTable } from '@/components/leads/LeadTable'

export const dynamic = 'force-dynamic'

export default async function LostLeadsPage() {
  const leads = await getLostLeads()

  return (
    <div className="flex flex-col h-full min-h-0 p-6 gap-6 animate-fade-in">
      <PageHeader 
        title="Lost Leads" 
        description={`${leads.length} lost ${leads.length === 1 ? 'lead' : 'leads'}. Restore one to send it back to its caller.`}
      />
      
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-auto">
        <LeadTable initialLeads={leads} mode="lost" />
      </div>
    </div>
  )
}
