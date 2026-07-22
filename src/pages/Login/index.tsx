/**
 * Login Page
 * User authentication with backend integration
 * Matches Landing Page design system
 */

import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthService, LoginRequest } from '../../api/api'
import { ApiErrorHandler } from '../../api/errors'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'

interface ToastState {
  show: boolean
  message: string
  type: 'success' | 'error'
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'error',
  })

  const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 5000)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!email || !password) {
      showToast('Please enter email and password')
      return
    }

    if (!email.includes('@')) {
      showToast('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      const credentials: LoginRequest = {
        email,
        password,
      }

      const response = await AuthService.login(credentials)

      showToast('Login successful!', 'success')

      // Redirect based on user role
      const role = response.user.role
      setTimeout(() => {
        if (role === 'admin') {
          navigate('/admin')
        } else if (role === 'trainer') {
          navigate('/trainer')
        } else if (role === 'member') {
          navigate('/member')
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <img
                src="/src/assets/images/logo/vyon-logo.jpg"
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
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
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
              <p className="text-sm text-text-secondary">
                Access your VYON Fit Club account
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-text-primary font-medium text-sm mb-1.5">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <p className="mt-1 text-xs text-text-secondary">
                  Demo: admin@vyon.com, trainer@vyon.com, member@vyon.com
                </p>
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
                <p className="mt-1 text-xs text-text-secondary">
                  Demo password: password123
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo Credentials Box */}
            <div className="mt-8 pt-6 border-t border-border-light">
              <p className="text-xs font-semibold text-text-primary mb-3 uppercase tracking-wide">
                Demo Credentials:
              </p>
              <div className="space-y-2 text-xs text-text-secondary">
                <div className="flex justify-between">
                  <span><strong>Admin:</strong></span>
                  <span className="font-mono">admin@vyon.com</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>Trainer:</strong></span>
                  <span className="font-mono">trainer@vyon.com</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>Member:</strong></span>
                  <span className="font-mono">member@vyon.com</span>
                </div>
                <div className="flex justify-between">
                  <span><strong>Password:</strong></span>
                  <span className="font-mono">password123</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Text */}
          <div className="text-center mt-8 text-xs text-text-secondary">
            <p>Backend: http://localhost:8000</p>
            <Link to="/" className="text-primary hover:text-accent transition-colors mt-2 inline-block">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
