import { getNewLeads } from '@/app/actions/leadActions'
import { PageHeader } from '@/components/layout/PageHeader'
import { LeadTable } from '@/components/leads/LeadTable'
import { AddLeadButton } from '@/components/leads/AddLeadButton'
import { ImportCsvButton } from '@/components/leads/ImportCsvButton'

export const dynamic = 'force-dynamic'

export default async function NewLeadsPage() {
  const leads = await getNewLeads()

  return (
    <div className="flex flex-col h-full min-h-0 p-6 gap-6 animate-fade-in">
      <PageHeader 
        title="New Leads" 
        description={`${leads.length} unassigned ${leads.length === 1 ? 'lead' : 'leads'}. Pick one and assign it to yourself.`}
        action={
          <div className="flex items-center gap-3">
            <ImportCsvButton />
            <AddLeadButton />
          </div>
        }
      />
      
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-auto">
        <LeadTable initialLeads={leads} mode="new" />
      </div>
    </div>
  )
}
