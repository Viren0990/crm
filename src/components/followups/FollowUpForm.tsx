'use client'

import { useRef, useState } from 'react'
import { toIndiaDateInput, timeTextToInput } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { updateFollowUpAction } from '@/app/actions/followUpActions'
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
      const result = await createOnboardingAction(initialData.leadId)
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

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Follow-Up {initialData.attemptNumber} for {initialData.lead?.name || 'Lead'}</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
          <div className="flex gap-2">
            <input 
              type="date" 
              id="scheduledDate" 
              name="scheduledDate" 
              defaultValue={toIndiaDateInput(initialData.scheduledDate)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" 
            />
            <input 
              type="time" 
              name="scheduledTime" 
              defaultValue={timeTextToInput(initialData.scheduledTime)}
              className="w-36 rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" 
            />
          </div>
          <p className="text-xs text-gray-500 mt-1.5">India time (IST)</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select name="status" defaultValue={initialData.status} className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white">
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="NO_ANSWER">No Answer</option>
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Follow-up Notes</label>
          <textarea id="notes" name="notes" defaultValue={initialData?.notes} rows={4} placeholder="Details about the follow up conversation..." className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"></textarea>
        </div>

        <div>
          <label htmlFor="result" className="block text-sm font-medium text-gray-700 mb-1">Result / Outcome</label>
          <input type="text" id="result" name="result" defaultValue={initialData?.result} placeholder="e.g. Needs more time, Ready to buy" className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
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
