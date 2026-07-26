import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '../../api/api'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import AdminShell from '../../layouts/AdminShell'
import { adminService } from '../../services/adminService'
import { ReportsSummaryRecord } from '../../types'
import { formatCurrency, formatNumber } from '../../utils/format'

export default function AdminReports() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState<ReportsSummaryRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.canAccessAdmin()) {
      navigate('/login')
      return
    }

    loadData(true)
  }, [navigate])

  const loadData = async (showLoader = false) => {
    try {
      if (showLoader) {
        setIsLoading(true)
      }
      setLoadError(null)

      const response = await adminService.getReportsSummary()
      setSummary(response.data)
    } catch (err: any) {
      const message = err?.message || 'Unable to load reports right now.'
      setLoadError(message)
    } finally {
      if (showLoader) {
        setIsLoading(false)
      }
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
      title="Reports"
      subtitle="Business snapshot from live member and invoice data"
      userName={userName}
      onLogout={handleLogout}
    >
      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text-secondary">Summary Report</h2>
            <p className="text-sm text-text-secondary mt-1">
              Metrics are generated from current members, subscriptions, and invoices.
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => loadData(true)}>
            Refresh
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <Card className="p-8">
          <p className="text-center text-text-secondary">Loading report data...</p>
        </Card>
      ) : loadError ? (
        <Card className="p-8">
          <p className="text-center text-text-secondary">{loadError}</p>
        </Card>
      ) : !summary ? (
        <Card className="p-8">
          <p className="text-center text-text-secondary">No report data available.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-text-secondary">Total Members</p>
            <p className="text-3xl font-semibold text-primary mt-2">{formatNumber(summary.total_members)}</p>
            <p className="text-sm text-text-secondary mt-1">{formatNumber(summary.active_members)} active</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-text-secondary">Total Invoices</p>
            <p className="text-3xl font-semibold text-primary mt-2">{formatNumber(summary.total_invoices)}</p>
            <p className="text-sm text-text-secondary mt-1">
              {formatNumber(summary.paid_invoices)} paid | {formatNumber(summary.pending_invoices)} pending
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-text-secondary">Expiring in 30 Days</p>
            <p className="text-3xl font-semibold text-primary mt-2">{formatNumber(summary.expiring_memberships_next_30_days)}</p>
            <p className="text-sm text-text-secondary mt-1">Needs renewal follow-up</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-text-secondary">Collected Revenue</p>
            <p className="text-2xl font-semibold text-success mt-2">{formatCurrency(summary.collected_revenue)}</p>
            <p className="text-sm text-text-secondary mt-1">Total amount received from paid invoices.</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-text-secondary">Pending Revenue</p>
            <p className="text-2xl font-semibold text-accent mt-2">{formatCurrency(summary.pending_revenue)}</p>
            <p className="text-sm text-text-secondary mt-1">Total outstanding amount from unpaid invoices.</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-text-secondary">Average Invoice Value</p>
            <p className="text-2xl font-semibold text-primary mt-2">{formatCurrency(summary.average_invoice_value)}</p>
            <p className="text-sm text-text-secondary mt-1">Across all invoices</p>
          </Card>
        </div>
      )}
    </AdminShell>
  )
}
