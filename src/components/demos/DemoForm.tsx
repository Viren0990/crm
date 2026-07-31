'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { DEMO_STATUSES, DEMO_STAFF } from '@/lib/constants'
import { updateDemoAction } from '@/app/actions/demoActions'

export function DemoForm({ 
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
    if (!initialData?.conductedBy || initialData?.conductedBy === 'TBD') return false;
    // @ts-ignore
    return !DEMO_STAFF.includes(initialData.conductedBy);
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    setIsPending(true)
    setError(null)
    
    try {
      const result = await updateDemoAction(initialData.id, formData)
      
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
        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Demo details for {initialData.lead?.name || 'Lead'}</h3>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select id="status" name="status" defaultValue={initialData.status} className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white font-medium">
            {DEMO_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="conductedBy-select" className="block text-sm font-medium text-gray-700 mb-1">Conducted By</label>
          <select 
            id="conductedBy-select" 
            name={isCustomStaff ? "_conductedBy_ignore" : "conductedBy"}
            defaultValue={isCustomStaff ? "Other" : (initialData?.conductedBy || 'TBD')}
            onChange={(e) => setIsCustomStaff(e.target.value === 'Other')}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white font-medium"
          >
            <option value="TBD">TBD</option>
            {DEMO_STAFF.map(staff => (
              <option key={staff} value={staff}>{staff}</option>
            ))}
            <option value="Other">Other (Type custom)</option>
          </select>

          {isCustomStaff && (
            <input 
              type="text"
              id="conductedBy" 
              name="conductedBy" 
              autoFocus
              defaultValue={initialData?.conductedBy === 'TBD' ? '' : initialData?.conductedBy} 
              placeholder="Type custom staff name..."
              className="w-full mt-2 rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white" 
            />
          )}
        </div>
        
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
          <input type="number" id="duration" name="duration" defaultValue={initialData?.duration} className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
        </div>

        <div>
          <label htmlFor="result" className="block text-sm font-medium text-gray-700 mb-1">Result (e.g. Next Steps)</label>
          <input type="text" id="result" name="result" defaultValue={initialData?.result} className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (How it went)</label>
          <textarea id="notes" name="notes" defaultValue={initialData?.notes} rows={4} className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"></textarea>
        </div>
      </div>

      <div className="pt-4 flex items-center justify-end gap-3 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isPending}>Save Changes</Button>
      </div>
    </form>
  )
}
