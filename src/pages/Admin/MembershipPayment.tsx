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
  return `INR ${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
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

  const [finalAmountReceived, setFinalAmountReceived] = useState<string>(
    routeState.subscription ? String(routeState.subscription.base_price) : ''
  )
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash')
  const [transactionReference, setTransactionReference] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const { toasts, removeToast, success, error: errorToast } = useToast()

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.hasRole('admin')) {
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
        setFinalAmountReceived(String(response.data.base_price))
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

  const originalPrice = subscription?.base_price || 0
  const finalAmount = Number(finalAmountReceived || '0')

  const calculations = useMemo(() => {
    const safeFinal = Number.isFinite(finalAmount) && finalAmount > 0 ? finalAmount : 0
    const discountAmount = Math.max(originalPrice - safeFinal, 0)
    const discountPercentage = originalPrice > 0 ? (discountAmount / originalPrice) * 100 : 0
    const gstAmount = safeFinal * 0.05
    const totalAmountPayable = safeFinal + gstAmount

    return {
      safeFinal,
      discountAmount,
      discountPercentage,
      gstAmount,
      totalAmountPayable,
    }
  }, [finalAmount, originalPrice])

  const handleSavePayment = async () => {
    if (!subscription) {
      return
    }

    if (!calculations.safeFinal || calculations.safeFinal <= 0) {
      setFormError('Final Amount Received must be greater than zero.')
      return
    }

    if (calculations.safeFinal > originalPrice) {
      setFormError('Final Amount Received cannot exceed Original Membership Price.')
      return
    }

    try {
      setIsSaving(true)
      setFormError(null)

      const response = await adminService.captureSubscriptionPayment(subscription.id, {
        final_amount_received: calculations.safeFinal,
        payment_mode: paymentMode,
        transaction_reference: transactionReference.trim() || null,
        payment_date: paymentDate,
        notes: notes.trim() || null,
      })

      setSavedInvoice(response.data)
      success('Payment saved', `Invoice ${response.data.invoice_number || `#${response.data.id}`} generated.`)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      setFormError(apiError.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadInvoice = async () => {
    if (!savedInvoice) {
      return
    }

    try {
      setIsDownloading(true)
      const blob = await adminService.downloadInvoicePdf(savedInvoice.id)
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${savedInvoice.invoice_number || `invoice-${savedInvoice.id}`}.pdf`
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
              <Input label="Membership Plan" value={subscription.plan_label} readOnly />
              <Input label="Membership Duration" value={subscription.duration_label} readOnly />
              <Input label="Membership Start Date" value={formatDate(subscription.start_date)} readOnly />
              <Input label="Membership Expiry Date" value={formatDate(subscription.end_date)} readOnly />
              <Input label="Original Membership Price" value={money(originalPrice)} readOnly />

              <Input
                label="Final Amount Received"
                type="number"
                min="0"
                step="0.01"
                value={finalAmountReceived}
                onChange={(event) => setFinalAmountReceived(event.target.value)}
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
              {savedInvoice && (
                <Button variant="secondary" onClick={handleDownloadInvoice} isLoading={isDownloading}>
                  Download Invoice
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Live Calculation</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Discount Amount</span>
                <span className="text-text-primary">{money(calculations.discountAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Discount Percentage</span>
                <span className="text-text-primary">{calculations.discountPercentage.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">GST (5%)</span>
                <span className="text-text-primary">{money(calculations.gstAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-border-light pt-2">
                <span className="text-text-primary">Total Amount Payable</span>
                <span className="text-primary">{money(calculations.totalAmountPayable)}</span>
              </div>
            </div>

            {savedInvoice && (
              <div className="mt-5">
                <MembershipInvoiceCard
                  invoiceNumber={savedInvoice.invoice_number}
                  memberName={savedInvoice.member_name}
                  planLabel={savedInvoice.plan_label}
                  durationLabel={subscription.duration_label}
                  startDate={formatDate(subscription.start_date)}
                  expiryDate={formatDate(subscription.end_date)}
                  originalPrice={savedInvoice.original_price || originalPrice}
                  discountAmount={savedInvoice.discount_amount || 0}
                  taxableAmount={savedInvoice.final_amount_received || calculations.safeFinal}
                  gstAmount={savedInvoice.gst_amount || calculations.gstAmount}
                  totalPaid={savedInvoice.total_paid || calculations.totalAmountPayable}
                  paymentMode={(savedInvoice.payment_mode || paymentMode).replace('_', ' ').toUpperCase()}
                  transactionReference={savedInvoice.transaction_reference}
                  paymentDate={savedInvoice.payment_date ? formatDate(savedInvoice.payment_date) : formatDate(paymentDate)}
                  notes={savedInvoice.notes}
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
