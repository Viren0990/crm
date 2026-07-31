import { getOnboardings } from '@/app/actions/onboardingActions'
import { PageHeader } from '@/components/layout/PageHeader'
import { OnboardingTable } from '@/components/onboarding/OnboardingTable'

export default async function OnboardingPage() {
  const onboardings = await getOnboardings()

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 gap-6 animate-fade-in">
      <PageHeader 
        title="Onboarding" 
        description="Track clients transitioning from successful demos."
      />
      
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        <OnboardingTable initialOnboardings={onboardings} />
      </div>
    </div>
  )
}
