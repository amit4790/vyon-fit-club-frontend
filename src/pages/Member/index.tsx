/**
 * Member Dashboard Page
 * Personal fitness tracking and membership information
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DashboardService, MemberDashboardResponse, AuthService } from '../../api/api'
import { ApiErrorHandler } from '../../api/errors'
import { Card } from '../../components/Card'
import { MemberPageHeader } from '../../components/member/MemberPageHeader'

export default function Member() {
  const [dashboard, setDashboard] = useState<MemberDashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

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
      <MemberPageHeader />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
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

        <Card className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">My body assessments</h2>
              <p className="text-sm text-gray-600 mt-1">
                View measurements and goals from your in-club assessments (read-only).
              </p>
            </div>
            <Link
              to="/member/body-assessments"
              className="inline-flex justify-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90"
            >
              Open assessments
            </Link>
          </div>
        </Card>

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

