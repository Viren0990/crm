'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { SlideOver } from '@/components/ui/SlideOver'
import { DemoForm } from '@/components/demos/DemoForm'
import { DEMO_STATUSES, LEAD_TYPES } from '@/lib/constants'
import { formatDateTime, getBadgeClasses, formatDate } from '@/lib/utils'
import { ArrowDownAZ, ArrowUpAZ, Search } from 'lucide-react'

export function DemoTable({ initialDemos }: { initialDemos: any[] }) {
  const [demos, setDemos] = useState(initialDemos)
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false)
  const [editingDemo, setEditingDemo] = useState<any>(null)

  useEffect(() => {
    setDemos(initialDemos)
  }, [initialDemos])

  // Status Tabs
  const tabs = ['All', 'PENDING', 'RESCHEDULED', 'NO_SHOW']
  const [activeTab, setActiveTab] = useState('All')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredDemos = demos.filter(item => {
    if (activeTab !== 'All' && item.status !== activeTab) return false
    
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
  }).sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime()
    const timeB = new Date(b.createdAt).getTime()
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB
  })

  return (
    <div className="flex flex-col h-full">
      {/* Tabs Row */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 overflow-x-auto justify-between">
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
              {tab === 'All' ? 'All Demos' : DEMO_STATUSES.find(s => s.value === tab)?.label || tab}
            </button>
          ))}
        </div>
        <div className="relative flex items-center shrink-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-3" />
          <input 
            type="text" 
            placeholder="Search demos..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-1.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 transition-all focus:w-64"
          />
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
      <div className="flex-1 overflow-auto table-container rounded-none border-0 shadow-none">
        <table>
          <thead>
            <tr>
              <th className="w-8">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th>Lead Name</th>
              <th>Company</th>
              <th>Type</th>
              <th>Scheduled Time</th>
              <th>Conducted By</th>
              <th>Status</th>
              <th>Notes / Result</th>
              <th>Follow-up</th>
            </tr>
          </thead>
          <tbody>
            {filteredDemos.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-gray-500">
                  No demos found for this filter.
                </td>
              </tr>
            ) : filteredDemos.map(demo => {
              const status = DEMO_STATUSES.find(s => s.value === demo.status)
              const type = LEAD_TYPES.find(t => t.value === demo.type)
              
              const isPastDue = demo.status === 'PENDING' && new Date(demo.scheduledAt) < new Date()

              return (
                <tr 
                  key={demo.id} 
                  className={`${isPastDue ? 'bg-red-50/30' : ''} cursor-pointer hover:bg-gray-50/50 transition-colors`}
                  onClick={() => {
                    setEditingDemo(demo)
                    setIsSlideOverOpen(true)
                  }}
                >
                  <td onClick={e => e.stopPropagation()}>
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td>
                    <div className="font-medium text-indigo-600 hover:underline">
                      {demo.lead?.name || '—'}
                    </div>
                  </td>
                  <td>{demo.lead?.company || '—'}</td>
                  <td>
                    {type && <Badge color={type.color}>{type.label}</Badge>}
                  </td>
                  <td>
                    <div className={`font-medium ${isPastDue ? 'text-rose-600' : 'text-gray-900'}`}>
                      {formatDateTime(demo.scheduledAt)}
                    </div>
                    {demo.duration && <div className="text-xs text-gray-500">{demo.duration} min</div>}
                  </td>
                  <td>{demo.conductedBy || '—'}</td>
                  <td>
                    {status && <Badge color={status.color}>{status.label}</Badge>}
                  </td>
                  <td>
                    <div className="max-w-[200px] overflow-hidden">
                      {demo.result && <div className="text-sm font-medium text-gray-900 truncate" title={demo.result}>{demo.result}</div>}
                      {demo.notes ? (
                        <div className="text-xs text-gray-500 truncate" title={demo.notes}>{demo.notes}</div>
                      ) : (
                        !demo.result && <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {demo.followUpDate ? formatDate(demo.followUpDate) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Slide Over Form */}
      <SlideOver
        title="Edit Demo Details"
        isOpen={isSlideOverOpen}
        onClose={() => {
          setIsSlideOverOpen(false)
          setEditingDemo(null)
        }}
      >
        {editingDemo && (
          <DemoForm 
            initialData={editingDemo} 
            onSuccess={() => {
              setIsSlideOverOpen(false)
              setEditingDemo(null)
            }}
            onCancel={() => {
              setIsSlideOverOpen(false)
              setEditingDemo(null)
            }}
          />
        )}
      </SlideOver>
    </div>
  )
}
