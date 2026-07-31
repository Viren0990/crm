'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import { SlideOver } from '@/components/ui/SlideOver'
import { LeadForm } from '@/components/leads/LeadForm'

export function AddLeadButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Add Lead
      </Button>

      <SlideOver 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        title="Add New Lead"
        description="Create a new lead manually. Fields marked with * are required."
      >
        <LeadForm 
          onSuccess={() => setIsOpen(false)} 
          onCancel={() => setIsOpen(false)} 
        />
      </SlideOver>
    </>
  )
}
