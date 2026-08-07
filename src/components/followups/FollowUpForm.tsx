'use client'

import { useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { updateFollowUpAction } from '@/app/actions/demoActions'
import { formatForDateTimeLocal } from '@/lib/utils'
import { createOnboardingAction } from '@/app/actions/onboardingActions'
import { useRouter } from 'next/navigation'

export function FollowUpForm({ 
  initialData,
  onSuccess, 
  onCancel 
}: { 
  initialData: any,
  onSuccess: () => void, 
  onCancel: () => void 
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [isOnboardingPending, setIsOnboardingPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    setIsPending(true)
    setError(null)
    
    try {
      const result = await updateFollowUpAction(initialData.id, formData)
      
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

  async function handleStartOnboarding() {
    setIsOnboardingPending(true)
    setError(null)
    try {
      const result = await createOnboardingAction(initialData.id)
      if (result.success) {
        onSuccess()
        router.push('/onboarding')
      } else {
        setError(result.error || 'Failed to create onboarding')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsOnboardingPending(false)
    }
  }

  // Format existing date for datetime-local input
  const defaultDate = formatForDateTimeLocal(initialData.followUpDate)

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Follow Up for {initialData.lead?.name || 'Lead'}</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Next Follow-up Date & Time</label>
          <div className="flex gap-2">
            <input 
              type="date" 
              id="followUpDate" 
              name="followUpDate" 
              defaultValue={initialData.followUpDate ? new Date(initialData.followUpDate).toISOString().slice(0, 10) : ''}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" 
            />
            <input 
              type="text" 
              name="followUpTimeValue" 
              placeholder="12:30"
              defaultValue={initialData.followUpTime?.split(' ')[0] || ''}
              className="w-24 rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" 
            />
            <select 
              name="followUpTimeAmPm"
              defaultValue={initialData.followUpTime?.split(' ')[1] || 'PM'}
              className="rounded-xl border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
        
        <div>
          <label htmlFor="followUpNotes" className="block text-sm font-medium text-gray-700 mb-1">Follow-up Notes</label>
          <textarea id="followUpNotes" name="followUpNotes" defaultValue={initialData?.followUpNotes} rows={5} placeholder="Details about the follow up conversation..." className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"></textarea>
        </div>

        <div>
          <label htmlFor="followUpResult" className="block text-sm font-medium text-gray-700 mb-1">Final Result / Outcome</label>
          <input type="text" id="followUpResult" name="followUpResult" defaultValue={initialData?.followUpResult} placeholder="e.g. Needs more time, Ready to buy" className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
        </div>
      </div>

      <div className="pt-4 flex items-center justify-between gap-3 border-t">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={handleStartOnboarding}
          isLoading={isOnboardingPending}
          disabled={isPending}
        >
          🚀 Start Onboarding
        </Button>
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending || isOnboardingPending}>Cancel</Button>
          <Button type="submit" isLoading={isPending} disabled={isOnboardingPending}>Save Follow Up</Button>
        </div>
      </div>
    </form>
  )
}
