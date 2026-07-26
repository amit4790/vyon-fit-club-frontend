import { ReactNode, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, CalendarCheck2, ChevronDown, CreditCard, FileBarChart2, LogOut, Settings, User, UserCog, Users, WalletCards } from 'lucide-react'
import { USER_ROLES } from '../auth/roles'
import { AuthService } from '../services/auth'

interface AdminShellProps {
  title: string
  subtitle: string
  userName: string
  onLogout: () => void
  children: ReactNode
}

interface NavItem {
  label: string
  path: string
  icon: ReactNode
  comingSoon?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <BarChart3 size={18} /> },
  { label: 'Members', path: '/admin/members', icon: <Users size={18} /> },
  { label: 'Trainers', path: '/admin/trainers', icon: <UserCog size={18} /> },
  { label: 'Membership Plans', path: '/admin/membership-plans', icon: <WalletCards size={18} /> },
  { label: 'Payments', path: '/admin/payments', icon: <CreditCard size={18} /> },
  { label: 'Attendance', path: '/admin/attendance', icon: <CalendarCheck2 size={18} /> },
  { label: 'Reports', path: '/admin/reports', icon: <FileBarChart2 size={18} /> },
  { label: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> },
]

export default function AdminShell({ title, subtitle, userName, onLogout, children }: AdminShellProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const isSuperAdmin = AuthService.getUserRole() === USER_ROLES.SUPER_ADMIN

  const navItems: NavItem[] = isSuperAdmin
    ? [
        ...NAV_ITEMS.slice(0, 7),
        { label: 'Admins', path: '/admin/settings?tab=admins', icon: <User size={18} /> },
        ...NAV_ITEMS.slice(7),
      ]
    : NAV_ITEMS

  const isActive = (path: string) => location.pathname === path.split('?')[0]

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex">
      <aside className="w-64 bg-gradient-to-b from-bg-secondary to-bg-card text-text-primary border-r border-border-light flex flex-col">
        <button
          onClick={() => navigate('/')}
          className="h-20 px-5 flex items-center gap-3 border-b border-border-light hover:bg-white/5 transition-colors"
        >
          <img src="/src/assets/images/logo/vyon-logo.jpg" alt="VYON FIT CLUB" className="h-12 w-12 object-contain rounded" />
          <div className="text-left">
            <p className="font-bold text-lg leading-tight tracking-tight">VYON</p>
            <p className="text-text-secondary text-xs">Premium Fitness Club</p>
          </div>
        </button>

        <nav className="px-3 py-4 space-y-1.5 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.path)

            if (item.comingSoon) {
              return (
                <div key={item.path} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-text-secondary bg-bg-secondary/60 border border-border-light">
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-border-light text-text-secondary">Coming Soon</span>
                </div>
              )
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  active ? 'bg-primary text-text-secondary shadow' : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-border-light">
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark rounded-lg transition-colors text-sm font-medium">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="bg-bg-secondary/90 backdrop-blur-md border-b border-border-light sticky top-0 z-20">
          <div className="px-6 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-[1.75rem] font-semibold text-text-secondary leading-tight">{title}</h1>
              <p className="text-text-secondary mt-1 text-sm">{subtitle}</p>
            </div>
            <div className="hidden sm:block relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                aria-haspopup="menu"
                aria-expanded={isProfileMenuOpen}
              >
                <User size={16} />
                <span>{userName}</span>
                <ChevronDown size={16} />
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border-light bg-bg-card p-1 shadow-lg" role="menu">
                  <button type="button" onClick={() => navigate('/admin/profile')} className="w-full rounded-md px-3 py-2 text-left text-sm text-text-secondary hover:bg-bg-secondary hover:text-text-primary" role="menuitem">
                    Profile
                  </button>
                  <button type="button" onClick={() => navigate('/admin/change-password')} className="w-full rounded-md px-3 py-2 text-left text-sm text-text-secondary hover:bg-bg-secondary hover:text-text-primary" role="menuitem">
                    Change Password
                  </button>
                  <button type="button" onClick={onLogout} className="w-full rounded-md px-3 py-2 text-left text-sm text-text-secondary hover:bg-bg-secondary hover:text-text-primary" role="menuitem">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="px-6 lg:px-8 py-6">{children}</main>
      </div>
    </div>
  )
}
