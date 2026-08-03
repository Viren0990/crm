'use client'

import { useState, useEffect, useTransition } from 'react'
import { Badge } from '@/components/ui/Badge'
import { SlideOver } from '@/components/ui/SlideOver'
import { LeadForm } from '@/components/leads/LeadForm'
import { LEAD_STATUSES, LEAD_TYPES, LEAD_PRIORITIES, LEAD_STAFF } from '@/lib/constants'
import { formatDate, getStaleLevel, getBadgeClasses, cn } from '@/lib/utils'
import { AlertCircle, AlertTriangle, ArrowDownAZ, ArrowUpAZ, Search, Mail, MessageSquare, Download } from 'lucide-react'
import { toggleLeadFieldAction } from '@/app/actions/leadActions'

// Using any for leads for quick setup, typically you'd export types from Prisma
export function LeadTable({ initialLeads }: { initialLeads: any[] }) {
  const [leads, setLeads] = useState(initialLeads)
  const [isPending, startTransition] = useTransition()
  const [editingLead, setEditingLead] = useState<any | null>(null)

  useEffect(() => {
    setLeads(initialLeads)
  }, [initialLeads])

  // Status Tabs
  const tabs = ['All', 'NEW', 'CONTACTED', 'QUALIFIED', 'DEMO_SCHEDULED', 'LOST']
  const [activeTab, setActiveTab] = useState('All')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [staffFilter, setStaffFilter] = useState('All')

  // Compute unique staff members (defaults + any custom ones from the database)
  const allStaffOptions = Array.from(new Set([
    ...LEAD_STAFF,
    ...leads.map(l => l.staff).filter(s => typeof s === 'string' && s.trim() !== '' && !(LEAD_STAFF as readonly string[]).includes(s))
  ])).sort()

  const filteredLeads = leads.filter(lead => {
    // 1. Tab filter
    if (activeTab !== 'All' && lead.status !== activeTab) return false
    
    // 2. Staff filter
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
    link.setAttribute('download', `leads_export_${activeTab.toLowerCase()}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tabs Row */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 overflow-x-auto">
        <div className="flex items-center gap-2 flex-1">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {tab === 'All' ? 'All Leads' : LEAD_STATUSES.find(s => s.value === tab)?.label || tab}
            </button>
          ))}
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
              <th>Type / Source</th>
              <th>Status</th>
              <th className="text-center">WA / Called</th>
              <th>Notes</th>
              <th>Stale</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-12 text-gray-500">
                  No leads found for this filter.
                </td>
              </tr>
            ) : filteredLeads.map((lead, index) => {
              const priority = LEAD_PRIORITIES.find(p => p.value === lead.priority)
              const status = LEAD_STATUSES.find(s => s.value === lead.status)
              const type = LEAD_TYPES.find(t => t.value === lead.type)
              const stale = getStaleLevel(lead.updatedAt)

              return (
                <tr key={lead.id}>
                  <td className="text-center" onClick={e => e.stopPropagation()}>
                    <div className={cn(
                      "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                      priority ? getBadgeClasses(priority.color) : "bg-gray-100 text-gray-500"
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
                    <div className="flex items-center gap-2">
                      {type && <Badge color={type.color}>{type.label}</Badge>}
                      <span className="text-xs text-gray-500">{lead.source || '—'}</span>
                    </div>
                  </td>
                  <td>
                    {status && <Badge color={status.color}>{status.label}</Badge>}
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => startTransition(async () => { await toggleLeadFieldAction(lead.id, 'whatsappSent', lead.whatsappSent) })}
                        disabled={isPending}
                        className={`toggle-switch ${lead.whatsappSent ? 'active' : ''} ${isPending ? 'opacity-50' : ''}`} 
                      />
                      <span className="text-xs text-gray-500">WA</span>
                      <button 
                        onClick={() => startTransition(async () => { await toggleLeadFieldAction(lead.id, 'called', lead.called) })}
                        disabled={isPending}
                        className={`toggle-switch ${lead.called ? 'active' : ''} ${isPending ? 'opacity-50' : ''}`} 
                      />
                      <span className="text-xs text-gray-500">Call</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs text-gray-600 line-clamp-2 max-w-[160px]">{lead.notes || '—'}</span>
                  </td>
                  <td>
                    {stale === 'danger' && <span title="Stale: >10 days"><AlertCircle className="w-5 h-5 text-rose-500" /></span>}
                    {stale === 'warning' && <span title="Stale: >5 days"><AlertTriangle className="w-5 h-5 text-amber-500" /></span>}
                    {stale === 'none' && <span className="text-gray-300">—</span>}
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
    </div>
  )
}
