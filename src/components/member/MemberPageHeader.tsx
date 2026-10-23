import { Link, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { AuthService } from '../../services/auth'
import vyonLogo from '../../assets/images/logo/vyon-logo.jpg'

interface MemberPageHeaderProps {
  backTo?: string
  backLabel?: string
}

export function MemberPageHeader({ backTo, backLabel }: MemberPageHeaderProps) {
  const navigate = useNavigate()
  const userName = AuthService.getUserInfo()?.name || ''

  const handleLogout = () => {
    AuthService.logout()
    navigate('/login')
  }

  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between min-h-[4.5rem] sm:h-24 py-2">
          <Link to="/member" className="flex items-center gap-4 group hover:opacity-90 transition-opacity">
            <img
              src={vyonLogo}
              alt="VYON FIT CLUB"
              className="h-16 w-16 object-contain rounded"
            />
            <div className="hidden sm:flex flex-col">
              <span className="text-text-secondary font-bold text-2xl leading-tight tracking-tighter">VYON</span>
              <span className="text-gray-400 text-sm font-light">Member portal</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            {backTo ? (
              <Link to={backTo} className="text-sm text-gray-300 hover:text-white">
                {backLabel || 'Back'}
              </Link>
            ) : null}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-text-secondary text-sm font-medium">Welcome, {userName}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-text-secondary rounded-lg text-sm"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
