import { MembershipInvoiceData } from './types'
import { getStatusBadgeClass } from './utils'

interface InvoiceHeaderProps {
  invoice: MembershipInvoiceData
}

export function InvoiceHeader({ invoice }: InvoiceHeaderProps) {
  return (
    <header className="border border-border-light print:border-zinc-800">
      <div className="grid grid-cols-1 gap-4 border-b border-border-light bg-white px-4 py-4 md:grid-cols-[1.5fr_1fr] print:border-zinc-800 print:px-3 print:py-3">
        <div className="flex items-start gap-3">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded border border-border-light bg-white print:border-zinc-800">
            <img src={invoice.gym.logoUrl} alt={invoice.gym.gymName} className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold tracking-wide text-black">{invoice.gym.gymName}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-primary print:text-black">{invoice.title}</p>
          </div>
        </div>

        <div className="rounded border border-border-light bg-zinc-50 p-3 text-sm print:border-zinc-800 print:bg-white">
          <p className="font-semibold text-black">Invoice No.: {invoice.invoiceNumber}</p>
          <p className="mt-1 text-zinc-700 print:text-black">Date: {invoice.invoiceDate}</p>
          <p className="text-zinc-700 print:text-black">Time: {invoice.invoiceTime}</p>
          <span
            className={`mt-2 inline-flex rounded border px-2 py-1 text-xs font-semibold tracking-wide ${getStatusBadgeClass(invoice.paymentStatus)}`}
          >
            {invoice.paymentStatus}
          </span>
        </div>
      </div>
    </header>
  )
}
