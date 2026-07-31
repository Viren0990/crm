'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { UploadCloud } from 'lucide-react'
import { SlideOver } from '@/components/ui/SlideOver'
import { CsvImporter } from '@/components/leads/CsvImporter'

export function ImportCsvButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        <UploadCloud className="w-4 h-4 mr-2" />
        Import CSV
      </Button>

      <SlideOver 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        title="Import Leads via CSV"
        description="Upload a CSV file to bulk import leads. We will automatically map the columns to the correct fields."
      >
        <CsvImporter onSuccess={() => setIsOpen(false)} />
      </SlideOver>
    </>
  )
}
