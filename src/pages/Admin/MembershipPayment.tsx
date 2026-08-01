import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { AuthService } from '../../api/api'
import { ApiErrorHandler } from '../../api/errors'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Input, Select } from '../../components/Input'
import MembershipInvoiceCard from '../../components/MembershipInvoiceCard'
import { ToastContainer, useToast } from '../../components/Toast'
import AdminShell from '../../layouts/AdminShell'
import { adminService } from '../../services/adminService'
import { InvoiceRecord, PaymentMode, SubscriptionRecord } from '../../types'
import { formatCurrency, formatMembershipPlanName } from '../../utils/format'

interface PaymentRouteState {
  subscription?: SubscriptionRecord
  memberName?: string
}

const PAYMENT_MODE_OPTIONS: Array<{ value: PaymentMode; label: string }> = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
]

function money(value: number): string {
  return formatCurrency(value)
}

function toAmountInput(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return ''
  }

  const rounded = Math.round(value * 100) / 100
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2)
}

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

export default function MembershipPayment() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams<{ subscriptionId: string }>()
  const routeState = (location.state || {}) as PaymentRouteState

  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(routeState.subscription || null)
  const [memberName, setMemberName] = useState(routeState.memberName || routeState.subscription?.member_name || '')
  const [isLoading, setIsLoading] = useState(!routeState.subscription)
  const [isSaving, setIsSaving] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [savedInvoice, setSavedInvoice] = useState<InvoiceRecord | null>(null)
  const [existingInvoice, setExistingInvoice] = useState<InvoiceRecord | null>(null)
  const [previousAmountPaid, setPreviousAmountPaid] = useState(0)

  const [finalAmountPayable, setFinalAmountPayable] = useState<string>('')
  const [amountPaidToday, setAmountPaidToday] = useState<string>('')
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash')
  const [transactionReference, setTransactionReference] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10))
  const [counsellor, setCounsellor] = useState('')
  const [notes, setNotes] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const { toasts, removeToast, success, error: errorToast } = useToast()

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.canAccessAdmin()) {
      navigate('/login')
      return
    }

    if (routeState.subscription) {
      return
    }

    const loadSubscription = async () => {
      const id = Number(params.subscriptionId)
      if (!id) {
        setFormError('Missing subscription context for payment.')
        return
      }

      try {
        setIsLoading(true)
        const response = await adminService.getSubscriptionById(id)
        setSubscription(response.data)
        setMemberName(response.data.member_name || '')
      } catch (err: any) {
        const apiError = ApiErrorHandler.parse(err)
        setFormError(apiError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadSubscription()
  }, [navigate, params.subscriptionId, routeState.subscription])

  useEffect(() => {
    const loadExistingInvoice = async () => {
      if (!subscription?.member_id) {
        setExistingInvoice(null)
        return
      }

      try {
        const response = await adminService.getInvoices({
          page: 1,
          pageSize: 100,
          memberId: subscription.member_id,
        })

        const linkedInvoices = response.data.filter((invoice) => invoice.subscription_id === subscription.id)
        if (linkedInvoices.length === 0) {
          setExistingInvoice(null)
          setPreviousAmountPaid(0)
          setFinalAmountPayable(String(subscription.total_amount || ''))
          setAmountPaidToday('')
          return
        }

        const latestLinkedInvoice = [...linkedInvoices].sort((a, b) => {
          const left = new Date(b.issued_at).getTime()
          const right = new Date(a.issued_at).getTime()
          return left - right
        })[0]

        setExistingInvoice(latestLinkedInvoice)

        const finalFromInvoice = Number(latestLinkedInvoice.final_amount_received ?? subscription.total_amount ?? 0)
        const paidSoFarFromInvoice = latestLinkedInvoice.total_paid != null
          ? Number(latestLinkedInvoice.total_paid)
          : latestLinkedInvoice.amount_paid_today != null
            ? Number(latestLinkedInvoice.amount_paid_today)
            : 0
        const outstandingFromInvoice = latestLinkedInvoice.outstanding_balance != null
          ? Number(latestLinkedInvoice.outstanding_balance)
          : Math.max(finalFromInvoice - paidSoFarFromInvoice, 0)
        const safePreviousPaid = Math.max(Math.min(paidSoFarFromInvoice, finalFromInvoice), 0)

        setPreviousAmountPaid(safePreviousPaid)
        setFinalAmountPayable(String(finalFromInvoice > 0 ? finalFromInvoice : subscription.total_amount || ''))
        setAmountPaidToday(outstandingFromInvoice > 0 ? toAmountInput(outstandingFromInvoice) : '')
      } catch {
        setExistingInvoice(null)
        setPreviousAmountPaid(0)
        setFinalAmountPayable(String(subscription.total_amount || ''))
      }
    }

    loadExistingInvoice()
  }, [subscription])

  const finalAmount = Number(finalAmountPayable || '0')
  const paidToday = Number(amountPaidToday || '0')
  const latestInvoice = savedInvoice || existingInvoice

  const calculations = useMemo(() => {
    const safeFinal = Number.isFinite(finalAmount) && finalAmount > 0 ? finalAmount : 0
    const safePaidToday = Number.isFinite(paidToday) && paidToday > 0 ? paidToday : 0
    const paidSoFar = Math.max(Math.min(previousAmountPaid, safeFinal), 0)
    const outstandingBeforePayment = Math.max(safeFinal - paidSoFar, 0)
    const taxableAmount = safeFinal > 0 ? safeFinal / 1.05 : 0
    const gstAmount = Math.max(safeFinal - taxableAmount, 0)
    const outstandingBalance = Math.max(outstandingBeforePayment - safePaidToday, 0)
    const totalPaidAfterPayment = Math.min(paidSoFar + safePaidToday, safeFinal)

    return {
      safeFinal,
      safePaidToday,
      paidSoFar,
      outstandingBeforePayment,
      totalPaidAfterPayment,
      taxableAmount,
      gstAmount,
      outstandingBalance,
    }
  }, [finalAmount, paidToday, previousAmountPaid])

  const handleSavePayment = async () => {
    if (!subscription) {
      return
    }

    if (!calculations.safeFinal || calculations.safeFinal <= 0) {
      setFormError('Final Amount Payable must be greater than zero.')
      return
    }

    if (!calculations.safePaidToday || calculations.safePaidToday <= 0) {
      setFormError('Amount Paid Today must be greater than zero.')
      return
    }

    if (calculations.safeFinal < calculations.paidSoFar) {
      setFormError('Final Amount Payable cannot be lower than already paid amount.')
      return
    }

    if (calculations.safePaidToday > calculations.outstandingBeforePayment) {
      setFormError('Amount Paid Today cannot exceed pending balance.')
      return
    }

    try {
      setIsSaving(true)
      setFormError(null)

      const response = await adminService.captureSubscriptionPayment(subscription.id, {
        final_amount_received: calculations.safeFinal,
        amount_paid_today: calculations.totalPaidAfterPayment,
        payment_mode: paymentMode,
        transaction_reference: transactionReference.trim() || null,
        payment_date: paymentDate,
        counsellor: counsellor.trim() || null,
        notes: notes.trim() || null,
      })

      setSavedInvoice(response.data)
      success('Payment saved', `Invoice ${response.data.invoice_number || `#${response.data.id}`} generated.`)
      setExistingInvoice(response.data)
      const nextFinal = Number(response.data.final_amount_received ?? calculations.safeFinal)
      const nextPaid = response.data.total_paid != null
        ? Number(response.data.total_paid)
        : response.data.amount_paid_today != null
          ? Number(response.data.amount_paid_today)
          : calculations.totalPaidAfterPayment
      const nextOutstanding = Number(response.data.outstanding_balance ?? 0)
      setPreviousAmountPaid(Math.max(Math.min(nextPaid, nextFinal), 0))
      setFinalAmountPayable(String(nextFinal))
      setAmountPaidToday(nextOutstanding > 0 ? toAmountInput(nextOutstanding) : '')
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      setFormError(apiError.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadInvoice = async () => {
    if (!latestInvoice) {
      return
    }

    try {
      setIsDownloading(true)
      const blob = await adminService.downloadInvoicePdf(latestInvoice.id)
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${latestInvoice.invoice_number || `invoice-${latestInvoice.id}`}.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      errorToast('Unable to download invoice', apiError.message)
    } finally {
      setIsDownloading(false)
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
      title="Membership Payment"
      subtitle="Capture payment and generate invoice"
      userName={userName}
      onLogout={handleLogout}
    >
      {isLoading ? (
        <Card className="p-8">
          <p className="text-center text-text-secondary">Loading payment details...</p>
        </Card>
      ) : !subscription ? (
        <Card className="p-8">
          <p className="text-center text-red-500">{formError || 'Subscription details not found.'}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2 p-5">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Payment Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Member Name" value={memberName || `Member #${subscription.member_id}`} readOnly />
              <Input label="Membership Plan" value={formatMembershipPlanName(subscription.plan_label)} readOnly />
              <Input label="Membership Duration" value={subscription.duration_label} readOnly />
              <Input label="Membership Start Date" value={formatDate(subscription.start_date)} readOnly />
              <Input label="Membership Expiry Date" value={formatDate(subscription.end_date)} readOnly />

              <Input
                label="Final Amount Payable"
                type="number"
                min="0"
                step="0.01"
                value={finalAmountPayable}
                onChange={(event) => setFinalAmountPayable(event.target.value)}
              />

              {calculations.paidSoFar > 0 && calculations.outstandingBeforePayment > 0 && (
                <Input
                  label="Previous Amount Paid"
                  value={money(calculations.paidSoFar)}
                  readOnly
                />
              )}

              <Input
                label="Amount Paid Today"
                type="number"
                min="0"
                step="0.01"
                value={amountPaidToday}
                onChange={(event) => setAmountPaidToday(event.target.value)}
              />

              <Input
                label="Outstanding Balance"
                value={money(calculations.outstandingBalance)}
                readOnly
              />

              {calculations.outstandingBeforePayment > 0 ? (
                <div className="md:col-span-2 rounded border border-border-light bg-bg-secondary/20 px-3 py-2 text-sm text-text-secondary">
                  Pending Before This Payment: <span className="text-text-primary font-semibold">{money(calculations.outstandingBeforePayment)}</span>
                  <span className="ml-2">| Enter only current collection in Amount Paid Today. System adds it to previous paid.</span>
                </div>
              ) : (
                <div className="md:col-span-2 rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                  Settled in Full: No pending due for this subscription.
                </div>
              )}

              {calculations.outstandingBeforePayment > 0 && (
                <div className="md:col-span-2 flex justify-end">
                  <Button
                    size="sm"
                    variant="secondary"
                    type="button"
                    onClick={() => setAmountPaidToday(toAmountInput(calculations.outstandingBeforePayment))}
                    disabled={isSaving}
                  >
                    Settle Full Pending
                  </Button>
                </div>
              )}

              <Input
                label="Counsellor (Optional)"
                value={counsellor}
                onChange={(event) => setCounsellor(event.target.value)}
              />

              <Select
                label="Payment Mode"
                value={paymentMode}
                options={PAYMENT_MODE_OPTIONS}
                onChange={(event) => setPaymentMode(event.target.value as PaymentMode)}
              />

              <Input
                label="Transaction Reference (Optional)"
                value={transactionReference}
                onChange={(event) => setTransactionReference(event.target.value)}
              />

              <Input
                label="Payment Date"
                type="date"
                value={paymentDate}
                onChange={(event) => setPaymentDate(event.target.value)}
              />

              <div className="md:col-span-2">
                <label className="label text-text-secondary">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  className="input-base h-auto py-2"
                />
              </div>
            </div>

            {formError && <p className="text-red-600 text-sm mt-4">{formError}</p>}

            <div className="mt-5 flex gap-3">
              <Button onClick={handleSavePayment} isLoading={isSaving}>Save Payment</Button>
              {latestInvoice && (
                <Button variant="secondary" onClick={handleDownloadInvoice} isLoading={isDownloading}>
                  Download Invoice
                </Button>
              )}
              <Button variant="secondary" onClick={() => navigate('/admin/members')}>
                Back to Members
              </Button>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Live Calculation</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Taxable Amount</span>
                <span className="text-text-primary">{money(calculations.taxableAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">GST (5%)</span>
                <span className="text-text-primary">{money(calculations.gstAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-border-light pt-2">
                <span className="text-text-primary">Final Amount Payable</span>
                <span className="text-primary">{money(calculations.safeFinal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Amount Paid Today</span>
                <span className="text-text-primary">{money(calculations.safePaidToday)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Paid Before This Payment</span>
                <span className="text-text-primary">{money(calculations.paidSoFar)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Total Paid After This Payment</span>
                <span className="text-text-primary">{money(calculations.totalPaidAfterPayment)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-text-primary">Outstanding Balance</span>
                <span className="text-primary">{money(calculations.outstandingBalance)}</span>
              </div>
            </div>

            {latestInvoice && (
              <div className="mt-5">
                <MembershipInvoiceCard
                  invoiceNumber={latestInvoice.invoice_number}
                  memberName={latestInvoice.member_name}
                  memberId={String(latestInvoice.member_id)}
                  planLabel={formatMembershipPlanName(latestInvoice.plan_label)}
                  durationLabel={subscription.duration_label}
                  startDate={formatDate(subscription.start_date)}
                  expiryDate={formatDate(subscription.end_date)}
                  taxableAmount={(latestInvoice.final_amount_received ?? calculations.safeFinal) - (latestInvoice.gst_amount ?? calculations.gstAmount)}
                  gstAmount={latestInvoice.gst_amount ?? calculations.gstAmount}
                  finalAmountPayable={latestInvoice.final_amount_received ?? calculations.safeFinal}
                  amountPaidToday={latestInvoice.amount_paid_today ?? calculations.safePaidToday}
                  outstandingBalance={latestInvoice.outstanding_balance ?? calculations.outstandingBalance}
                  paymentMode={(latestInvoice.payment_mode || paymentMode).replace('_', ' ').toUpperCase()}
                  transactionReference={latestInvoice.transaction_reference}
                  paymentDate={latestInvoice.payment_date || paymentDate}
                  notes={latestInvoice.notes}
                  status={latestInvoice.status}
                  createdBy="System"
                  counsellor={latestInvoice.counsellor || counsellor}
                  showDownload
                  onDownloadInvoice={handleDownloadInvoice}
                  downloading={isDownloading}
                />
              </div>
            )}
          </Card>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </AdminShell>
  )
}
