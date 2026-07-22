/**
 * Empty State Component
 * Display when no data is available
 */

import React from 'react'
import { InboxIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <InboxIcon size={48} className="text-accent" />,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="mb-4">{icon}</div>
      <h3 className="card-title mb-2">{title}</h3>
      {description && <p className="body text-center mb-6 max-w-sm">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}
