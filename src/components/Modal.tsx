/**
 * Modal Component
 * Reusable modal dialog
 */

import React from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-50 animate-fade-in print:static print:overflow-visible print:bg-transparent">
      <div className="min-h-full flex items-start justify-center p-4 sm:py-8 print:min-h-0 print:p-0">
        <div className={`${sizes[size]} w-full animate-slide-up print:max-w-none print:animate-none`}>
          <div className="bg-bg-card border border-border-light rounded-lg shadow-elevated flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden print:max-h-none print:rounded-none print:border-0 print:bg-transparent print:shadow-none sm:max-h-[calc(100vh-4rem)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-light p-6 print:hidden">
            <h2 className="card-title">{title}</h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6 print:overflow-visible print:p-0">{children}</div>

          {/* Footer */}
          {footer && <div className="border-t border-border-light p-6 print:hidden">{footer}</div>}
        </div>
      </div>
      </div>
    </div>
  )
}

interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  isDangerous?: boolean
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isDangerous = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <p className="body mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 btn btn-secondary"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`flex-1 btn ${isDangerous ? 'btn-danger' : 'btn-primary'}`}
        >
          {isDangerous ? 'Delete' : 'Confirm'}
        </button>
      </div>
    </Modal>
  )
}
