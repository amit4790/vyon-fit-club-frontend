/**
 * Dashboard Layout
 * Layout for dashboard pages with sidebar and navbar
 */

import React from 'react'
import { Sidebar, SidebarItem } from './Sidebar'
import { Navbar } from './Navbar'

interface DashboardLayoutProps {
  children: React.ReactNode
  sidebarItems?: SidebarItem[]
  logo?: React.ReactNode
  appName?: string
  onSearch?: (value: string) => void
  userInitials?: string
  userName?: string
  onLogout?: () => void
  onSettings?: () => void
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sidebarItems = [],
  logo,
  appName = 'VYON FIT CLUB',
  onSearch,
  userInitials,
  userName,
  onLogout,
  onSettings,
}) => {
  return (
    <div className="flex h-screen bg-bg-primary">
      {/* Sidebar */}
      <Sidebar items={sidebarItems} logo={logo} appName={appName} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar
          onSearch={onSearch}
          userInitials={userInitials}
          userName={userName}
          onLogout={onLogout}
          onSettings={onSettings}
        />

        {/* Content */}
        <main className="flex-1 overflow-auto mt-16">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
