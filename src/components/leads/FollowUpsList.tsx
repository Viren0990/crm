'use client'

import { useState, useRef, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { createFollowUpAction, updateFollowUpAction, deleteFollowUpAction } from '@/app/actions/followUpActions'
import { Plus, Clock, CheckCircle2, XCircle } from 'lucide-react'

import { ConfirmModal } from '@/components/ui/ConfirmModal'

export function FollowUpsList({ leadId, initialFollowUps = [] }: { leadId: string, initialFollowUps?: any[] }) {
  const [followUps, setFollowUps] = useState(initialFollowUps)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setFollowUps(initialFollowUps)
  }, [initialFollowUps])
  
  // Very simple view to list follow ups and add a new one.

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Follow-Ups</h3>
        <Button 
          type="button" 
          size="sm" 
          onClick={() => setIsAdding(true)}
          disabled={isAdding || editingId !== null}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Follow-Up
        </Button>
      </div>

      <div className="space-y-4">
        {followUps.length === 0 && !isAdding && (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
            No follow-ups recorded yet.
          </div>
        )}

        {isAdding && (
          <FollowUpInlineForm 
            leadId={leadId} 
            onCancel={() => setIsAdding(false)} 
            onSuccess={() => {
              setIsAdding(false)
              // Ideally refresh the data, or rely on router.refresh() 
              // which happens automatically in server actions
            }} 
          />
        )}

        {followUps.map(fu => (
          <div key={fu.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-3 relative group">
            {editingId === fu.id ? (
              <FollowUpInlineForm 
                leadId={leadId}
                initialData={fu}
                onCancel={() => setEditingId(null)}
                onSuccess={() => setEditingId(null)}
              />
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">Follow-Up {fu.attemptNumber}</span>
                    <Badge color={
                      fu.status === 'COMPLETED' ? 'emerald' : 
                      fu.status === 'NO_ANSWER' ? 'rose' : 'amber'
                    }>
                      {fu.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setEditingId(fu.id)}
                      className="text-xs text-indigo-600 font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Edit
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setDeletingId(fu.id)}
                      className="text-xs text-rose-600 font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {formatDate(fu.scheduledDate)} {fu.scheduledTime ? `at ${fu.scheduledTime}` : ''}
                </div>
                
                {fu.notes && (
                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="font-medium block mb-1">Notes:</span>
                    {fu.notes}
                  </div>
                )}
                
                {fu.result && (
                  <div className="text-sm text-gray-900 bg-emerald-50 text-emerald-900 p-3 rounded-lg border border-emerald-100">
                    <span className="font-medium block mb-1">Result:</span>
                    {fu.result}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={async () => {
          if (deletingId) {
            setIsDeleting(true)
            await deleteFollowUpAction(deletingId)
            setIsDeleting(false)
            setDeletingId(null)
          }
        }}
        title="Delete Follow-Up"
        description="Are you sure you want to delete this follow-up attempt? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        isPending={isDeleting}
      />
    </div>
  )
}

function FollowUpInlineForm({ leadId, initialData, onCancel, onSuccess }: { leadId: string, initialData?: any, onCancel: () => void, onSuccess: () => void }) {
  const [isPending, setIsPending] = useState(false)
  
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    const formData = new FormData(e.currentTarget)
    
    if (initialData?.id) {
      await updateFollowUpAction(initialData.id, formData)
    } else {
      await createFollowUpAction(leadId, formData)
    }
    
    setIsPending(false)
    onSuccess()
  }
  
  return (
    <form onSubmit={onSubmit} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
      <h4 className="font-medium text-sm text-gray-900 border-b pb-2">
        {initialData ? `Edit Follow-Up ${initialData.attemptNumber}` : 'New Follow-Up'}
      </h4>
      
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
          <input 
            type="date" 
            name="scheduledDate" 
            required
            defaultValue={initialData?.scheduledDate ? new Date(initialData.scheduledDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}
            className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500" 
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
          <div className="flex gap-1">
            <input 
              type="text" 
              name="scheduledTimeValue" 
              placeholder="12:30"
              defaultValue={initialData?.scheduledTime?.split(' ')[0] || ''}
              className="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500" 
            />
            <select 
              name="scheduledTimeAmPm"
              defaultValue={initialData?.scheduledTime?.split(' ')[1] || 'PM'}
              className="rounded-lg border border-gray-300 px-1 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
      </div>
      
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select name="status" defaultValue={initialData?.status || 'PENDING'} className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500 bg-white">
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="NO_ANSWER">No Answer</option>
          </select>
        </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
        <textarea 
          name="notes" 
          rows={2} 
          defaultValue={initialData?.notes}
          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500 resize-none" 
        ></textarea>
      </div>
      
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Result / Outcome</label>
          <input 
            type="text" 
            name="result" 
            defaultValue={initialData?.result || ''}
            placeholder="e.g. Ready to buy"
            className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500" 
          />
        </div>

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isPending}>Cancel</Button>
        <Button type="submit" size="sm" isLoading={isPending}>Save</Button>
      </div>
    </form>
  )
}
