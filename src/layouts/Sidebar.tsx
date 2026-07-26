/**
 * Sidebar Component
 * Collapsible left sidebar for dashboard layouts
 */

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

export interface SidebarItem {
  icon: React.ReactNode
  label: string
  href: string
  isActive?: boolean
}

interface SidebarProps {
  items: SidebarItem[]
  logo?: React.ReactNode
  appName?: string
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  logo,
  appName = 'VYON FIT CLUB',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-bg-secondary border-r border-border-light transition-all duration-300 ease-out z-40 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border-light">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              {logo && <div className="text-primary text-xl">{logo}</div>}
              <span className="font-bold text-text-primary text-sm truncate">
                {appName}
              </span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-bg-card rounded-lg transition-colors"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              title={isCollapsed ? item.label : ''}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                item.isActive
                  ? 'bg-primary text-text-secondary'
                  : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Spacer */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`} />
    </>
  )
}

