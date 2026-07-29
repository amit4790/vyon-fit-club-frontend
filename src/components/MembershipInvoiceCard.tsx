import { DEFAULT_GYM_PROFILE } from './invoice/constants'
import { MembershipInvoice } from './invoice/MembershipInvoice'
import { MembershipInvoiceData } from './invoice/types'

interface MembershipInvoiceCardProps {
  invoiceNumber?: string | null
  memberName: string
  memberId?: string | null
  planLabel: string
  durationLabel: string
  startDate: string
  expiryDate: string
  originalPrice: number
  discountAmount: number
  taxableAmount: number
  gstAmount: number
  finalAmountPayable: number
  amountPaidToday: number
  outstandingBalance: number
  paymentMode: string
  transactionReference?: string | null
  paymentDate: string
  notes?: string | null
  status?: string | null
  createdBy?: string | null
  counsellor?: string | null
  onDownloadInvoice?: () => void
  downloading?: boolean
  showDownload?: boolean
}

function mapPaymentStatus(status?: string | null, balance = 0): MembershipInvoiceData['paymentStatus'] {
  if (balance > 0) {
    return 'PARTIAL'
  }

  const normalized = status?.trim().toLowerCase()

  if (!normalized) {
    return 'PENDING'
  }

  if (normalized === 'paid') {
    return 'PAID'
  }

  if (normalized === 'pending') {
    return 'PENDING'
  }

  if (normalized === 'partial') {
    return 'PARTIAL'
  }

  if (normalized === 'cancelled') {
    return 'CANCELLED'
  }

  return normalized === 'failed' ? 'FAILED' : 'PENDING'
}

function mapInvoiceDateParts(value: string): { invoiceDate: string; invoiceTime: string } {
  const normalized = value.trim()
  if (!normalized || normalized === '-') {
    return { invoiceDate: '-', invoiceTime: '-' }
  }

  const parsed = new Date(normalized)
  if (Number.isNaN(parsed.getTime())) {
    return { invoiceDate: normalized, invoiceTime: '-' }
  }

  return {
    invoiceDate: parsed.toLocaleDateString('en-GB'),
    invoiceTime: parsed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  }
}

export default function MembershipInvoiceCard({
  invoiceNumber,
  memberName,
  memberId,
  planLabel,
  durationLabel,
  startDate,
  expiryDate,
  originalPrice,
  discountAmount,
  taxableAmount,
  gstAmount,
  finalAmountPayable,
  amountPaidToday,
  outstandingBalance,
  paymentMode,
  transactionReference,
  paymentDate,
  notes,
  status,
  createdBy,
  counsellor,
  onDownloadInvoice,
  downloading = false,
  showDownload = true,
}: MembershipInvoiceCardProps) {
  const safeDiscount = Number.isFinite(discountAmount) ? discountAmount : 0
  const safeTaxableAmount = Number.isFinite(taxableAmount) ? taxableAmount : 0
  const safeFinalAmountPayable = Number.isFinite(finalAmountPayable) ? finalAmountPayable : 0
  const safeAmountPaid = Number.isFinite(amountPaidToday) ? amountPaidToday : 0
  const safeBalance = Math.max(Number.isFinite(outstandingBalance) ? outstandingBalance : 0, 0)
  const splitGst = Number.isFinite(gstAmount) ? gstAmount / 2 : 0
  const issueDate = mapInvoiceDateParts(paymentDate)

  const invoice: MembershipInvoiceData = {
    title: 'Membership Renewal Invoice',
    invoiceNumber: invoiceNumber || '-',
    invoiceDate: issueDate.invoiceDate,
    invoiceTime: issueDate.invoiceTime,
    paymentStatus: mapPaymentStatus(status, safeBalance),
    billTo: {
      memberName,
      memberId: memberId || '-',
    },
    membership: {
      subscriptionName: planLabel,
      fromDate: startDate,
      toDate: expiryDate,
      duration: durationLabel,
      amount: originalPrice,
    },
    paymentSummary: {
      discount: safeDiscount,
      taxableAmount: safeTaxableAmount,
      paymentMode,
      finalAmountPayable: safeFinalAmountPayable,
      amountPaid: safeAmountPaid,
      sgst: splitGst,
      cgst: splitGst,
      outstandingBalance: safeBalance,
    },
    staff: {
      createdBy: createdBy || '-',
      counsellor: counsellor || '-',
    },
    gym: DEFAULT_GYM_PROFILE,
    remarks: notes || transactionReference || null,
  }

  return (
    <div className="rounded-xl border border-border-light bg-bg-secondary/20 p-2 md:p-3">
      <MembershipInvoice
        invoice={invoice}
        showDownload={showDownload}
        onDownloadInvoice={onDownloadInvoice}
        downloading={downloading}
      />
    </div>
  )
}
