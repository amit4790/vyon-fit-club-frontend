import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '../../api/api'
import { ApiErrorHandler } from '../../api/errors'
import { USER_ROLES } from '../../auth/roles'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import { ToastContainer, useToast } from '../../components/Toast'
import AdminShell from '../../layouts/AdminShell'
import { adminService } from '../../services/adminService'

export default function AdminUsers() {
  const navigate = useNavigate()
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false)
  const [adminForm, setAdminForm] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    password: '',
  })
  const { toasts, removeToast, success, error: errorToast } = useToast()

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.canAccessAdmin()) {
      navigate('/login')
      return
    }

    if (AuthService.getUserRole() !== USER_ROLES.SUPER_ADMIN) {
      navigate('/admin/dashboard')
    }
  }, [navigate])

  const handleLogout = () => {
    AuthService.logout()
    navigate('/')
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !adminForm.full_name.trim()
      || !adminForm.email.trim()
      || !adminForm.phone_number.trim()
      || !adminForm.password.trim()
    ) {
      errorToast('Missing details', 'Please fill full name, email, phone number, and password.')
      return
    }

    try {
      setIsCreatingAdmin(true)
      const response = await adminService.createAdminUser({
        full_name: adminForm.full_name.trim(),
        email: adminForm.email.trim(),
        phone_number: adminForm.phone_number.trim(),
        password: adminForm.password,
        is_active: true,
      })

      success('Admin created', `${response.data.full_name} can now log in as ADMIN.`)
      setAdminForm({ full_name: '', email: '', phone_number: '', password: '' })
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      errorToast('Failed to create admin', apiError.message)
    } finally {
      setIsCreatingAdmin(false)
    }
  }

  const userInfo = AuthService.getUserInfo()
  const userName = userInfo?.name || 'Admin'

  return (
    <AdminShell
      title="Admins"
      subtitle="Create and manage admin access"
      userName={userName}
      onLogout={handleLogout}
    >
      <Card className="p-5">
        <h2 className="text-lg font-semibold text-text-secondary">Create Admin User</h2>
        <p className="text-sm text-text-secondary mt-1">
          Super admins can add new admin accounts with email, phone, and password.
        </p>

        <form onSubmit={handleCreateAdmin} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Full Name"
            value={adminForm.full_name}
            onChange={(event) => setAdminForm((prev) => ({ ...prev, full_name: event.target.value }))}
            placeholder="Enter full name"
            required
          />
          <Input
            label="Email"
            type="email"
            value={adminForm.email}
            onChange={(event) => setAdminForm((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="Enter email"
            required
          />
          <Input
            label="Phone Number"
            value={adminForm.phone_number}
            onChange={(event) => setAdminForm((prev) => ({ ...prev, phone_number: event.target.value }))}
            placeholder="Enter phone number"
            required
          />
          <Input
            label="Password"
            type="password"
            value={adminForm.password}
            onChange={(event) => setAdminForm((prev) => ({ ...prev, password: event.target.value }))}
            placeholder="Set temporary password"
            required
          />

          <div className="md:col-span-2">
            <Button type="submit" size="sm" isLoading={isCreatingAdmin}>
              Create Admin
            </Button>
          </div>
        </form>
      </Card>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </AdminShell>
  )
}