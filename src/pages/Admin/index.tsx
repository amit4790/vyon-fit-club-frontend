import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardService, AdminDashboardResponse, AuthService } from '../../api/api'
import { ApiErrorHandler } from '../../api/errors'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import AdminShell from '../../layouts/AdminShell'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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
    navigate('/')
  }

  const userInfo = AuthService.getUserInfo()
  const userName = userInfo?.name || 'Admin'

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
    <AdminShell
      title={`Welcome back, ${userName}`}
      subtitle="Here is your business overview for VYON Fit Club"
      userName={userName}
      onLogout={handleLogout}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <Card className="p-5">
          <div className="flex flex-col">
            <span className="text-text-secondary text-xs uppercase tracking-wide font-medium">Total Members</span>
            <span className="text-[2rem] font-semibold text-primary mt-2 leading-none">{dashboard.total_members}</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex flex-col">
            <span className="text-text-secondary text-xs uppercase tracking-wide font-medium">Active Members</span>
            <span className="text-[2rem] font-semibold text-success mt-2 leading-none">{dashboard.active_members}</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex flex-col">
            <span className="text-text-secondary text-xs uppercase tracking-wide font-medium">Inactive Members</span>
            <span className="text-[2rem] font-semibold text-accent mt-2 leading-none">{dashboard.inactive_members ?? 'N/A'}</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex flex-col">
            <span className="text-text-secondary text-xs uppercase tracking-wide font-medium">Today's Check-ins</span>
            <span className="text-[2rem] font-semibold text-accent mt-2 leading-none">{dashboard.todays_checkins ?? 'N/A'}</span>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Quick Actions</h2>
          <p className="text-sm text-text-secondary mt-1">Navigate quickly to common admin tasks.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button size="md" className="font-semibold" onClick={() => navigate('/admin/members?action=add')}>
            Add Member
          </Button>

          <Button size="md" variant="secondary" className="font-semibold" onClick={() => navigate('/admin/members')}>
            View Members
          </Button>

          <Button
            size="md"
            variant="secondary"
            className="font-semibold"
            onClick={() => navigate('/admin/members')}
          >
            Assign Membership
          </Button>

          <Button
            size="md"
            variant="secondary"
            className="font-semibold"
            onClick={() => navigate('/admin/payments')}
          >
            Record Payment
          </Button>
        </div>
      </Card>
    </AdminShell>
  )
}

