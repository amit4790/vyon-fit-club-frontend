import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthService } from '../../api/api'
import { ApiErrorHandler } from '../../api/errors'
import { Card } from '../../components/Card'
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from '../../components/Table'
import AdminShell from '../../layouts/AdminShell'
import { adminService } from '../../services/adminService'
import { InvoiceRecord, MemberRecord, SubscriptionRecord } from '../../types'
import { formatCurrency, formatMembershipPlanName } from '../../utils/format'

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

  return (
    <AdminShell
      title="Member Details"
      subtitle="Member profile and concurrent memberships"
      userName={userName}
      onLogout={handleLogout}
    >
      {isLoading ? (
        <Card className="p-8"><p className="text-text-secondary">Loading member details...</p></Card>
      ) : error ? (
        <Card className="p-8"><p className="text-red-500">{error}</p></Card>
      ) : !member ? (
        <Card className="p-8"><p className="text-text-secondary">Member not found.</p></Card>
      ) : (
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-text-secondary mb-3">Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <p><span className="text-text-secondary">Name:</span> {member.full_name}</p>
              <p><span className="text-text-secondary">Mobile:</span> {member.mobile_number}</p>
              <p><span className="text-text-secondary">Email:</span> {member.email || '-'}</p>
              <p><span className="text-text-secondary">Status:</span> {member.status}</p>
              <p><span className="text-text-secondary">Joined Date:</span> {formatDate(member.joining_date)}</p>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold text-text-secondary mb-3">Memberships</h2>
            {subscriptions.length === 0 ? (
              <p className="text-sm text-text-secondary">No memberships found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableHeaderCell>Plan</TableHeaderCell>
                  <TableHeaderCell>Duration</TableHeaderCell>
                  <TableHeaderCell>Start</TableHeaderCell>
                  <TableHeaderCell>End</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Payment</TableHeaderCell>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>{formatMembershipPlanName(subscription.plan_label)}</TableCell>
                      <TableCell>{subscription.duration_label}</TableCell>
                      <TableCell>{formatDate(subscription.start_date)}</TableCell>
                      <TableCell>{formatDate(subscription.end_date)}</TableCell>
                      <TableCell>{subscription.status}</TableCell>
                      <TableCell>{subscription.payment_status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold text-text-secondary mb-3">Payment History</h2>
            {invoices.length === 0 ? (
              <p className="text-sm text-text-secondary">No payments found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableHeaderCell>Invoice</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoice_number || `INV-${invoice.id}`}</TableCell>
                      <TableCell>{formatDate(invoice.issued_at)}</TableCell>
                      <TableCell>{invoice.status}</TableCell>
                      <TableCell>{formatCurrency(Number(invoice.amount || 0))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold text-text-secondary mb-3">Invoices</h2>
            {invoices.length === 0 ? (
              <p className="text-sm text-text-secondary">No invoices available.</p>
            ) : (
              <ul className="space-y-2 text-sm text-text-primary">
                {invoices.map((invoice) => (
                  <li key={`invoice-${invoice.id}`} className="rounded border border-border-light px-3 py-2">
                    {invoice.invoice_number || `INV-${invoice.id}`} | {formatCurrency(Number(invoice.amount || 0))} | {invoice.status}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold text-text-secondary mb-3">Notes</h2>
            <p className="text-sm text-text-primary">{member.notes || 'No notes available.'}</p>
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
