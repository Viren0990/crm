import { getDashboardStats } from '@/app/actions/dashboardActions'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Users, Target, Rocket, CheckCircle2, TrendingUp, Calendar, Phone, AlertCircle } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { RefreshButton } from '@/components/ui/RefreshButton'

export default async function Dashboard() {
  const { stats, funnel, focus } = await getDashboardStats()

  // Conversion rate logic
  const conversionRate = stats.totalLeads > 0 
    ? Math.round((stats.completedClients / stats.totalLeads) * 100) 
    : 0

  return (
    <div className="flex flex-col gap-6 p-6 animate-fade-in">
      <PageHeader 
        title="Dashboard" 
        description="Overview of your pipeline and recent activity" 
        action={
          <div className="flex items-center gap-3">
            <RefreshButton />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
        <StatsCard 
          title="Total Leads" 
          value={stats.totalLeads.toString()} 
          icon={<Users className="w-5 h-5 text-blue-600" />}
          trend="+12% from last week"
          trendUp={true}
        />
        <StatsCard 
          title="Active Demos" 
          value={stats.activeDemos.toString()} 
          icon={<Target className="w-5 h-5 text-amber-600" />}
          trend="Scheduled & Pending"
          trendUp={true}
        />
        <StatsCard 
          title="In Onboarding" 
          value={stats.pendingOnboardings.toString()} 
          icon={<Rocket className="w-5 h-5 text-indigo-600" />}
          trend="Clients starting up"
          trendUp={false}
        />
        <StatsCard 
          title="Completed Clients" 
          value={stats.completedClients.toString()} 
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          trend="Fully onboarded"
          trendUp={true}
        />
        <StatsCard 
          title="Conversion Rate" 
          value={`${conversionRate}%`} 
          icon={<TrendingUp className="w-5 h-5 text-violet-600" />}
          trend="Target: 25%"
          trendUp={conversionRate > 25}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Funnel */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
          <div className="flex-1 flex flex-col justify-center gap-3">
            {[
              { label: 'Total Leads', value: funnel.leads, color: 'bg-blue-500', width: '100%' },
              { label: 'Needs Call Back', value: funnel.contacted, color: 'bg-indigo-500', width: funnel.leads > 0 ? `${(funnel.contacted/funnel.leads)*100}%` : '0%' },
              { label: 'Demos Booked', value: funnel.demos, color: 'bg-amber-500', width: funnel.leads > 0 ? `${(funnel.demos/funnel.leads)*100}%` : '0%' },
              { label: 'Clients Onboarding', value: funnel.onboarding, color: 'bg-emerald-500', width: funnel.leads > 0 ? `${(funnel.onboarding/funnel.leads)*100}%` : '0%' },
            ].map((stage, i) => (
              <div key={i} className="relative w-full h-12 bg-gray-50 rounded-xl overflow-hidden group">
                <div 
                  className={`absolute top-0 left-0 h-full ${stage.color} transition-all duration-1000 ease-out`}
                  style={{ width: stage.width }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-4 text-sm font-medium z-10">
                  <span className={parseInt(stage.width) > 20 ? 'text-white' : 'text-gray-700'}>{stage.label}</span>
                  <span className={parseInt(stage.width) > 90 ? 'text-white' : 'text-gray-900 font-bold'}>{stage.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Focus */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-indigo-600" />
            Today's Focus
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            
            {focus.demos.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Demos Today</h4>
                <div className="space-y-2">
                  {focus.demos.map(demo => (
                    <div key={demo.id} className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="font-medium text-gray-900">{demo.lead?.name}</div>
                      <div className="text-xs text-amber-700 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" /> {formatDateTime(demo.scheduledAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {focus.followUps.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pending Follow-ups</h4>
                <div className="space-y-2">
                  {focus.followUps.map(f => (
                    <div key={f.id} className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                      <div className="font-medium text-gray-900">{f.lead?.name}</div>
                      <div className="text-xs text-rose-700 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" /> {f.followUpDate ? formatDateTime(f.followUpDate) : 'Due'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {focus.newLeads.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Newest Leads</h4>
                <div className="space-y-2">
                  {focus.newLeads.map(l => (
                    <div key={l.id} className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="font-medium text-gray-900">{l.name}</div>
                      <div className="text-xs text-blue-700 flex items-center gap-1 mt-1">
                        {l.company || 'New Entry'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {focus.demos.length === 0 && focus.followUps.length === 0 && focus.newLeads.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No urgent tasks for today. You're all caught up!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
