'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { SlideOver } from '@/components/ui/SlideOver'
import { OnboardingForm } from '@/components/onboarding/OnboardingForm'
import { ONBOARDING_STATUSES, LEAD_TYPES } from '@/lib/constants'
import { formatCurrency, calculateOnboardingProgress } from '@/lib/utils'
import { CheckCircle2, Loader2, ArrowDownAZ, ArrowUpAZ, Search } from 'lucide-react'
import { toggleOnboardingChecklistAction } from '@/app/actions/onboardingActions'

export function OnboardingTable({ initialOnboardings }: { initialOnboardings: any[] }) {
  const [onboardings, setOnboardings] = useState(initialOnboardings)
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false)
  const [editingOnboarding, setEditingOnboarding] = useState<any>(null)
  const [loadingToggle, setLoadingToggle] = useState<string | null>(null)

  useEffect(() => {
    setOnboardings(initialOnboardings)
  }, [initialOnboardings])

  // Status Tabs
  const tabs = ['All', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD']
  const [activeTab, setActiveTab] = useState('All')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredOnboardings = onboardings.filter(item => {
    if (activeTab !== 'All' && item.status !== activeTab) return false
    
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      const lead = item.demo?.lead
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

  async function handleToggle(id: string, field: string, currentValue: boolean) {
    setLoadingToggle(`${id}-${field}`)
    const result = await toggleOnboardingChecklistAction(id, field, currentValue)
    
    if (result.success) {
      // Optimistically update the UI to feel instant
      setOnboardings(prev => prev.map(item => {
        if (item.id === id) {
          return { ...item, [field]: !currentValue }
        }
        return item
      }))
    }
    setLoadingToggle(null)
  }

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
              {tab === 'All' ? 'All Onboardings' : ONBOARDING_STATUSES.find(s => s.value === tab)?.label || tab}
            </button>
          ))}
        </div>
        <div className="relative flex items-center shrink-0">
          <Search className="w-4 h-4 text-gray-400 absolute left-3" />
          <input 
            type="text" 
            placeholder="Search onboarding..." 
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
              <th>Lead Name</th>
              <th>Company</th>
              <th className="text-center">Reg Email</th>
              <th className="text-center">Enrollment</th>
              <th className="text-center">Payment</th>
              <th>Amount</th>
              <th className="text-center">Onb. Email</th>
              <th className="text-center">Onb. Call</th>
              <th className="text-center">Docs</th>
              <th>Progress</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOnboardings.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-12 text-gray-500">
                  No onboarding records found.
                </td>
              </tr>
            ) : filteredOnboardings.map(item => {
              const status = ONBOARDING_STATUSES.find(s => s.value === item.status)
              const lead = item.demo?.lead
              
              const progress = calculateOnboardingProgress(item)

              return (
                <tr 
                  key={item.id}
                  className="cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => {
                    setEditingOnboarding(item)
                    setIsSlideOverOpen(true)
                  }}
                >
                  <td onClick={e => e.stopPropagation()}>
                    <div className="font-medium text-indigo-600 hover:underline">
                      {lead?.name || '—'}
                    </div>
                  </td>
                  <td onClick={e => e.stopPropagation()}>{lead?.company || '—'}</td>
                  
                  {/* Checkboxes for checklist */}
                  <td className="text-center" onClick={e => e.stopPropagation()}>
                    <button 
                      disabled={loadingToggle === `${item.id}-registrationEmail`}
                      onClick={() => handleToggle(item.id, 'registrationEmail', item.registrationEmail)}
                      className={`toggle-switch ${item.registrationEmail ? 'active' : ''} ${loadingToggle === `${item.id}-registrationEmail` ? 'opacity-50' : ''}`} 
                    />
                  </td>
                  <td className="text-center" onClick={e => e.stopPropagation()}>
                    <button 
                      disabled={loadingToggle === `${item.id}-registeredEnrollment`}
                      onClick={() => handleToggle(item.id, 'registeredEnrollment', item.registeredEnrollment)}
                      className={`toggle-switch ${item.registeredEnrollment ? 'active' : ''} ${loadingToggle === `${item.id}-registeredEnrollment` ? 'opacity-50' : ''}`} 
                    />
                  </td>
                  <td className="text-center" onClick={e => e.stopPropagation()}>
                    <button 
                      disabled={loadingToggle === `${item.id}-paymentReceived`}
                      onClick={() => handleToggle(item.id, 'paymentReceived', item.paymentReceived)}
                      className={`toggle-switch ${item.paymentReceived ? 'active' : ''} ${loadingToggle === `${item.id}-paymentReceived` ? 'opacity-50' : ''}`} 
                    />
                  </td>
                  <td onClick={e => e.stopPropagation()}>{item.paymentAmount ? formatCurrency(item.paymentAmount) : '—'}</td>
                  
                  <td className="text-center" onClick={e => e.stopPropagation()}>
                    <button 
                      disabled={loadingToggle === `${item.id}-onboardingEmail`}
                      onClick={() => handleToggle(item.id, 'onboardingEmail', item.onboardingEmail)}
                      className={`toggle-switch ${item.onboardingEmail ? 'active' : ''} ${loadingToggle === `${item.id}-onboardingEmail` ? 'opacity-50' : ''}`} 
                    />
                  </td>
                  <td className="text-center" onClick={e => e.stopPropagation()}>
                    <button 
                      disabled={loadingToggle === `${item.id}-onboardingCall`}
                      onClick={() => handleToggle(item.id, 'onboardingCall', item.onboardingCall)}
                      className={`toggle-switch ${item.onboardingCall ? 'active' : ''} ${loadingToggle === `${item.id}-onboardingCall` ? 'opacity-50' : ''}`} 
                    />
                  </td>
                  <td className="text-center" onClick={e => e.stopPropagation()}>
                    <button 
                      disabled={loadingToggle === `${item.id}-documentsCollected`}
                      onClick={() => handleToggle(item.id, 'documentsCollected', item.documentsCollected)}
                      className={`toggle-switch ${item.documentsCollected ? 'active' : ''} ${loadingToggle === `${item.id}-documentsCollected` ? 'opacity-50' : ''}`} 
                    />
                  </td>
                  
                  {/* Progress Bar */}
                  <td className="w-48">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 progress-bar">
                        <div 
                          className="progress-bar-fill" 
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-500 min-w-[2.5rem]">
                        {progress.completed}/{progress.total}
                      </span>
                      {progress.percentage === 100 && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                  </td>

                  <td>
                    {status && <Badge color={status.color}>{status.label}</Badge>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Slide Over Form */}
      <SlideOver
        title="Edit Onboarding Details"
        isOpen={isSlideOverOpen}
        onClose={() => {
          setIsSlideOverOpen(false)
          setEditingOnboarding(null)
        }}
      >
        {editingOnboarding && (
          <OnboardingForm 
            initialData={editingOnboarding} 
            onSuccess={() => {
              setIsSlideOverOpen(false)
              setEditingOnboarding(null)
            }}
            onCancel={() => {
              setIsSlideOverOpen(false)
              setEditingOnboarding(null)
            }}
          />
        )}
      </SlideOver>
    </div>
  )
}
