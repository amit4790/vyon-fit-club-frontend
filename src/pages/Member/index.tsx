/**
 * Member Dashboard Page
 * Personal fitness tracking and membership information
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { DashboardService, MemberDashboardResponse, AuthService } from '../../api/api'
import { ApiErrorHandler } from '../../api/errors'
import { Card } from '../../components/Card'
import vyonLogo from '../../assets/images/logo/vyon-logo.jpg'

export default function Member() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState<MemberDashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication
    if (!AuthService.isAuthenticated() || !AuthService.hasRole('member')) {
      navigate('/login')
      return
    }

    loadDashboard()
  }, [navigate])

  const loadDashboard = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await DashboardService.getMemberDashboard()
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
  const userName = userInfo?.name || ''

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
              className="px-4 py-2 bg-primary text-text-secondary rounded-lg hover:bg-accent"
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
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-24">
            {/* Left Side - Logo and Branding */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-4 group cursor-pointer hover:opacity-90 transition-opacity"
            >
              <img
                src={vyonLogo}
                alt="VYON FIT CLUB"
                className="h-16 w-16 object-contain rounded transition-transform duration-300 group-hover:scale-110"
              />
              <div className="hidden sm:flex flex-col">
                <span className="text-text-secondary font-bold text-2xl leading-tight tracking-tighter">
                  VYON
                </span>
                <span className="text-gray-400 text-sm font-light">Premium Fitness Club</span>
              </div>
            </button>

            {/* Right Side - User Info and Logout */}
            <div className="flex items-center gap-6">
              {/* Welcome Message */}
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-text-secondary text-sm font-medium">
                  Welcome, {userName}
                </span>
                <span className="text-gray-400 text-xs">Member</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-text-secondary rounded-lg transition-all duration-300 font-medium text-sm"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6">
        {/* Welcome Section - Compact */}
        <div className="pt-8 pb-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {userName}
          </h1>
          <p className="text-lg text-gray-600">
            Here's what's happening at VYON Fit Club today.
          </p>
        </div>

        {/* Membership Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Membership Plan Card */}
          <Card>
            <div className="flex flex-col">
              <span className="text-gray-600 text-sm font-medium">Membership Plan</span>
              <span className="text-2xl font-bold text-primary mt-2">
                {dashboard.membership_plan}
              </span>
            </div>
          </Card>

          {/* Remaining Days Card */}
          <Card>
            <div className="flex flex-col">
              <span className="text-gray-600 text-sm font-medium">Days Remaining</span>
              <span className="text-2xl font-bold text-blue-600 mt-2">
                {dashboard.remaining_days}
              </span>
              <p className="text-gray-500 text-xs mt-2">
                Expires: {dashboard.expiry_date}
              </p>
            </div>
          </Card>

          {/* Assigned Trainer Card */}
          <Card>
            <div className="flex flex-col">
              <span className="text-gray-600 text-sm font-medium">Assigned Trainer</span>
              <span className="text-lg font-semibold text-gray-900 mt-2">
                {dashboard.assigned_trainer || 'Not Assigned'}
              </span>
            </div>
          </Card>

          {/* Attendance Count Card */}
          <Card>
            <div className="flex flex-col">
              <span className="text-gray-600 text-sm font-medium">Total Visits</span>
              <span className="text-4xl font-bold text-green-600 mt-2">
                {dashboard.attendance_count}
              </span>
            </div>
          </Card>
        </div>

        {/* Recent Visits */}
        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Visits</h2>
          </div>

          {dashboard.recent_visits.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Workout Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recent_visits.map((visit, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{visit.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{visit.workout_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{visit.duration} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent visits</p>
          )}
        </Card>
      </div>
    </div>
  )
}

