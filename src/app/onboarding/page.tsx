import { getOnboardings } from '@/app/actions/onboardingActions'
import { PageHeader } from '@/components/layout/PageHeader'
import { OnboardingTable } from '@/components/onboarding/OnboardingTable'
import { RefreshButton } from '@/components/ui/RefreshButton'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const onboardings = await getOnboardings()

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 gap-6 animate-fade-in">
      <PageHeader 
        title="Onboarding" 
        description="Track clients transitioning from successful demos."
        action={
          <div className="flex items-center gap-3">
            <RefreshButton />
          </div>
        }
      />
      
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        <OnboardingTable initialOnboardings={onboardings} />
      </div>
    </div>
  )
}
