'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ONBOARDING_STATUSES, LEAD_STAFF } from '@/lib/constants'
import { updateOnboardingAction } from '@/app/actions/onboardingActions'

export function OnboardingForm({ 
  initialData,
  onSuccess, 
  onCancel 
}: { 
  initialData: any,
  onSuccess: () => void, 
  onCancel: () => void 
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isCustomStaff, setIsCustomStaff] = useState(() => {
    if (!initialData?.assignedTo) return false;
    // @ts-ignore
    return !LEAD_STAFF.includes(initialData.assignedTo);
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    setIsPending(true)
    setError(null)
    
    try {
      const result = await updateOnboardingAction(initialData.id, formData)
      
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

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Onboarding Details for {initialData.demo?.lead?.name || 'Lead'}</h3>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select id="status" name="status" defaultValue={initialData.status} className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white font-medium">
            {ONBOARDING_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="assignedTo-select" className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
          <select 
            id="assignedTo-select" 
            name={isCustomStaff ? "_assignedTo_ignore" : "assignedTo"}
            defaultValue={isCustomStaff ? "Other" : (initialData?.assignedTo || '')}
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
              id="assignedTo" 
              name="assignedTo" 
              autoFocus
              defaultValue={initialData?.assignedTo || ''} 
              placeholder="Type custom staff name..."
              className="w-full mt-2 rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white font-medium" 
            />
          )}
        </div>
        
        <div>
          <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-1">Payment Amount (₹)</label>
          <input type="number" id="paymentAmount" name="paymentAmount" defaultValue={initialData?.paymentAmount} placeholder="e.g. 5000" className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Onboarding Notes</label>
          <textarea id="notes" name="notes" defaultValue={initialData?.notes} rows={5} placeholder="Details about the onboarding process..." className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"></textarea>
        </div>
      </div>

      <div className="pt-4 flex items-center justify-end gap-3 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isPending}>Save Changes</Button>
      </div>
    </form>
  )
}
