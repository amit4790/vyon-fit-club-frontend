import { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Users } from 'lucide-react'
import { AuthService } from '../services/auth'
import vyonLogo from '../assets/images/logo/vyon-logo.jpg'

interface GymTabletShellProps {
  title: string
  subtitle?: string
  backTo?: string
  children: ReactNode
}

export default function GymTabletShell({ title, subtitle, backTo, children }: GymTabletShellProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    AuthService.logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border-light bg-bg-secondary/95 backdrop-blur-md">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/gym/members" className="flex items-center gap-2 shrink-0">
              <img src={vyonLogo} alt="VYON" className="h-10 w-10 rounded object-contain" />
              <span className="font-semibold text-text-secondary hidden sm:inline">Gym tablet</span>
            </Link>
            {backTo ? (
              <button
                type="button"
                onClick={() => navigate(backTo)}
                className="text-sm text-primary hover:underline truncate"
              >
                ← Back
              </button>
            ) : null}
          </div>
          <nav className="flex items-center gap-2">
            <Link
              to="/gym/members"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border-light text-sm min-h-[44px]"
            >
              <Users size={16} />
              Members
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-text-secondary text-sm min-h-[44px]"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </nav>
        </div>
        <div className="px-4 sm:px-6 pb-3">
          <h1 className="text-xl sm:text-2xl font-semibold text-text-secondary">{title}</h1>
          {subtitle ? <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p> : null}
        </div>
      </header>
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 min-w-0">{children}</main>
    </div>
  )
}
