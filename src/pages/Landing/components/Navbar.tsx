/**
 * Landing Page Navbar
 * Sticky transparent navbar with premium branding
 * Logo increased by 10% with refined spacing
 */

import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { AuthService } from '../../../api/api'

export const LandingNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = AuthService.isAuthenticated()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (target: string) => {
    setIsMobileMenuOpen(false)
    if (target.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate(`/${target}`)
        return
      }
      const element = document.getElementById(target.slice(1))
      element?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate(target)
    }
  }

  const getAuthenticatedHomePath = () => {
    const role = AuthService.getUserRole()
    if (role === 'admin') return '/admin/dashboard'
    if (role === 'trainer') return '/trainer/dashboard'
    if (role === 'member') return '/member/dashboard'
    return '/login'
  }

  const handleAccountClick = () => {
    setIsMobileMenuOpen(false)
    if (isAuthenticated) {
      navigate(getAuthenticatedHomePath())
      return
    }
    navigate('/login')
  }

  const handleLogoutClick = () => {
    setIsMobileMenuOpen(false)
    AuthService.logout()
    navigate('/')
  }

  const accountLabel = isAuthenticated ? 'My Dashboard' : 'Login'

  const menuItems = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Memberships', href: '/memberships' },
    { label: 'Trainers', href: '#trainers' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Contact', href: '#contact' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-bg-secondary bg-opacity-95 backdrop-blur-lg border-b border-border-light shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Refined navbar height and padding */}
        <div className="flex items-center justify-between h-20">
          {/* Premium Logo - increased by 10% with refined spacing */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <img
              src="/src/assets/images/logo/vyon-logo.jpg"
              alt="VYON FIT CLUB"
              className="h-11 w-11 object-contain rounded transition-transform duration-300 group-hover:scale-110"
            />
            <span className="text-text-primary font-bold text-lg hidden sm:inline group-hover:text-primary transition-colors duration-200 tracking-tight">
              VYON
            </span>
          </Link>

          {/* Desktop Menu - refined spacing */}
          <div className="hidden md:flex items-center gap-12 flex-1 ml-12">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className="text-sm text-text-secondary hover:text-primary transition-colors duration-200 font-medium tracking-wide cursor-pointer bg-none border-none"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop Buttons - premium styling */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            <button
              onClick={handleAccountClick}
              className={`px-6 py-2 rounded transition-all duration-300 font-semibold text-sm uppercase tracking-wide ${
                isAuthenticated
                  ? 'bg-primary hover:bg-accent text-text-secondary shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                  : 'border-2 border-text-secondary text-text-secondary hover:border-primary hover:text-primary'
              }`}
            >
              {accountLabel}
            </button>
            {isAuthenticated ? (
              <button
                onClick={handleLogoutClick}
                className="px-6 py-2 bg-primary hover:bg-accent text-text-secondary rounded transition-all duration-300 font-semibold text-sm uppercase tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-2 bg-primary hover:bg-accent text-text-secondary rounded transition-all duration-300 font-semibold text-sm uppercase tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Join Now
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-bg-card rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu - premium styling */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-bg-secondary border-t border-border-light animate-slide-up">
            <div className="px-4 py-6 space-y-4">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.href)}
                  className="block w-full text-left text-sm text-text-secondary hover:text-primary py-3 transition-colors font-medium tracking-wide bg-none border-none cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
              <div className="flex gap-3 pt-6 border-t border-border-light">
                <button
                  onClick={handleAccountClick}
                  className={`flex-1 px-4 py-3 rounded transition-all duration-300 font-semibold text-sm uppercase tracking-wide text-center ${
                    isAuthenticated
                      ? 'bg-primary hover:bg-accent text-text-secondary'
                      : 'border-2 border-text-secondary text-text-secondary hover:border-primary hover:text-primary'
                  }`}
                >
                  {accountLabel}
                </button>
                {isAuthenticated ? (
                  <button
                    onClick={handleLogoutClick}
                    className="flex-1 px-4 py-3 bg-primary hover:bg-accent text-text-secondary rounded transition-all duration-300 font-semibold text-sm uppercase tracking-wide"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      navigate('/register')
                    }}
                    className="flex-1 px-4 py-3 bg-primary hover:bg-accent text-text-secondary rounded transition-all duration-300 font-semibold text-sm uppercase tracking-wide"
                  >
                    Join Now
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

