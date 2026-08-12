'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { SlideOver } from '@/components/ui/SlideOver'
import { FollowUpsList } from '@/components/leads/FollowUpsList'
import { formatDate } from '@/lib/utils'
import { ArrowDownAZ, ArrowUpAZ, Search, MessageSquare, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createOnboardingAction } from '@/app/actions/onboardingActions'
import { useRouter } from 'next/navigation'

export function FollowUpTable({ initialLeads }: { initialLeads: any[] }) {
  const [leads, setLeads] = useState(initialLeads)
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    setLeads(initialLeads)
  }, [initialLeads])

  const filteredLeads = leads.filter(lead => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      const matchName = lead.name?.toLowerCase().includes(q)
      const matchEmail = lead.email?.toLowerCase().includes(q)
      const matchCompany = lead.company?.toLowerCase().includes(q)
      if (!matchName && !matchEmail && !matchCompany) return false
    }
    return true
  })

  // Sort by the latest follow up date
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    const timeA = a.followUps && a.followUps.length > 0 ? new Date(a.followUps[0].scheduledDate).getTime() : 0
    const timeB = b.followUps && b.followUps.length > 0 ? new Date(b.followUps[0].scheduledDate).getTime() : 0
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header Toolbar */}
      <div className="flex items-center justify-end gap-3 px-4 py-3 border-b border-gray-100">
        <div className="relative flex items-center shrink-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-3" />
          <input 
            type="text" 
            placeholder="Search leads..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-1.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 transition-all focus:w-64"
          />
        </div>
        <button
          onClick={() => setSortOrder(s => s === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          {sortOrder === 'desc' ? <ArrowDownAZ className="w-4 h-4" /> : <ArrowUpAZ className="w-4 h-4" />}
          Sort Latest
        </button>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto table-container rounded-none border-0 shadow-none">
        <table>
          <thead>
            <tr>
              <th className="w-8 text-center text-gray-400 font-medium text-xs">#</th>
              <th>Lead Info</th>
              <th>Assigned Staff</th>
              <th>Total Attempts</th>
              <th>Latest Attempt Date</th>
              <th>Latest Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedLeads.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-500">
                  No leads in follow-up stage.
                </td>
              </tr>
            ) : sortedLeads.map((lead, index) => {
              const latestFollowUp = lead.followUps && lead.followUps.length > 0 ? lead.followUps[0] : null
              
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const isPastDue = latestFollowUp && latestFollowUp.status === 'PENDING' && new Date(latestFollowUp.scheduledDate) < today

              return (
                <tr 
                  key={lead.id} 
                  className={`${isPastDue ? 'bg-amber-50/30' : ''} cursor-pointer hover:bg-gray-50/50 transition-colors`}
                  onClick={() => {
                    setSelectedLead(lead)
                    setIsSlideOverOpen(true)
                  }}
                >
                  <td className="text-center text-gray-400 text-xs font-medium" onClick={e => e.stopPropagation()}>
                    {index + 1}
                  </td>
                  <td>
                    <div className="font-medium text-indigo-600 hover:underline">
                      {lead.name || '—'}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1.5 group mt-0.5">
                      {lead.phone || '—'}
                      {lead.phone && (
                        <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity" title="Message on WhatsApp">
                          <MessageSquare className="w-3.5 h-3.5 text-green-600 hover:text-green-700" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td>
                    {lead.staff ? (
                      <span className="font-medium text-gray-900">{lead.staff}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td>
                    <Badge color="blue">{lead.followUps?.length || 0} Attempts</Badge>
                  </td>
                  <td>
                    {latestFollowUp ? (
                      <div className={`font-medium ${isPastDue ? 'text-amber-600' : 'text-gray-900'}`}>
                        {formatDate(latestFollowUp.scheduledDate)} {latestFollowUp.scheduledTime ? `at ${latestFollowUp.scheduledTime}` : ''}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td>
                    <div className="text-sm text-gray-500 truncate max-w-[200px]" title={latestFollowUp?.notes || ''}>
                      {latestFollowUp?.notes || '—'}
                    </div>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="h-7 text-xs px-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        onClick={async () => {
                          await createOnboardingAction(lead.id)
                          router.push('/onboarding')
                        }}
                      >
                        <Rocket className="w-3 h-3 mr-1" /> Onboard
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <SlideOver 
        isOpen={isSlideOverOpen} 
        onClose={() => setIsSlideOverOpen(false)}
        title="All Follow Ups"
      >
        {selectedLead && (() => {
          const freshLead = leads.find((l: any) => l.id === selectedLead.id) || selectedLead;
          return (
            <FollowUpsList 
              leadId={freshLead.id} 
              initialFollowUps={freshLead.followUps || []} 
            />
          );
        })()}
      </SlideOver>
    </div>
  )
}
