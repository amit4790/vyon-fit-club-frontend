import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '../../api/api'
import { ApiErrorHandler } from '../../api/errors'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { ToastContainer, useToast } from '../../components/Toast'
import AdminShell from '../../layouts/AdminShell'
import { adminService } from '../../services/adminService'
import { InvoiceRecord, MemberRecord } from '../../types'

function money(value: number): string {
  return `INR ${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export default function AdminReports() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [members, setMembers] = useState<MemberRecord[]>([])
  const [expiringCount, setExpiringCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { toasts, removeToast, error: errorToast } = useToast()

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.hasRole('admin')) {
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

      const [invoiceResponse, memberResponse, expiringResponse] = await Promise.all([
        adminService.getInvoices({ page: 1, pageSize: 100 }),
        adminService.getMembers({ page: 1, pageSize: 100 }),
        adminService.getExpiringSubscriptions({ days: 30, page: 1, pageSize: 100 }),
      ])

      setInvoices(invoiceResponse.data)
      setMembers(memberResponse.data)
      setExpiringCount(expiringResponse.pagination.total_items)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      errorToast('Failed to load report data', apiError.message)
    } finally {
      if (showLoader) {
        setIsLoading(false)
      }
    }
  }

  const summary = useMemo(() => {
    const activeMembers = members.filter((item) => item.status === 'active').length
    const paidInvoices = invoices.filter((item) => item.status === 'paid')
    const pendingInvoices = invoices.filter((item) => item.status === 'pending')

    const paidAmount = paidInvoices.reduce((sum, item) => sum + item.amount, 0)
    const pendingAmount = pendingInvoices.reduce((sum, item) => sum + item.amount, 0)

    return {
      totalMembers: members.length,
      activeMembers,
      paidInvoices: paidInvoices.length,
      pendingInvoices: pendingInvoices.length,
      paidAmount,
      pendingAmount,
    }
  }, [members, invoices])

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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-text-secondary">Members</p>
            <p className="text-3xl font-semibold text-primary mt-2">{summary.totalMembers}</p>
            <p className="text-sm text-text-secondary mt-1">{summary.activeMembers} active</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-text-secondary">Invoices</p>
            <p className="text-3xl font-semibold text-primary mt-2">{invoices.length}</p>
            <p className="text-sm text-text-secondary mt-1">
              {summary.paidInvoices} paid | {summary.pendingInvoices} pending
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-text-secondary">Expiring in 30 Days</p>
            <p className="text-3xl font-semibold text-primary mt-2">{expiringCount}</p>
            <p className="text-sm text-text-secondary mt-1">Needs renewal follow-up</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-text-secondary">Collected Revenue</p>
            <p className="text-2xl font-semibold text-success mt-2">{money(summary.paidAmount)}</p>
            <p className="text-sm text-text-secondary mt-1">Paid invoices total</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-text-secondary">Pending Revenue</p>
            <p className="text-2xl font-semibold text-accent mt-2">{money(summary.pendingAmount)}</p>
            <p className="text-sm text-text-secondary mt-1">Awaiting payment</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-text-secondary">Average Invoice Value</p>
            <p className="text-2xl font-semibold text-primary mt-2">
              {money(invoices.length > 0 ? (summary.paidAmount + summary.pendingAmount) / invoices.length : 0)}
            </p>
            <p className="text-sm text-text-secondary mt-1">Across all invoices</p>
          </Card>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </AdminShell>
  )
}
