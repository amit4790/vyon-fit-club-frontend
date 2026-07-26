/**
 * Trainer Dashboard Page
 * Session management and member oversight
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { DashboardService, TrainerDashboardResponse, AuthService } from '../../api/api'
import { ApiErrorHandler } from '../../api/errors'
import { Card } from '../../components/Card'
import vyonLogo from '../../assets/images/logo/vyon-logo.jpg'

export default function Trainer() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState<TrainerDashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication
    if (!AuthService.isAuthenticated() || !AuthService.hasRole('trainer')) {
      navigate('/login')
      return
    }

    loadDashboard()
  }, [navigate])

  const loadDashboard = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await DashboardService.getTrainerDashboard()
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
                <span className="text-gray-400 text-xs">Trainer</span>
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

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Assigned Members Card */}
          <Card>
            <div className="flex flex-col">
              <span className="text-gray-600 text-sm font-medium">Assigned Members</span>
              <span className="text-4xl font-bold text-primary mt-2">
                {dashboard.assigned_members}
              </span>
            </div>
          </Card>

          {/* Today's Sessions Card */}
          <Card>
            <div className="flex flex-col">
              <span className="text-gray-600 text-sm font-medium">Today's Sessions</span>
              <span className="text-4xl font-bold text-blue-600 mt-2">
                {dashboard.todays_sessions}
              </span>
            </div>
          </Card>

          {/* Attendance Summary - Present */}
          <Card>
            <div className="flex flex-col">
              <span className="text-gray-600 text-sm font-medium">Present (Today)</span>
              <span className="text-4xl font-bold text-green-600 mt-2">
                {dashboard.attendance_summary.present || 0}
              </span>
            </div>
          </Card>

          {/* Attendance Summary - Completed This Month */}
          <Card>
            <div className="flex flex-col">
              <span className="text-gray-600 text-sm font-medium">Completed This Month</span>
              <span className="text-4xl font-bold text-purple-600 mt-2">
                {dashboard.attendance_summary.completed_this_month || 0}
              </span>
            </div>
          </Card>
        </div>

        {/* Upcoming Sessions */}
        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Today's Sessions</h2>
          </div>

          {dashboard.upcoming_sessions.length > 0 ? (
            <div className="space-y-4">
              {dashboard.upcoming_sessions.map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{session.member_name}</p>
                    <p className="text-sm text-gray-600">{session.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{session.duration} min</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No sessions scheduled for today</p>
          )}
        </Card>

        {/* Attendance Summary Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm font-medium mb-2">Present Today</p>
              <p className="text-3xl font-bold text-green-600">
                {dashboard.attendance_summary.present || 0}
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm font-medium mb-2">Absent</p>
              <p className="text-3xl font-bold text-red-600">
                {dashboard.attendance_summary.absent || 0}
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm font-medium mb-2">Cancelled</p>
              <p className="text-3xl font-bold text-yellow-600">
                {dashboard.attendance_summary.cancelled || 0}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

