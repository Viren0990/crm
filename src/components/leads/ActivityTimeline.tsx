'use client'

import { useState, useTransition } from 'react'
import { formatDateTime } from '@/lib/utils'
import { MessageSquare, FileText, Phone, Clock, Play, CheckCircle2, User, Send, Loader2 } from 'lucide-react'
import { addActivityNoteAction } from '@/app/actions/leadActions'

const getIconForType = (type: string) => {
  switch (type) {
    case 'NOTE': return <FileText className="w-4 h-4 text-blue-500" />
    case 'WHATSAPP': return <MessageSquare className="w-4 h-4 text-green-500" />
    case 'CALL': return <Phone className="w-4 h-4 text-rose-500" />
    case 'STATUS_CHANGE': return <Clock className="w-4 h-4 text-amber-500" />
    case 'DEMO_SCHEDULED': return <Play className="w-4 h-4 text-indigo-500" />
    case 'DEMO_RESULT': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
    case 'FOLLOW_UP': return <Phone className="w-4 h-4 text-violet-500" />
    default: return <User className="w-4 h-4 text-gray-500" />
  }
}

export function ActivityTimeline({ leadId, activities }: { leadId: string, activities: any[] }) {
  const [note, setNote] = useState('')
  const [isPending, startTransition] = useTransition()
  
  // Create an optimistic activities list that we prepend to
  const [optimisticActivities, setOptimisticActivities] = useState<any[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!note.trim() || isPending) return

    const currentNote = note.trim()
    setNote('') // Optimistically clear input

    // Add optimistic entry
    const optimisticEntry = {
      id: `temp-${Date.now()}`,
      type: 'NOTE',
      title: 'Custom Note',
      description: currentNote,
      performedBy: 'You',
      createdAt: new Date().toISOString()
    }
    
    setOptimisticActivities(prev => [optimisticEntry, ...prev])

    startTransition(async () => {
      await addActivityNoteAction(leadId, currentNote)
    })
  }

  const allActivities = [...optimisticActivities, ...(activities || [])]

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <div className="p-4 border-b border-gray-100 bg-white">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Activity History</h3>
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a custom note..."
            className="w-full text-sm rounded-xl border border-gray-200 p-3 pr-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none bg-gray-50 focus:bg-white transition-colors"
            rows={2}
          />
          <button 
            type="submit"
            disabled={!note.trim() || isPending}
            className="absolute bottom-3 right-3 text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {allActivities.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            No activity recorded yet.
          </div>
        ) : (
          <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
            {allActivities.map((act) => (
              <div key={act.id} className="relative pl-6">
                <div className="absolute -left-[9px] top-1 bg-white p-1 rounded-full border border-gray-100">
                  {getIconForType(act.type)}
                </div>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">{act.title}</span>
                    <span className="text-xs text-gray-400 shrink-0">{formatDateTime(act.createdAt)}</span>
                  </div>
                  {act.description && (
                    <div className="text-sm text-gray-600 bg-white p-3 rounded-xl border border-gray-100 mt-1.5 shadow-sm whitespace-pre-wrap">
                      {act.description}
                    </div>
                  )}
                  {act.performedBy && act.type !== 'CREATED' && (
                    <div className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                      <User className="w-3 h-3" /> {act.performedBy}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
