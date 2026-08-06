'use client'

import { useState, useRef, useTransition } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { importLeadsAction } from '@/app/actions/leadActions'

function mapRowsToLeads(rows: any[]) {
  return rows.map((row: any) => ({
    name: row.name || row['full name'] || row['first name'] || 'Unknown Lead',
    email: row.email || row['email address'] || '',
    phone: row.phone || row['phone number'] || row.mobile || '',
    company: row.company || row.organization || '',
    city: row.city || row.location || '',
    address: row.address || '',
    type: row.type || 'B2C',
    source: row.source || 'CSV Import',
    staff: row.staff || row.assigned || '',
    priority: row.priority || 'WARM',
    notes: row.notes || row.comments || '',
    date: row.date || row['created date'] || row['created at'] || '',
  }))
}

export function CsvImporter({ onSuccess }: { onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const isCSV = selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')
    const isExcel = selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls') || selectedFile.type.includes('spreadsheet')

    if (!isCSV && !isExcel) {
      setError('Please upload a .csv or .xlsx file.')
      return
    }

    setFile(selectedFile)
    setError(null)

    if (isCSV) {
      // Parse CSV with PapaParse
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase(),
        complete: (results) => {
          if (results.errors.length > 0) {
            setError('Error parsing CSV. Please check the format.')
            return
          }
          setParsedData(mapRowsToLeads(results.data))
        }
      })
    } else {
      // Parse XLSX with SheetJS
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' })

          // Normalize headers to lowercase
          const normalizedData = jsonData.map((row: any) => {
            const newRow: any = {}
            for (const key of Object.keys(row)) {
              newRow[key.trim().toLowerCase()] = row[key]
            }
            return newRow
          })

          setParsedData(mapRowsToLeads(normalizedData))
        } catch {
          setError('Error reading Excel file. Please check the format.')
        }
      }
      reader.readAsArrayBuffer(selectedFile)
    }
  }

  const handleImport = () => {
    if (parsedData.length === 0) return

    startTransition(async () => {
      const result = await importLeadsAction(parsedData)
      if (result.success) {
        onSuccess()
      } else {
        setError(result.error || 'Failed to import leads.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {!file ? (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            accept=".csv,.xlsx,.xls" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload CSV or Excel File</h3>
          <p className="text-sm text-gray-500 max-w-sm mb-6">
            Drag and drop your spreadsheet here or click to browse. We accept both <strong>.csv</strong> and <strong>.xlsx</strong> files and will automatically match columns like Name, Email, and Phone.
          </p>
          <button className="px-6 py-2.5 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Browse Files
          </button>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{file.name}</h3>
                <p className="text-sm text-gray-500">{parsedData.length} leads detected ready for import</p>
              </div>
            </div>
            <button 
              onClick={() => { setFile(null); setParsedData([]); setError(null); }}
              className="text-sm text-indigo-600 font-medium hover:underline"
            >
              Change file
            </button>
          </div>

          {error ? (
            <div className="flex items-start gap-3 p-4 bg-rose-50 text-rose-700 rounded-xl mb-6">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Preview (First 3 rows)
              </div>
              <div className="divide-y divide-gray-100">
                {parsedData.slice(0, 3).map((row, i) => (
                  <div key={i} className="px-4 py-3 text-sm flex items-center gap-4">
                    <div className="w-1/3 font-medium text-gray-900 truncate">{row.name}</div>
                    <div className="w-1/3 text-gray-500 truncate">{row.email || '—'}</div>
                    <div className="w-1/3 text-gray-500 truncate">{row.phone || '—'}</div>
                  </div>
                ))}
                {parsedData.length > 3 && (
                  <div className="px-4 py-3 text-sm text-gray-400 text-center bg-gray-50/50">
                    + {parsedData.length - 3} more leads
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button 
              onClick={() => { setFile(null); setParsedData([]); setError(null); }}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleImport}
              disabled={isPending || parsedData.length === 0 || !!error}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              {isPending ? 'Importing...' : `Import ${parsedData.length} Leads`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
