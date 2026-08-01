import { getLeads } from '@/app/actions/leadActions'
import { PageHeader } from '@/components/layout/PageHeader'
import { LeadTable } from '@/components/leads/LeadTable'
import { AddLeadButton } from '@/components/leads/AddLeadButton'
import { ImportCsvButton } from '@/components/leads/ImportCsvButton'
import { RefreshButton } from '@/components/ui/RefreshButton'

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  const leads = await getLeads()

  return (
    <div className="flex flex-col h-full min-h-0 p-6 gap-6 animate-fade-in">
      <PageHeader 
        title="Leads" 
        description="Manage your incoming leads and track initial contact."
        action={
          <div className="flex items-center gap-3">
            {/* <RefreshButton /> */}
            {/* <ImportCsvButton /> */}
            <AddLeadButton />
          </div>
        }
      />
      
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-auto">
        <LeadTable initialLeads={leads} />
      </div>
    </div>
  )
}
