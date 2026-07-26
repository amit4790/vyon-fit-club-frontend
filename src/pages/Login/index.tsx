/**
 * Login Page
 * User authentication with backend integration
 * Matches Landing Page design system
 */

import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthService, LoginRequest } from '../../api/api'
import { ApiErrorHandler } from '../../api/errors'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { USER_ROLES } from '../../auth/roles'
import vyonLogo from '../../assets/images/logo/vyon-logo.jpg'

interface ToastState {
  show: boolean
  message: string
  type: 'success' | 'error'
}

export default function Login() {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'error',
  })

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      return
    }

    const role = AuthService.getUserRole()
    if (role === USER_ROLES.SUPER_ADMIN || role === USER_ROLES.ADMIN) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [navigate])

  const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 5000)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!identifier || !password) {
      showToast('Please enter email or phone number and password')
      return
    }

    setIsLoading(true)

    try {
      const credentials: LoginRequest = {
        identifier,
        password,
      }

      const response = await AuthService.login(credentials)

      showToast('Login successful!', 'success')

      const role = response.user.role
      setTimeout(() => {
        if (role === USER_ROLES.SUPER_ADMIN || role === USER_ROLES.ADMIN) {
          navigate('/admin')
        }
      }, 1000)
    } catch (error: any) {
      const apiError = ApiErrorHandler.parse(error)
      showToast(apiError.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Header with Logo */}
      <header className="border-b border-border-light">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <img
                src={vyonLogo}
                alt="VYON FIT CLUB"
                className="h-10 w-10 object-contain rounded transition-transform duration-300 group-hover:scale-110"
              />
              <span className="text-text-primary font-bold text-lg hidden sm:inline group-hover:text-primary transition-colors duration-200 tracking-tight">
                VYON
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-lg">
          {/* Toast Notification */}
          {toast.show && (
            <div
              className={`mb-6 p-4 rounded-lg border text-sm ${
                toast.type === 'success'
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {toast.message}
            </div>
          )}

          {/* Login Card */}
          <div className="bg-bg-card rounded-xl border border-border-light p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-text-primary mb-1">
                Sign In
              </h1>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Identifier Input */}
              <div>
                <label htmlFor="identifier" className="block text-text-primary font-medium text-sm mb-1.5">
                  Email or Phone Number
                </label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Enter your email or phone number"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-text-primary font-medium text-sm mb-1.5">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="md"
                disabled={isLoading}
                className="w-full mt-6"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <button type="button" className="mt-6 text-sm text-primary hover:text-accent transition-colors">
              Forgot Password?
            </button>
          </div>

        </div>
      </main>
    </div>
  )
}
