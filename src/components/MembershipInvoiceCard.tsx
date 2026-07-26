import { Button } from './Button'

interface MembershipInvoiceCardProps {
  invoiceNumber?: string | null
  memberName: string
  planLabel: string
  durationLabel: string
  startDate: string
  expiryDate: string
  originalPrice: number
  discountAmount: number
  taxableAmount: number
  gstAmount: number
  totalPaid: number
  paymentMode: string
  transactionReference?: string | null
  paymentDate: string
  notes?: string | null
  onDownloadInvoice?: () => void
  downloading?: boolean
  showDownload?: boolean
}

function money(value: number): string {
  return `INR ${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export default function MembershipInvoiceCard({
  invoiceNumber,
  memberName,
  planLabel,
  durationLabel,
  startDate,
  expiryDate,
  originalPrice,
  discountAmount,
  taxableAmount,
  gstAmount,
  totalPaid,
  paymentMode,
  transactionReference,
  paymentDate,
  notes,
  onDownloadInvoice,
  downloading = false,
  showDownload = true,
}: MembershipInvoiceCardProps) {
  return (
    <div className="rounded-xl border border-border-light bg-bg-secondary/20 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-text-primary">Membership Invoice</h3>
        {invoiceNumber && (
          <span className="text-xs px-2 py-1 rounded bg-bg-card border border-border-light text-text-secondary">
            {invoiceNumber}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <div><span className="text-text-secondary">Member:</span> <span className="text-text-primary">{memberName}</span></div>
        <div><span className="text-text-secondary">Plan:</span> <span className="text-text-primary">{planLabel}</span></div>
        <div><span className="text-text-secondary">Duration:</span> <span className="text-text-primary">{durationLabel}</span></div>
        <div><span className="text-text-secondary">Start Date:</span> <span className="text-text-primary">{startDate}</span></div>
        <div><span className="text-text-secondary">Expiry Date:</span> <span className="text-text-primary">{expiryDate}</span></div>
        <div><span className="text-text-secondary">Payment Date:</span> <span className="text-text-primary">{paymentDate}</span></div>
      </div>

      <div className="border-t border-border-light pt-3 space-y-1 text-sm">
        <div className="flex justify-between"><span className="text-text-secondary">Original Membership Price</span><span className="text-text-primary">{money(originalPrice)}</span></div>
        <div className="flex justify-between"><span className="text-text-secondary">Discount Amount</span><span className="text-text-primary">{money(discountAmount)}</span></div>
        <div className="flex justify-between"><span className="text-text-secondary">Taxable Amount</span><span className="text-text-primary">{money(taxableAmount)}</span></div>
        <div className="flex justify-between"><span className="text-text-secondary">GST (5%)</span><span className="text-text-primary">{money(gstAmount)}</span></div>
        <div className="flex justify-between font-semibold text-base pt-1"><span className="text-text-primary">Total Paid</span><span className="text-primary">{money(totalPaid)}</span></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm border-t border-border-light pt-3">
        <div><span className="text-text-secondary">Payment Mode:</span> <span className="text-text-primary">{paymentMode}</span></div>
        <div><span className="text-text-secondary">Transaction Ref:</span> <span className="text-text-primary">{transactionReference || '-'}</span></div>
      </div>

      {notes && <p className="text-xs text-text-secondary">Notes: {notes}</p>}

      {showDownload && onDownloadInvoice && (
        <div className="pt-1">
          <Button size="sm" onClick={onDownloadInvoice} isLoading={downloading}>
            Download Invoice
          </Button>
        </div>
      )}
    </div>
  )
}
