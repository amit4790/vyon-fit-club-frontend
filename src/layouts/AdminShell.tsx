import { ReactNode, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  CalendarCheck2,
  ChevronDown,
  CreditCard,
  FileBarChart2,
  Inbox,
  LogOut,
  Menu,
  Settings,
  User,
  UserCog,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import { USER_ROLES } from '../auth/roles'
import { AuthService } from '../services/auth'
import { adminService } from '../services/adminService'
import { toTitleCase } from '../utils/format'
import vyonLogo from '../assets/images/logo/vyon-logo.jpg'

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
  { label: 'Enquiries', path: '/admin/enquiries', icon: <Inbox size={18} /> },
  { label: 'Members', path: '/admin/members', icon: <Users size={18} /> },
  { label: 'Trainers', path: '/admin/trainers', icon: <UserCog size={18} /> },
  { label: 'Membership Plans', path: '/admin/membership-plans', icon: <WalletCards size={18} /> },
  { label: 'Payments', path: '/admin/payments', icon: <CreditCard size={18} /> },
  { label: 'Attendance', path: '/admin/attendance', icon: <CalendarCheck2 size={18} /> },
  { label: 'Reports', path: '/admin/reports', icon: <FileBarChart2 size={18} /> },
]

export default function AdminShell({ title, subtitle, userName, onLogout, children }: AdminShellProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)
  const isSuperAdmin = AuthService.getUserRole() === USER_ROLES.SUPER_ADMIN

  const [newEnquiryCount, setNewEnquiryCount] = useState(0)

  const navItems: NavItem[] = isSuperAdmin
    ? [
        ...NAV_ITEMS,
        { label: 'Admins', path: '/admin/admins', icon: <User size={18} /> },
        { label: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> },
      ]
    : NAV_ITEMS

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const displayUserName = toTitleCase(userName || 'Admin')

  useEffect(() => {
    setIsNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isNavOpen) {
      document.body.style.removeProperty('overflow')
      return
    }
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.removeProperty('overflow')
    }
  }, [isNavOpen])

  useEffect(() => {
    let cancelled = false

    const loadCount = () => {
      adminService
        .getWebsiteEnquiryCount()
        .then((response) => {
          if (!cancelled) {
            setNewEnquiryCount(response.new_count)
          }
        })
        .catch(() => {
          if (!cancelled) {
            setNewEnquiryCount(0)
          }
        })
    }

    loadCount()

    const handleEnquiriesChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ newCount?: number }>).detail
      if (typeof detail?.newCount === 'number') {
        setNewEnquiryCount(detail.newCount)
        return
      }
      loadCount()
    }

    window.addEventListener('vyon:enquiries-changed', handleEnquiriesChanged)
    return () => {
      cancelled = true
      window.removeEventListener('vyon:enquiries-changed', handleEnquiriesChanged)
    }
  }, [location.pathname])

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!profileMenuRef.current) {
        return
      }

      if (!profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleDocumentClick)
    return () => document.removeEventListener('mousedown', handleDocumentClick)
  }, [])

  const renderNavLink = (item: NavItem) => {
    const active = isActive(item.path)

    if (item.comingSoon) {
      return (
        <div
          key={item.path}
          className="flex items-center justify-between rounded-lg px-3 py-2.5 text-text-secondary bg-bg-secondary/60 border border-border-light"
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </div>
          <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-border-light text-text-secondary">
            Coming Soon
          </span>
        </div>
      )
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => setIsNavOpen(false)}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all min-h-[44px] ${
          active
            ? 'bg-primary text-text-secondary shadow'
            : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
        }`}
      >
        {item.icon}
        <span>{item.label}</span>
        {item.path === '/admin/enquiries' && newEnquiryCount > 0 ? (
          <span
            className={`ml-auto min-w-5 rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold ${
              active ? 'bg-white/20 text-text-secondary' : 'bg-primary text-text-secondary'
            }`}
          >
            {newEnquiryCount}
          </span>
        ) : null}
      </Link>
    )
  }

  const sidebar = (
    <>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="h-16 lg:h-20 px-4 lg:px-5 flex items-center gap-3 border-b border-border-light hover:bg-white/5 transition-colors w-full text-left"
      >
        <img src={vyonLogo} alt="VYON FIT CLUB" className="h-10 w-10 lg:h-12 lg:w-12 object-contain rounded" />
        <div>
          <p className="font-bold text-lg leading-tight tracking-tight">VYON</p>
          <p className="text-text-secondary text-xs">Premium Fitness Club</p>
        </div>
      </button>

      <nav className="px-3 py-4 space-y-1.5 flex-1 overflow-y-auto">{navItems.map(renderNavLink)}</nav>

      <div className="p-3 border-t border-border-light">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-primary hover:bg-primary-dark rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex">
      {isNavOpen ? (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsNavOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[min(100%,18rem)] bg-gradient-to-b from-bg-secondary to-bg-card text-text-primary border-r border-border-light flex flex-col transform transition-transform duration-200 ease-out lg:static lg:z-auto lg:translate-x-0 lg:w-64 ${
          isNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="lg:hidden flex items-center justify-end border-b border-border-light px-2 py-1">
          <button
            type="button"
            aria-label="Close menu"
            className="p-2.5 rounded-lg text-text-secondary hover:bg-bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setIsNavOpen(false)}
          >
            <X size={22} />
          </button>
        </div>
        {sidebar}
      </aside>

      <div className="flex-1 min-w-0 flex flex-col w-full">
        <header className="bg-bg-secondary/90 backdrop-blur-md border-b border-border-light sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <button
                type="button"
                aria-label="Open navigation menu"
                className="lg:hidden mt-0.5 p-2.5 rounded-lg border border-border-light text-text-secondary hover:bg-bg-card min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                onClick={() => setIsNavOpen(true)}
              >
                <Menu size={22} />
              </button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-[1.75rem] font-semibold text-text-secondary leading-tight truncate">
                  {title}
                </h1>
                <p className="text-text-secondary mt-0.5 sm:mt-1 text-xs sm:text-sm line-clamp-2">{subtitle}</p>
              </div>
            </div>

            <div className="relative shrink-0" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
                className="flex items-center gap-1.5 sm:gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors min-h-[44px] px-1 sm:px-0"
                aria-haspopup="menu"
                aria-expanded={isProfileMenuOpen}
              >
                <User size={18} className="shrink-0" />
                <span className="max-w-[6rem] sm:max-w-none truncate hidden sm:inline">{displayUserName}</span>
                <ChevronDown size={16} className="hidden sm:block" />
              </button>
              {isProfileMenuOpen && (
                <div
                  className="absolute right-0 mt-1 w-48 rounded-lg border border-border-light bg-bg-card p-1 shadow-lg z-50"
                  role="menu"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      navigate('/admin/profile')
                    }}
                    className="w-full rounded-md px-3 py-2.5 text-left text-sm text-text-secondary hover:bg-bg-secondary hover:text-text-primary min-h-[44px]"
                    role="menuitem"
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      onLogout()
                    }}
                    className="w-full rounded-md px-3 py-2.5 text-left text-sm text-text-secondary hover:bg-bg-secondary hover:text-text-primary min-h-[44px]"
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
