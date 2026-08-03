'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { LEAD_TYPES, LEAD_PRIORITIES, LEAD_SOURCES, LEAD_STAFF, LEAD_STATUSES } from '@/lib/constants'
import { createLeadAction, updateLeadAction, deleteLeadAction } from '@/app/actions/leadActions'
import { ActivityTimeline } from '@/components/leads/ActivityTimeline'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

export function LeadForm({ 
  initialData,
  onSuccess, 
  onCancel 
}: { 
  initialData?: any,
  onSuccess: () => void, 
  onCancel: () => void 
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState(initialData?.status || 'NEW')
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const [isCustomStaff, setIsCustomStaff] = useState(() => {
    if (!initialData?.staff) return false;
    // @ts-ignore
    return !LEAD_STAFF.includes(initialData.staff);
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    setIsPending(true)
    setError(null)
    
    try {
      let result;
      if (initialData?.id) {
        result = await updateLeadAction(initialData.id, formData)
      } else {
        result = await createLeadAction(formData)
      }
      
      if (result.success) {
        formRef.current?.reset()
        onSuccess()
      } else {
        setError(result.error || 'Something went wrong')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsPending(false)
    }
  }

  async function handleDelete() {
    if (!initialData?.id) return;
    setIsPending(true);
    setError(null);
    try {
      const result = await deleteLeadAction(initialData.id);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Failed to delete lead');
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setShowDeleteConfirm(false);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {initialData && (
        <div className="flex items-center gap-6 mb-6 border-b border-gray-100">
          <button 
            type="button" 
            onClick={() => setActiveTab('details')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Lead Details
          </button>
          <button 
            type="button" 
            onClick={() => setActiveTab('activity')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'activity' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Activity History
          </button>
        </div>
      )}

      {activeTab === 'details' ? (
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-sm">
              {error}
            </div>
          )}

      {/* Contact Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input type="text" id="name" name="name" defaultValue={initialData?.name} required className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" id="phone" name="phone" defaultValue={initialData?.phone} className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" id="email" name="email" defaultValue={initialData?.email} className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input type="text" id="company" name="company" defaultValue={initialData?.company} className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Address / City</label>
            <input type="text" id="city" name="city" defaultValue={initialData?.city} className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
          </div>
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea id="notes" name="notes" defaultValue={initialData?.notes} rows={5} className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-y min-h-[120px]"></textarea>
        </div>
      </div>

      {/* Classification */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Classification</h3>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white font-medium">
            {LEAD_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {status === 'DEMO_SCHEDULED' && (
          <div className="animate-fade-in p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <label htmlFor="demoTime" className="block text-sm font-medium text-indigo-900 mb-1">Demo Date & Time *</label>
            <input 
              type="datetime-local" 
              id="demoTime" 
              name="demoTime" 
              required 
              defaultValue={
                initialData?.demo?.scheduledAt 
                  ? (() => {
                      const date = new Date(initialData.demo.scheduledAt);
                      const pad = (n: number) => String(n).padStart(2, '0');
                      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
                    })()
                  : ''
              }
              className="w-full rounded-lg border border-indigo-200 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" 
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
            <select id="type" name="type" defaultValue={initialData?.type || 'N/A'} className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white">
              {LEAD_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select id="priority" name="priority" defaultValue={initialData?.priority || "WARM"} className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white">
              {LEAD_PRIORITIES.map(p => (
                <option key={p.value} value={p.value}>{p.emoji} {p.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select id="source" name="source" defaultValue={initialData?.source} className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white">
              <option value="">Select source...</option>
              {LEAD_SOURCES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="staff-select" className="block text-sm font-medium text-gray-700 mb-1">Assigned Staff</label>
            <select 
              id="staff-select" 
              name={isCustomStaff ? "_staff_ignore" : "staff"}
              defaultValue={isCustomStaff ? "Other" : (initialData?.staff || '')}
              onChange={(e) => setIsCustomStaff(e.target.value === 'Other')}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white font-medium"
            >
              <option value="">Unassigned</option>
              {LEAD_STAFF.map(staff => (
                <option key={staff} value={staff}>{staff}</option>
              ))}
              <option value="Other">Other (Type custom)</option>
            </select>
            
            {isCustomStaff && (
              <input 
                type="text"
                id="staff" 
                name="staff" 
                autoFocus
                defaultValue={initialData?.staff || ''} 
                placeholder="Type custom staff name..."
                className="w-full mt-2 rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white" 
              />
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 flex items-center justify-between border-t">
        {initialData ? (
          <Button type="button" variant="ghost" onClick={() => setShowDeleteConfirm(true)} disabled={isPending} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">Delete</Button>
        ) : <div />}
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>Cancel</Button>
          <Button type="submit" isLoading={isPending}>{initialData ? 'Save Changes' : 'Create Lead'}</Button>
        </div>
      </div>
    </form>
      ) : (
        <div className="flex-1 -mx-6 -mb-6 min-h-[400px]">
          <ActivityTimeline leadId={initialData.id} activities={initialData.activities} />
        </div>
      )}

      <ConfirmModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Lead"
        description="Are you sure you want to delete this lead? This action cannot be undone and will permanently remove all associated activity history and demos."
        confirmText="Delete permanently"
        isDestructive={true}
        isPending={isPending}
      />
    </div>
  )
}

