import { PageHeader } from '@/components/layout/PageHeader'
import { PositiveLeadTable } from '@/components/positive-leads/PositiveLeadTable'
import { getPositiveLeads } from '@/app/actions/leadActions'

export const dynamic = 'force-dynamic'

export default async function PositiveLeadsPage() {
  const leads = await getPositiveLeads()

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <PageHeader 
        title="Positive Leads" 
        description={`${leads.length} positive leads in pipeline`}
      />
      <div className="flex-1 p-6 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 bg-white border border-gray-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden">
            <PositiveLeadTable initialLeads={leads} />
          </div>
        </div>
      </div>
    </div>
  )
}
