'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { SlideOver } from '@/components/ui/SlideOver'
import { FollowUpForm } from '@/components/followups/FollowUpForm'
import { formatDateTime, formatDate } from '@/lib/utils'
import { ArrowDownAZ, ArrowUpAZ, Search, MessageSquare, Mail } from 'lucide-react'

export function FollowUpTable({ initialFollowUps }: { initialFollowUps: any[] }) {
  const [followUps, setFollowUps] = useState(initialFollowUps)
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false)
  const [editingFollowUp, setEditingFollowUp] = useState<any>(null)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setFollowUps(initialFollowUps)
  }, [initialFollowUps])

  const filteredFollowUps = followUps.filter(item => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      const lead = item.lead
      if (!lead) return false
      
      const matchName = lead.name?.toLowerCase().includes(q)
      const matchEmail = lead.email?.toLowerCase().includes(q)
      const matchCompany = lead.company?.toLowerCase().includes(q)
      if (!matchName && !matchEmail && !matchCompany) return false
    }
    return true
  })

  const sortedFollowUps = [...filteredFollowUps].sort((a, b) => {
    const timeA = new Date(a.createdAt || a.scheduledAt || Date.now()).getTime() // fallback to scheduledAt if needed
    const timeB = new Date(b.createdAt || b.scheduledAt || Date.now()).getTime()
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
            placeholder="Search follow ups..." 
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

      {/* Table Container */}
      <div className="flex-1 overflow-auto table-container rounded-none border-0 shadow-none">
        <table>
          <thead>
            <tr>
              <th className="w-8 text-center text-gray-400 font-medium text-xs">#</th>
              <th>Lead Name</th>
              <th>Assigned Staff</th>
              <th>Company</th>
              <th>Demo Date</th>
              <th>Follow-up Date</th>
              <th>Follow-up Notes</th>
              <th>Result / Outcome</th>
            </tr>
          </thead>
          <tbody>
            {sortedFollowUps.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-500">
                  No pending follow ups found.
                </td>
              </tr>
            ) : sortedFollowUps.map((demo, index) => {
              
              const isPastDue = demo.followUpDate && new Date(demo.followUpDate) < new Date()

              return (
                <tr 
                  key={demo.id} 
                  className={`${isPastDue ? 'bg-amber-50/30' : ''} cursor-pointer hover:bg-gray-50/50 transition-colors`}
                  onClick={() => {
                    setEditingFollowUp(demo)
                    setIsSlideOverOpen(true)
                  }}
                >
                  <td className="text-center text-gray-400 text-xs font-medium" onClick={e => e.stopPropagation()}>
                    {index + 1}
                  </td>
                  <td>
                    <div className="font-medium text-indigo-600 hover:underline">
                      {demo.lead?.name || '—'}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1.5 group mt-0.5">
                      {demo.lead?.phone || '—'}
                      {demo.lead?.phone && (
                        <a href={`https://wa.me/${demo.lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity" title="Message on WhatsApp">
                          <MessageSquare className="w-3.5 h-3.5 text-green-600 hover:text-green-700" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td>
                    {demo.lead?.staff ? (
                      <span className="font-medium text-gray-900">{demo.lead.staff}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td>{demo.lead?.company || '—'}</td>
                  <td>
                    <div className="text-sm text-gray-500">
                      {formatDate(demo.scheduledAt)}
                    </div>
                  </td>
                  <td>
                    <div className={`font-medium ${isPastDue ? 'text-amber-600' : 'text-gray-900'}`}>
                      {demo.followUpDate ? formatDateTime(demo.followUpDate) : 'Not set'}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm text-gray-500 truncate max-w-[200px]" title={demo.followUpNotes}>
                      {demo.followUpNotes || '—'}
                    </div>
                  </td>
                  <td>
                    <div className="font-medium text-gray-900 truncate max-w-[150px]" title={demo.followUpResult}>
                      {demo.followUpResult || '—'}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Slide Over Form */}
      <SlideOver
        title="Follow Up Details"
        isOpen={isSlideOverOpen}
        onClose={() => {
          setIsSlideOverOpen(false)
          setEditingFollowUp(null)
        }}
      >
        {editingFollowUp && (
          <FollowUpForm 
            initialData={editingFollowUp} 
            onSuccess={() => {
              setIsSlideOverOpen(false)
              setEditingFollowUp(null)
            }}
            onCancel={() => {
              setIsSlideOverOpen(false)
              setEditingFollowUp(null)
            }}
          />
        )}
      </SlideOver>
    </div>
  )
}
