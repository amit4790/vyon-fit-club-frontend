/**
 * Toast Notification Component
 * Display temporary notifications
 */

import React, { useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastProps extends Toast {
  onClose: (id: string) => void
}

export const ToastItem: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 3000,
  onClose,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration)
    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const icons = {
    success: <CheckCircle size={20} className="text-success" />,
    error: <AlertCircle size={20} className="text-danger" />,
    info: <Info size={20} className="text-primary" />,
    warning: <AlertCircle size={20} className="text-warning" />,
  }

  const bgColors = {
    success: 'bg-success bg-opacity-10 border-success border-opacity-30',
    error: 'bg-danger bg-opacity-10 border-danger border-opacity-30',
    info: 'bg-primary bg-opacity-10 border-primary border-opacity-30',
    warning: 'bg-warning bg-opacity-10 border-warning border-opacity-30',
  }

  return (
    <div
      className={`card flex items-start gap-3 animate-slide-up min-w-sm ${bgColors[type]}`}
    >
      {icons[type]}
      <div className="flex-1">
        <h4 className="caption">{title}</h4>
        {message && <p className="body text-sm mt-1">{message}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        className="text-text-secondary hover:text-text-primary transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onClose: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-4 right-4 z-40 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  )
}

/**
 * Hook for managing toasts
 */
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string, duration?: number) => {
      const id = Math.random().toString(36).substr(2, 9)
      setToasts((prev) => [...prev, { id, type, title, message, duration }])
      return id
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return {
    toasts,
    addToast,
    removeToast,
    success: (title: string, message?: string) => addToast('success', title, message),
    error: (title: string, message?: string) => addToast('error', title, message),
    info: (title: string, message?: string) => addToast('info', title, message),
    warning: (title: string, message?: string) => addToast('warning', title, message),
  }
}
