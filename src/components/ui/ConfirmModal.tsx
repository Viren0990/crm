'use client'

import { X } from 'lucide-react'
import { Button } from './Button'

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isPending = false,
  hideCancel = false
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  isPending?: boolean
  hideCancel?: boolean
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={() => !isPending && onClose()}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 overflow-hidden animate-fade-in mx-4">
        <button 
          onClick={() => !isPending && onClose()}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{description}</p>
        
        <div className="flex items-center justify-end gap-3">
          {!hideCancel && (
            <Button variant="ghost" type="button" onClick={onClose} disabled={isPending}>
              {cancelText}
            </Button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center ${
              isDestructive 
                ? 'bg-rose-600 text-white hover:bg-rose-700' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isPending ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
