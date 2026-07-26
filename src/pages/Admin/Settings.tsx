import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthService } from '../../api/api'
import { ApiErrorHandler } from '../../api/errors'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import { ToastContainer, useToast } from '../../components/Toast'
import { USER_ROLES } from '../../auth/roles'
import AdminShell from '../../layouts/AdminShell'
import { adminService } from '../../services/adminService'

export default function AdminSettings() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isChecking, setIsChecking] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [apiStatus, setApiStatus] = useState<'unknown' | 'ok' | 'error'>('unknown')
  const [notificationStatus, setNotificationStatus] = useState<string>('No check yet')
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
  }, [navigate])

  const checkApiHealth = async () => {
    try {
      setIsChecking(true)
      await adminService.getPlanCatalog()
      setApiStatus('ok')
      success('API check passed', 'Backend admin endpoints are reachable.')
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      setApiStatus('error')
      errorToast('API check failed', apiError.message)
    } finally {
      setIsChecking(false)
    }
  }

  const sendNotificationProbe = async () => {
    try {
      setIsSending(true)
      const invoiceResponse = await adminService.getInvoices({ page: 1, pageSize: 1 })
      if (invoiceResponse.data.length === 0) {
        setNotificationStatus('No invoices found to test notifications.')
        return
      }

      const latestInvoice = invoiceResponse.data[0]
      const resendResponse = await adminService.resendInvoice(latestInvoice.id)
      const sentCount = resendResponse.notifications.filter((item) => item.status === 'sent').length
      const skippedCount = resendResponse.notifications.filter((item) => item.status === 'skipped').length

      setNotificationStatus(
        `Probe completed: ${sentCount} sent${skippedCount > 0 ? `, ${skippedCount} skipped` : ''}.`
      )
      success('Notification probe complete', `Invoice #${latestInvoice.id} resend triggered.`)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      setNotificationStatus(`Probe failed: ${apiError.message}`)
      errorToast('Notification probe failed', apiError.message)
    } finally {
      setIsSending(false)
    }
  }

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
  const isSuperAdmin = userInfo?.role === USER_ROLES.SUPER_ADMIN
  const openAdminTab = searchParams.get('tab') === 'admins'

  return (
    <AdminShell
      title="Settings"
      subtitle="Operational checks and integration controls"
      userName={userName}
      onLogout={handleLogout}
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {isSuperAdmin && (
          <Card className="p-5 xl:col-span-2">
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
        )}

        {!isSuperAdmin && openAdminTab && (
          <Card className="p-5 xl:col-span-2">
            <p className="text-sm text-text-secondary">Only super admins can add admin users.</p>
          </Card>
        )}

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-text-secondary">Backend Connectivity</h2>
          <p className="text-sm text-text-secondary mt-1">
            Validate admin API reachability from current environment.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <Button size="sm" onClick={checkApiHealth} isLoading={isChecking}>
              Run API Check
            </Button>
            <span className="text-sm text-text-secondary">
              Status: {apiStatus === 'unknown' ? 'Unknown' : apiStatus === 'ok' ? 'Healthy' : 'Issue detected'}
            </span>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-text-secondary">Notification Probe</h2>
          <p className="text-sm text-text-secondary mt-1">
            Trigger a resend on the latest invoice to verify dummy email and SMS flow.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <Button size="sm" onClick={sendNotificationProbe} isLoading={isSending}>
              Send Probe
            </Button>
            <span className="text-sm text-text-secondary">{notificationStatus}</span>
          </div>
        </Card>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </AdminShell>
  )
}
