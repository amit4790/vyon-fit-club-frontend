import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '../../api/api'
import { ApiErrorHandler } from '../../api/errors'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import AdminShell from '../../layouts/AdminShell'
import { adminService } from '../../services/adminService'
import { AdminProfileRecord } from '../../types'
import { toTitleCase } from '../../utils/format'

function formatDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatRole(role: string): string {
  return toTitleCase(role.replace(/_/g, ' '))
}

export default function AdminProfile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<AdminProfileRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.canAccessAdmin()) {
      navigate('/login')
      return
    }

    const loadProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await adminService.getProfile()
        setProfile(data)
      } catch (err: any) {
        const apiError = ApiErrorHandler.parse(err)
        setError(apiError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [navigate])

  const handleLogout = () => {
    AuthService.logout()
    navigate('/')
  }

  const userName = AuthService.getUserInfo()?.name || 'Admin'

  return (
    <AdminShell
      title="Profile"
      subtitle="Account information"
      userName={userName}
      onLogout={handleLogout}
    >
      <Card className="p-5">
        {isLoading ? (
          <p className="text-text-secondary">Loading profile...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : profile ? (
          <div className="space-y-4 cursor-default">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-text-secondary">Full Name</p>
                <p className="text-text-primary font-semibold mt-1">{toTitleCase(profile.full_name)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-text-secondary">Email</p>
                <p className="text-text-primary font-semibold mt-1">{profile.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-text-secondary">Phone Number</p>
                <p className="text-text-primary font-semibold mt-1">{profile.phone_number || 'Not available'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-text-secondary">Role</p>
                <p className="text-text-primary font-semibold mt-1">{formatRole(profile.role)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-text-secondary">Account Status</p>
                <div className="mt-1">
                  <Badge variant={profile.is_active ? 'active' : 'expired'}>
                    {profile.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-text-secondary">Joined Date</p>
                <p className="text-text-primary font-semibold mt-1">{formatDate(profile.joined_date)}</p>
              </div>
            </div>

            <div className="pt-2">
              <Button size="sm" onClick={() => navigate('/admin/change-password')}>
                Change Password
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-text-secondary">Profile not found.</p>
        )}
      </Card>
    </AdminShell>
  )
}
