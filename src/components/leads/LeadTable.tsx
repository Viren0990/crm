'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { SlideOver } from '@/components/ui/SlideOver'
import { LeadForm } from '@/components/leads/LeadForm'
import { FollowUpsList } from '@/components/leads/FollowUpsList'
import { LEAD_PRIORITIES, LEAD_STAFF } from '@/lib/constants'
import { formatDate, getSolidBadgeClasses, cn } from '@/lib/utils'
import { ArrowDownAZ, ArrowUpAZ, Search, Mail, MessageSquare, Download, Rocket } from 'lucide-react'
import { createOnboardingAction } from '@/app/actions/onboardingActions'
import { Button } from '@/components/ui/Button'

export function LeadTable({ initialLeads }: { initialLeads: any[] }) {
  const router = useRouter()
  const [leads, setLeads] = useState(initialLeads)
  const [editingLead, setEditingLead] = useState<any | null>(null)
  const [selectedFollowUpLead, setSelectedFollowUpLead] = useState<any | null>(null)
  const [isFollowUpSlideOverOpen, setIsFollowUpSlideOverOpen] = useState(false)

  useEffect(() => {
    setLeads(initialLeads)
  }, [initialLeads])

  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [staffFilter, setStaffFilter] = useState('All')

  // Compute unique staff members (defaults + any custom ones from the database)
  const allStaffOptions = Array.from(new Set([
    ...LEAD_STAFF,
    ...leads.map(l => l.staff).filter(s => typeof s === 'string' && s.trim() !== '' && !(LEAD_STAFF as readonly string[]).includes(s))
  ])).sort()

  const filteredLeads = leads.filter(lead => {
    // 1. Staff filter
    if (staffFilter !== 'All') {
      if (staffFilter === 'Unassigned') {
        if (lead.staff && lead.staff.trim() !== '') return false
      } else {
        if (lead.staff !== staffFilter) return false
      }
    }
    
    // 2. Search filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      const matchName = lead.name?.toLowerCase().includes(q)
      const matchEmail = lead.email?.toLowerCase().includes(q)
      const matchCompany = lead.company?.toLowerCase().includes(q)
      const matchPhone = lead.phone?.toLowerCase().includes(q)
      if (!matchName && !matchEmail && !matchCompany && !matchPhone) return false
    }
    
    return true
  }).sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime()
    const timeB = new Date(b.createdAt).getTime()
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB
  })

  const handleExportCsv = () => {
    if (filteredLeads.length === 0) return;
    
    // Define headers
    const headers = ['Name', 'Email', 'Phone', 'Company', 'City', 'Status', 'Type', 'Source', 'Notes', 'Created At'];
    
    // Map data
    const csvData = filteredLeads.map(lead => [
      `"${(lead.name || '').replace(/"/g, '""')}"`,
      `"${(lead.email || '').replace(/"/g, '""')}"`,
      `"${(lead.phone || '').replace(/"/g, '""')}"`,
      `"${(lead.company || '').replace(/"/g, '""')}"`,
      `"${(lead.city || '').replace(/"/g, '""')}"`,
      `"${(lead.status || '').replace(/"/g, '""')}"`,
      `"${(lead.type || '').replace(/"/g, '""')}"`,
      `"${(lead.source || '').replace(/"/g, '""')}"`,
      `"${(lead.notes || '').replace(/"/g, '""')}"`,
      `"${new Date(lead.createdAt).toISOString()}"`
    ]);
    
    // Combine headers and data
    const csvString = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tabs Row */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 overflow-x-auto">
        <div className="flex items-center gap-2 flex-1">
        </div>
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
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="px-3 py-1.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-gray-700 cursor-pointer"
          >
            <option value="All">All Staff</option>
            {allStaffOptions.map(staff => (
              <option key={staff} value={staff}>{staff}</option>
            ))}
            <option value="Unassigned">Unassigned</option>
          </select>
        </div>
        <button
          onClick={() => setSortOrder(s => s === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors shrink-0"
        >
          {sortOrder === 'desc' ? <ArrowDownAZ className="w-4 h-4" /> : <ArrowUpAZ className="w-4 h-4" />}
          Sort
        </button>
      </div>

      {/* Table Container */}
      <div className="flex-1 min-h-0 overflow-auto table-container rounded-none border-0 shadow-none">
        <table>
          <thead>
            <tr>
              <th className="w-8 text-center text-gray-400 font-medium text-xs">#</th>
              <th className="w-24">Date</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Assigned Staff</th>
              <th>Address / City</th>
              <th>Follow-Ups</th>
              <th>Notes</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-gray-500">
                  No leads found for this filter.
                </td>
              </tr>
            ) : filteredLeads.map((lead, index) => {
              const priority = LEAD_PRIORITIES.find(p => p.value === lead.priority)

              return (
                <tr key={lead.id} className="group">
                  <td className="text-center" onClick={e => e.stopPropagation()}>
                    <div className={cn(
                      "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                      priority ? getSolidBadgeClasses(priority.color) : "bg-gray-200 text-gray-500"
                    )}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="text-sm text-gray-600 whitespace-nowrap">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td>
                    <div 
                      onClick={() => setEditingLead(lead)}
                      className="font-medium text-indigo-600 cursor-pointer hover:underline"
                    >
                      {lead.name}
                    </div>
                    {lead.company && <div className="text-xs text-gray-500">{lead.company}</div>}
                  </td>
                  <td>
                    <div className="text-sm flex items-center gap-1.5 group">
                      {lead.phone || '—'}
                      {lead.phone && (
                        <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity" title="Message on WhatsApp">
                          <MessageSquare className="w-3.5 h-3.5 text-green-600 hover:text-green-700" />
                        </a>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1.5 group mt-0.5">
                      {lead.email || '—'}
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} onClick={e => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity" title="Send Email">
                          <Mail className="w-3.5 h-3.5 text-blue-500 hover:text-blue-600" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="text-sm font-medium text-gray-700">{lead.staff || '—'}</span>
                  </td>
                  <td>
                    <span className="text-sm text-gray-700">{lead.city || '—'}</span>
                  </td>
                  <td>
                    <div 
                      className="cursor-pointer hover:opacity-80 inline-block"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFollowUpLead(lead);
                        setIsFollowUpSlideOverOpen(true);
                      }}
                      title="Manage Follow-Ups"
                    >
                      {lead.followUpStatus === 'COMPLETED' ? (
                        <Badge color="emerald">Completed</Badge>
                      ) : lead.followUpStatus === 'LOST' ? (
                        <Badge color="rose">Lost</Badge>
                      ) : (
                        <Badge color="amber">Ongoing ({lead.followUps?.length || 0})</Badge>
                      )}
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

      <div className="flex justify-end px-4 py-2 border-t border-gray-100 bg-gray-50/50 mt-auto shrink-0">
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-indigo-700 bg-white border border-indigo-100 hover:bg-indigo-50 transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          Export Current View to CSV
        </button>
      </div>

      <SlideOver 
        isOpen={!!editingLead} 
        onClose={() => setEditingLead(null)}
        title="Edit Lead"
        description="Update the lead's details and classification."
      >
        {editingLead && (
          <LeadForm 
            initialData={editingLead}
            onSuccess={() => setEditingLead(null)} 
            onCancel={() => setEditingLead(null)} 
          />
        )}
      </SlideOver>

      <SlideOver 
        isOpen={isFollowUpSlideOverOpen} 
        onClose={() => setIsFollowUpSlideOverOpen(false)}
        title="Follow Ups"
      >
        {selectedFollowUpLead && (() => {
          const freshLead = leads.find((l: any) => l.id === selectedFollowUpLead.id) || selectedFollowUpLead;
          return (
            <FollowUpsList 
              leadId={freshLead.id} 
              initialFollowUps={freshLead.followUps || []} 
              initialFollowUpStatus={freshLead.followUpStatus || 'ONGOING'}
              onStatusChange={(newStatus) => {
                if (newStatus === 'LOST') {
                  setIsFollowUpSlideOverOpen(false);
                }
              }}
            />
          );
        })()}
      </SlideOver>
    </div>
  )
}
