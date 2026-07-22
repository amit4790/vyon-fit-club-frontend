/**
 * Badge Component
 * Status badges with multiple variants
 */

import React from 'react'

interface BadgeProps {
  variant: 'active' | 'expired' | 'pending' | 'success'
  children: React.ReactNode
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, className = '' }) => {
  const variants = {
    active: 'bg-success bg-opacity-20 text-success',
    expired: 'bg-danger bg-opacity-20 text-danger',
    pending: 'bg-warning bg-opacity-20 text-warning',
    success: 'bg-success bg-opacity-20 text-success',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-label font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
