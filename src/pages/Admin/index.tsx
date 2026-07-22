/**
 * Admin Dashboard Page
 * System overview and statistics
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { DashboardService, AdminDashboardResponse, AuthService } from '../../api/api'
import { ApiErrorHandler } from '../../api/errors'
import { Card } from '../../components/Card'

export default function Admin() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication
    if (!AuthService.isAuthenticated() || !AuthService.hasRole('admin')) {
      navigate('/login')
      return
    }

    loadDashboard()
  }, [navigate])

  const loadDashboard = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await DashboardService.getAdminDashboard()
      setDashboard(data)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      setError(apiError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    AuthService.logout()
    navigate('/login')
  }

  const userInfo = AuthService.getUserInfo()
  const userName = userInfo?.name || 'John Doe'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadDashboard}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent"
            >
              Try Again
            </button>
          </div>
        </Card>
      </div>
    )
  }

  if (!dashboard) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Header with Logo and Branding */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            {/* Left Side - Logo and Branding */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-4 group cursor-pointer hover:opacity-90 transition-opacity"
            >
              <img
                src="/src/assets/images/logo/vyon-logo.jpg"
                alt="VYON FIT CLUB"
                className="h-16 w-16 object-contain rounded transition-transform duration-300 group-hover:scale-110"
              />
              <div className="hidden sm:flex flex-col">
                <span className="text-white font-bold text-2xl leading-tight tracking-tighter">
                  VYON
                </span>
                <span className="text-gray-400 text-sm font-light">Premium Fitness Club</span>
              </div>
            </button>

            {/* Right Side - User Info and Logout */}
            <div className="flex items-center gap-6">
              {/* Welcome Message */}
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-white text-sm font-medium">
                  Welcome, {userName}
                </span>
                <span className="text-gray-400 text-xs">Administrator</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 font-medium text-sm"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section - Compact */}
        <div className="pt-8 pb-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {userName} 👋
          </h1>
          <p className="text-lg text-gray-600">
            Here's what's happening at VYON Fit Club today.
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Members Card */}
          <Card>
            <div className="flex flex-col">
              <span className="text-gray-600 text-sm font-medium">Total Members</span>
              <span className="text-4xl font-bold text-primary mt-2">
                {dashboard.total_members}
              </span>
              <p className="text-gray-500 text-xs mt-2">
                Active: {dashboard.active_members}
              </p>
            </div>
          </Card>

          {/* Monthly Revenue Card */}
          <Card>
            <div className="flex flex-col">
              <span className="text-gray-600 text-sm font-medium">Monthly Revenue</span>
              <span className="text-4xl font-bold text-green-600 mt-2">
                ${dashboard.monthly_revenue.toFixed(2)}
              </span>
            </div>
          </Card>

          {/* Expiring Memberships Card */}
          <Card>
            <div className="flex flex-col">
              <span className="text-gray-600 text-sm font-medium">Expiring This Month</span>
              <span className="text-4xl font-bold text-yellow-600 mt-2">
                {dashboard.expiring_memberships}
              </span>
            </div>
          </Card>

          {/* Today's Check-ins Card */}
          <Card>
            <div className="flex flex-col">
              <span className="text-gray-600 text-sm font-medium">Today's Check-ins</span>
              <span className="text-4xl font-bold text-blue-600 mt-2">
                {dashboard.todays_checkins}
              </span>
            </div>
          </Card>
        </div>

        {/* Recent Registrations */}
        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Registrations</h2>
          </div>

          {dashboard.recent_registrations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Registration Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recent_registrations.map((registration, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{registration.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{registration.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {registration.registration_date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent registrations</p>
          )}
        </Card>
      </div>
    </div>
  )
}
