/**
 * Navbar Component
 * Top navigation bar for dashboard layouts
 */

import React from 'react'
import { Search, Bell, Settings, LogOut } from 'lucide-react'
import { Avatar } from '../components/Avatar'

interface NavbarProps {
  onSearch?: (value: string) => void
  notifications?: number
  userInitials?: string
  userName?: string
  onLogout?: () => void
  onSettings?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  onSearch,
  notifications = 0,
  userInitials = '',
  userName = '',
  onLogout,
  onSettings,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [showProfileMenu, setShowProfileMenu] = React.useState(false)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    onSearch?.(e.target.value)
  }

  return (
    <div className="fixed top-0 right-0 left-20 bg-bg-secondary border-b border-border-light h-16 z-30">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
            <input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full bg-bg-card border border-border-light rounded-lg pl-10 pr-4 py-2 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-bg-card rounded-lg transition-colors">
            <Bell size={20} className="text-text-secondary hover:text-text-primary" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 bg-danger rounded-full w-5 h-5 flex items-center justify-center text-xs text-text-secondary font-bold">
                {notifications}
              </span>
            )}
          </button>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-bg-card rounded-lg transition-colors"
            >
              <Avatar initials={userInitials} size="sm" />
              <span className="text-text-primary hidden sm:block">{userName}</span>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-bg-card border border-border-light rounded-lg shadow-elevated overflow-hidden z-50">
                <div className="p-4 border-b border-border-light">
                  <p className="caption text-text-secondary">Signed in as</p>
                  <p className="text-text-primary font-medium">{userName}</p>
                </div>

                <button
                  onClick={() => {
                    onSettings?.()
                    setShowProfileMenu(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors"
                >
                  <Settings size={16} />
                  Settings
                </button>

                <button
                  onClick={() => {
                    onLogout?.()
                    setShowProfileMenu(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-danger hover:bg-danger hover:bg-opacity-10 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

