import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { isGymStaff } from '../auth/authorization'
import { EnquiryModal } from '../components/EnquiryModal'
import { AuthService } from '../services/auth'
import type { EnquiryIntent } from '../services/publicService'

export interface EnquiryModalOptions {
  intent: EnquiryIntent
  planInterest?: string
  title?: string
  subtitle?: string
}

interface EnquiryModalContextValue {
  openEnquiry: (options: EnquiryModalOptions) => void
}

const EnquiryModalContext = createContext<EnquiryModalContextValue | null>(null)

export const EnquiryModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<EnquiryModalOptions>({
    intent: 'membership',
  })

  const openEnquiry = useCallback((next: EnquiryModalOptions) => {
    if (isGymStaff(AuthService.getUserRole())) {
      return
    }
    setOptions(next)
    setIsOpen(true)
  }, [])

  const value = useMemo(() => ({ openEnquiry }), [openEnquiry])

  return (
    <EnquiryModalContext.Provider value={value}>
      {children}
      <EnquiryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        intent={options.intent}
        planInterest={options.planInterest}
        title={options.title}
        subtitle={options.subtitle}
      />
    </EnquiryModalContext.Provider>
  )
}

export function useEnquiryModal(): EnquiryModalContextValue {
  const ctx = useContext(EnquiryModalContext)
  if (!ctx) {
    throw new Error('useEnquiryModal must be used within EnquiryModalProvider')
  }
  return ctx
}
