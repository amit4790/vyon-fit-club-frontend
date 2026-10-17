import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthService } from '../../api/api'
import { ApiErrorHandler } from '../../api/errors'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from '../../components/Table'
import { ToastContainer, useToast } from '../../components/Toast'
import AdminShell from '../../layouts/AdminShell'
import { adminService } from '../../services/adminService'
import { InvoiceRecord, MemberRecord, SubscriptionRecord } from '../../types'
import { formatCurrency, formatMembershipPlanName } from '../../utils/format'
import { MemberBodyAnalysisSection } from '../../components/bodyAnalysis/MemberBodyAnalysisSection'

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '-'
  }

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

export default function AdminMemberDetails() {
  const navigate = useNavigate()
  const { memberId } = useParams<{ memberId: string }>()
  const [member, setMember] = useState<MemberRecord | null>(null)
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([])
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<number | null>(null)
  const { toasts, removeToast, error: errorToast } = useToast()

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.canAccessAdmin()) {
      navigate('/login')
      return
    }

    const targetMemberId = Number(memberId)
    if (!targetMemberId) {
      setError('Invalid member')
      setIsLoading(false)
      return
    }

    const loadDetails = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [memberResponse, subscriptionResponse, invoiceResponse] = await Promise.all([
          adminService.getMemberById(targetMemberId),
          adminService.getMemberSubscriptions(targetMemberId),
          adminService.getInvoices({ page: 1, pageSize: 200, memberId: targetMemberId }),
        ])

        setMember(memberResponse.data)
        setSubscriptions(subscriptionResponse.data)
        setInvoices(invoiceResponse.data)
      } catch (err: any) {
        const apiError = ApiErrorHandler.parse(err)
        setError(apiError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadDetails()
  }, [memberId, navigate])

  const handleLogout = () => {
    AuthService.logout()
    navigate('/')
  }

  const userName = AuthService.getUserInfo()?.name || 'Admin'

  const handleDownloadInvoice = async (invoiceId: number, fileLabel: string) => {
    try {
      setDownloadingInvoiceId(invoiceId)
      const blob = await adminService.downloadInvoicePdf(invoiceId)
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${fileLabel}.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      errorToast('Unable to download invoice', ApiErrorHandler.parse(err).message)
    } finally {
      setDownloadingInvoiceId(null)
    }
  }

  const membershipRows = useMemo(() => {
    const invoiceBySubscription = new Map(invoices.map((inv) => [inv.subscription_id, inv]))
    const linkedSubscriptionIds = new Set<number>()

    const fromSubscriptions = subscriptions.map((sub) => {
      linkedSubscriptionIds.add(sub.id)
      const invoice = invoiceBySubscription.get(sub.id)
      return {
        key: `sub-${sub.id}`,
        invoiceId: invoice?.id ?? null,
        plan: formatMembershipPlanName(sub.plan_label),
        duration: sub.duration_label,
        period: `${formatDate(sub.start_date)} – ${formatDate(sub.end_date)}`,
        membershipStatus: sub.status,
        paymentStatus: invoice?.status ?? sub.payment_status,
        invoice: invoice?.invoice_number || (invoice ? `INV-${invoice.id}` : '—'),
        paidOn: formatDate(invoice?.payment_date || invoice?.paid_at || invoice?.issued_at),
        amount: invoice ? formatCurrency(Number(invoice.amount || 0)) : formatCurrency(Number(sub.total_amount || 0)),
      }
    })

    const invoiceOnly = invoices
      .filter((inv) => !linkedSubscriptionIds.has(inv.subscription_id))
      .map((inv) => ({
        key: `inv-${inv.id}`,
        invoiceId: inv.id,
        plan: formatMembershipPlanName(inv.plan_label),
        duration: '—',
        period: '—',
        membershipStatus: '—',
        paymentStatus: inv.status,
        invoice: inv.invoice_number || `INV-${inv.id}`,
        paidOn: formatDate(inv.payment_date || inv.paid_at || inv.issued_at),
        amount: formatCurrency(Number(inv.amount || 0)),
      }))

    return [...fromSubscriptions, ...invoiceOnly]
  }, [subscriptions, invoices])

  return (
    <AdminShell
      title="Member Details"
      subtitle="Member profile and concurrent memberships"
      userName={userName}
      onLogout={handleLogout}
    >
      <ToastContainer toasts={toasts} onClose={removeToast} />
      {isLoading ? (
        <Card className="p-8"><p className="text-text-secondary">Loading member details...</p></Card>
      ) : error ? (
        <Card className="p-8"><p className="text-red-500">{error}</p></Card>
      ) : !member ? (
        <Card className="p-8"><p className="text-text-secondary">Member not found.</p></Card>
      ) : (
        <div className="space-y-4">
          <Card className="p-4 sm:p-5 overflow-hidden">
            <h2 className="text-lg font-semibold text-text-secondary mb-3">Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <p><span className="text-text-secondary">Member ID:</span> {member.id}</p>
              <p><span className="text-text-secondary">Name:</span> {member.full_name}</p>
              <p><span className="text-text-secondary">Mobile:</span> {member.mobile_number}</p>
              <p><span className="text-text-secondary">Email:</span> {member.email || '-'}</p>
              <p><span className="text-text-secondary">Status:</span> {member.status}</p>
              <p><span className="text-text-secondary">Joined Date:</span> {formatDate(member.joining_date)}</p>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 overflow-hidden">
            <h2 className="text-lg font-semibold text-text-secondary mb-3">Membership & payments</h2>
            {membershipRows.length === 0 ? (
              <p className="text-sm text-text-secondary">No memberships or payments found.</p>
            ) : (
              <div className="overflow-x-auto -mx-1 px-1">
                <Table frozenColumnCount={1}>
                  <TableHeader>
                    <TableHeaderCell>Plan</TableHeaderCell>
                    <TableHeaderCell>Duration</TableHeaderCell>
                    <TableHeaderCell>Period</TableHeaderCell>
                    <TableHeaderCell>Membership</TableHeaderCell>
                    <TableHeaderCell>Payment</TableHeaderCell>
                    <TableHeaderCell>Invoice</TableHeaderCell>
                    <TableHeaderCell>Paid</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell>PDF</TableHeaderCell>
                  </TableHeader>
                  <TableBody>
                    {membershipRows.map((row) => (
                      <TableRow key={row.key}>
                        <TableCell>{row.plan}</TableCell>
                        <TableCell>{row.duration}</TableCell>
                        <TableCell>{row.period}</TableCell>
                        <TableCell>{row.membershipStatus}</TableCell>
                        <TableCell>{row.paymentStatus}</TableCell>
                        <TableCell>{row.invoice}</TableCell>
                        <TableCell>{row.paidOn}</TableCell>
                        <TableCell>{row.amount}</TableCell>
                        <TableCell>
                          {row.invoiceId ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              isLoading={downloadingInvoiceId === row.invoiceId}
                              onClick={() => void handleDownloadInvoice(row.invoiceId!, row.invoice)}
                            >
                              Download
                            </Button>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold text-text-secondary mb-3">Notes</h2>
            <p className="text-sm text-text-primary">{member.notes || 'No notes available.'}</p>
          </Card>

          <Card className="p-4 sm:p-5 overflow-hidden">
            <h2 className="text-lg font-semibold text-text-secondary mb-1">Body analysis</h2>
            <p className="text-sm text-text-secondary mb-3">
              View and record assessments (backup when the gym tablet is unavailable).
            </p>
            <MemberBodyAnalysisSection memberId={member.id} context="admin" />
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold text-text-secondary mb-3">Attendance</h2>
            <p className="text-sm text-text-secondary">Coming Soon</p>
          </Card>
        </div>
      )}
    </AdminShell>
  )
}

