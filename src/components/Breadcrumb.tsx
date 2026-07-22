/**
 * Breadcrumb Component
 * Navigation breadcrumb trail
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-2">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight size={16} className="text-text-secondary" />}
          {item.href ? (
            <Link to={item.href} className="caption text-primary hover:text-accent transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="caption text-text-secondary">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
