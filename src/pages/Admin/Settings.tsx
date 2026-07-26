import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '../../api/api'
import { ApiErrorHandler } from '../../api/errors'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { ToastContainer, useToast } from '../../components/Toast'
import AdminShell from '../../layouts/AdminShell'
import { adminService } from '../../services/adminService'

export default function AdminSettings() {
  const navigate = useNavigate()
  const [isChecking, setIsChecking] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [apiStatus, setApiStatus] = useState<'unknown' | 'ok' | 'error'>('unknown')
  const [notificationStatus, setNotificationStatus] = useState<string>('No check yet')
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

  const userInfo = AuthService.getUserInfo()
  const userName = userInfo?.name || 'Admin'

  return (
    <AdminShell
      title="Settings"
      subtitle="Operational checks and integration controls"
      userName={userName}
      onLogout={handleLogout}
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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
