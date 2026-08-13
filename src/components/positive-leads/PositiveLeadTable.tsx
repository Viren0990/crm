'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SlideOver } from '@/components/ui/SlideOver'
import { FollowUpsList } from '@/components/leads/FollowUpsList'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { formatDate } from '@/lib/utils'
import { ArrowDownAZ, ArrowUpAZ, Search, MessageSquare, ThumbsUp, Rocket } from 'lucide-react'
import { markDetailsSentAction } from '@/app/actions/followUpActions'
import { updateLeadStatusOnlyAction } from '@/app/actions/leadActions'
import { createOnboardingAction } from '@/app/actions/onboardingActions'
import { FOLLOW_UP_STATUSES } from '@/lib/constants'

export function PositiveLeadTable({ initialLeads }: { initialLeads: any[] }) {
  const router = useRouter()
  const [leads, setLeads] = useState(initialLeads)
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [isPending, startTransition] = useTransition()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [togglingLeadId, setTogglingLeadId] = useState<string | null>(null)

  useEffect(() => {
    setLeads(initialLeads)
  }, [initialLeads])

  const filteredLeads = leads.filter(lead => {
    if (statusFilter !== 'All' && lead.followUpStatus !== statusFilter) return false
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      const matchName = lead.name?.toLowerCase().includes(q)
      const matchEmail = lead.email?.toLowerCase().includes(q)
      const matchCompany = lead.company?.toLowerCase().includes(q)
      const matchPhone = lead.phone?.toLowerCase().includes(q)
      if (!matchName && !matchEmail && !matchCompany && !matchPhone) return false
    }
    return true
  })

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    const timeA = new Date(a.updatedAt).getTime()
    const timeB = new Date(b.updatedAt).getTime()
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {['All', ...FOLLOW_UP_STATUSES.filter(s => s.value !== 'LOST').map(s => s.value)].map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {tab === 'All' ? 'All' : FOLLOW_UP_STATUSES.find(s => s.value === tab)?.label || tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
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
            Sort
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto table-container rounded-none border-0 shadow-none">
        <table>
          <thead>
            <tr>
              <th className="w-8 text-center text-gray-400 font-medium text-xs">#</th>
              <th>Lead Info</th>
              <th>Overall Status</th>
              <th>Assigned Staff</th>
              <th>Total Attempts</th>
              <th>Latest Attempt Date</th>
              <th className="text-center">Details Sent</th>
              <th>Notes</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedLeads.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-gray-500">
                  No positive leads yet. Mark leads as positive from the Leads page.
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
                  className={`${isPastDue ? 'bg-amber-50/30' : ''} cursor-pointer hover:bg-gray-50/50 transition-colors group`}
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
                    <div className="text-xs text-gray-500 flex items-center gap-1.5 group/contact mt-0.5">
                      {lead.phone || '—'}
                      {lead.phone && (
                        <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="opacity-0 group-hover/contact:opacity-100 transition-opacity" title="Message on WhatsApp">
                          <MessageSquare className="w-3.5 h-3.5 text-green-600 hover:text-green-700" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td>
                    {lead.followUpStatus === 'COMPLETED' ? (
                      <Badge color="emerald">Completed</Badge>
                    ) : lead.followUpStatus === 'LOST' ? (
                      <Badge color="rose">Lost</Badge>
                    ) : (
                      <Badge color="amber">Ongoing</Badge>
                    )}
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
                  <td onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-center">
                      <button 
                        type="button"
                        disabled={togglingLeadId === lead.id}
                        onClick={async () => {
                          setTogglingLeadId(lead.id)
                          try {
                            if (lead.status === 'DETAILS_SENT') {
                              await updateLeadStatusOnlyAction(lead.id, 'NEW')
                            } else {
                              await markDetailsSentAction(lead.id)
                              setShowSuccessModal(true)
                            }
                          } catch (e) {
                            console.error("Toggle failed", e)
                          } finally {
                            setTogglingLeadId(null)
                          }
                        }}
                        className={`toggle-switch ${lead.status === 'DETAILS_SENT' ? 'active' : ''} ${togglingLeadId === lead.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  </td>
                  <td>
                    <span className="text-xs text-gray-600 line-clamp-2 max-w-[160px]">{lead.notes || '—'}</span>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-center">
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
        title="Follow Ups"
      >
        {selectedLead && (() => {
          const freshLead = leads.find((l: any) => l.id === selectedLead.id) || selectedLead;
          return (
            <FollowUpsList 
              leadId={freshLead.id} 
              initialFollowUps={freshLead.followUps || []} 
              initialFollowUpStatus={freshLead.followUpStatus || 'ONGOING'}
              onStatusChange={(newStatus) => {
                if (newStatus === 'LOST') {
                  setIsSlideOverOpen(false);
                }
              }}
            />
          );
        })()}
      </SlideOver>

      <ConfirmModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
        title="✅ Details Sent!"
        description="This lead has been successfully marked as 'Details Sent' and added to your Follow-Ups."
        confirmText="OK"
        hideCancel={true}
      />
    </div>
  )
}
