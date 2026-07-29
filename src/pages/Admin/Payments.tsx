import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '../../api/api'
import { ApiErrorHandler } from '../../api/errors'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Select } from '../../components/Input'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '../../components/Table'
import { ToastContainer, useToast } from '../../components/Toast'
import AdminShell from '../../layouts/AdminShell'
import { adminService } from '../../services/adminService'
import { InvoiceRecord, InvoiceStatus } from '../../types'

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
]

function formatDate(value: string | null): string {
  if (!value) {
    return '-'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusBadgeClass(status: InvoiceStatus): string {
  if (status === 'paid') {
    return 'bg-green-100 text-green-700'
  }

  if (status === 'partial') {
    return 'bg-orange-100 text-orange-700'
  }

  if (status === 'pending') {
    return 'bg-yellow-100 text-yellow-700'
  }

  if (status === 'failed' || status === 'cancelled') {
    return 'bg-red-100 text-red-700'
  }

  return 'bg-zinc-100 text-zinc-700'
}

function statusLabel(status: InvoiceStatus): string {
  if (status === 'paid') {
    return '🟢 Paid'
  }

  if (status === 'partial') {
    return '🟠 Partial'
  }

  if (status === 'pending') {
    return '🟡 Pending'
  }

  return status.charAt(0).toUpperCase() + status.slice(1)
}

export default function AdminPayments() {
  const navigate = useNavigate()
  const tableHostRef = useRef<HTMLDivElement | null>(null)
  const topScrollRef = useRef<HTMLDivElement | null>(null)
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [statusFilter, setStatusFilter] = useState<'' | InvoiceStatus>('')
  const [updatingInvoiceId, setUpdatingInvoiceId] = useState<number | null>(null)
  const [topScrollWidth, setTopScrollWidth] = useState(0)
  const [showTopScroll, setShowTopScroll] = useState(false)
  const { toasts, removeToast, success, error: errorToast } = useToast()

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.canAccessAdmin()) {
      navigate('/login')
      return
    }

    loadInvoices(1, statusFilter, true)
  }, [navigate])

  useEffect(() => {
    const host = tableHostRef.current
    const topScroll = topScrollRef.current

    if (!host || !topScroll) {
      return
    }

    const tableWrapper = host.querySelector('.table-wrapper') as HTMLDivElement | null
    if (!tableWrapper) {
      return
    }

    const syncFromTable = () => {
      topScroll.scrollLeft = tableWrapper.scrollLeft
    }

    const syncFromTop = () => {
      tableWrapper.scrollLeft = topScroll.scrollLeft
    }

    const updateScrollMetrics = () => {
      const scrollable = tableWrapper.scrollWidth > tableWrapper.clientWidth + 1
      setShowTopScroll(scrollable)
      setTopScrollWidth(tableWrapper.scrollWidth)
      if (!scrollable) {
        topScroll.scrollLeft = 0
      }
    }

    const resizeObserver = new ResizeObserver(updateScrollMetrics)
    resizeObserver.observe(tableWrapper)

    tableWrapper.addEventListener('scroll', syncFromTable)
    topScroll.addEventListener('scroll', syncFromTop)
    window.addEventListener('resize', updateScrollMetrics)

    updateScrollMetrics()
    syncFromTable()

    return () => {
      resizeObserver.disconnect()
      tableWrapper.removeEventListener('scroll', syncFromTable)
      topScroll.removeEventListener('scroll', syncFromTop)
      window.removeEventListener('resize', updateScrollMetrics)
    }
  }, [invoices])

  const loadInvoices = async (
    targetPage = page,
    targetStatus = statusFilter,
    showLoader = false
  ) => {
    try {
      if (showLoader) {
        setIsLoading(true)
      }

      const response = await adminService.getInvoices({
        page: targetPage,
        pageSize,
        status: targetStatus || undefined,
      })

      setInvoices(response.data)
      setPage(response.pagination.page)
      setTotalPages(response.pagination.total_pages)
      setTotalItems(response.pagination.total_items)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      errorToast('Failed to load invoices', apiError.message)
    } finally {
      if (showLoader) {
        setIsLoading(false)
      }
    }
  }

  const handleApplyFilters = async () => {
    await loadInvoices(1, statusFilter, true)
  }

  const handleMarkPaid = async (invoiceId: number) => {
    try {
      setUpdatingInvoiceId(invoiceId)
      const response = await adminService.updateInvoiceStatus(invoiceId, 'paid')

      const sentCount = response.notifications.filter((item) => item.status === 'sent').length
      success(
        'Payment recorded',
        sentCount > 0
          ? `Invoice marked paid and ${sentCount} notification(s) sent`
          : 'Invoice marked paid'
      )
      await loadInvoices(page, statusFilter, true)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      errorToast('Unable to update invoice', apiError.message)
    } finally {
      setUpdatingInvoiceId(null)
    }
  }

  const handleResend = async (invoiceId: number) => {
    try {
      setUpdatingInvoiceId(invoiceId)
      const response = await adminService.resendInvoice(invoiceId)
      const sentCount = response.notifications.filter((item) => item.status === 'sent').length
      success('Invoice resent', `${sentCount} notification(s) sent`)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      errorToast('Unable to resend invoice', apiError.message)
    } finally {
      setUpdatingInvoiceId(null)
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
      title="Payments"
      subtitle="Invoice operations and payment tracking"
      userName={userName}
      onLogout={handleLogout}
    >
      <Card className="p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-text-secondary">Invoices</h2>
            <p className="text-sm text-text-secondary mt-1">
              Review pending invoices, mark payments, and resend notifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              options={STATUS_OPTIONS}
              onChange={(event) => setStatusFilter(event.target.value as '' | InvoiceStatus)}
            />
            <Button size="sm" onClick={handleApplyFilters}>
              Apply
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="py-8 text-center text-text-secondary">Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p className="py-8 text-center text-text-secondary">No invoices found</p>
        ) : (
          <>
            <div
              ref={topScrollRef}
              className={showTopScroll ? 'mb-2 w-full overflow-x-auto' : 'hidden'}
              aria-hidden="true"
            >
              <div style={{ width: topScrollWidth, height: 1 }} />
            </div>

            <div ref={tableHostRef}>
              <Table>
                <TableHeader>
                  <TableHeaderCell>ID</TableHeaderCell>
                  <TableHeaderCell>Member</TableHeaderCell>
                  <TableHeaderCell>Plan</TableHeaderCell>
                  <TableHeaderCell>Final Amount</TableHeaderCell>
                  <TableHeaderCell>Outstanding Balance</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Issued</TableHeaderCell>
                  <TableHeaderCell>Paid</TableHeaderCell>
                  <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="text-sm text-text-secondary">#{invoice.id}</TableCell>
                      <TableCell className="text-sm text-text-secondary">
                        <div>{invoice.member_name}</div>
                        <div className="text-xs text-text-secondary">{invoice.member_phone || '-'}</div>
                      </TableCell>
                      <TableCell className="text-sm text-text-secondary">{invoice.plan_label}</TableCell>
                      <TableCell className="text-sm text-text-secondary">
                        INR {invoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-sm text-text-secondary">
                        INR {(invoice.outstanding_balance ?? Math.max((invoice.final_amount_received ?? invoice.amount) - (invoice.amount_paid_today ?? 0), 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(invoice.status)}`}>
                          {statusLabel(invoice.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-text-secondary">{formatDate(invoice.issued_at)}</TableCell>
                      <TableCell className="text-sm text-text-secondary">
                        {formatDate(invoice.paid_at || (invoice.status === 'partial' ? invoice.payment_date : null))}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={invoice.status === 'paid' || updatingInvoiceId === invoice.id}
                            onClick={() => handleMarkPaid(invoice.id)}
                          >
                            Record Payment
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={updatingInvoiceId === invoice.id}
                            onClick={() => handleResend(invoice.id)}
                          >
                            Resend
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                Showing page {page} of {Math.max(totalPages, 1)} ({totalItems} invoices)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => loadInvoices(page - 1, statusFilter, true)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages || totalPages === 0}
                  onClick={() => loadInvoices(page + 1, statusFilter, true)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </AdminShell>
  )
}
