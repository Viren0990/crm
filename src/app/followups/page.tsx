import { PageHeader } from '@/components/layout/PageHeader'
import { FollowUpTable } from '@/components/followups/FollowUpTable'
import { getFollowUps } from '@/app/actions/demoActions'
import { RefreshButton } from '@/components/ui/RefreshButton'

export const dynamic = 'force-dynamic'

export default async function FollowUpsPage() {
  const followUps = await getFollowUps()

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <PageHeader 
        title="Follow Ups" 
        description={`${followUps.length} follow-ups required`}
        action={
          <div className="flex items-center gap-3">
            {/* <RefreshButton /> */}
          </div>
        }
      />
      <div className="flex-1 p-6 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 bg-white border border-gray-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <FollowUpTable initialFollowUps={followUps} />
        </div>
      </div>
    </div>
  )
}
