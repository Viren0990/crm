import { getDemos } from '@/app/actions/demoActions'
import { PageHeader } from '@/components/layout/PageHeader'
import { DemoTable } from '@/components/demos/DemoTable'
import { Button } from '@/components/ui/Button'
import { CalendarPlus } from 'lucide-react'

export default async function DemosPage() {
  const demos = await getDemos()

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 gap-6 animate-fade-in">
      <PageHeader 
        title="Demos" 
        description="Track upcoming demos and their outcomes."
        action={
          <Button>
            <CalendarPlus className="w-4 h-4 mr-2" />
            Schedule Demo
          </Button>
        }
      />
      
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        <DemoTable initialDemos={demos} />
      </div>
    </div>
  )
}
