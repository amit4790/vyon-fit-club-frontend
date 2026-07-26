import { MembershipInvoiceData } from './types'
import { displayText } from './utils'

interface InvoiceFooterProps {
  invoice: MembershipInvoiceData
}

export function InvoiceFooter({ invoice }: InvoiceFooterProps) {
  return (
    <section className="border-x border-b border-border-light bg-white text-sm print:border-zinc-800 print:break-inside-avoid">
      <div className="grid grid-cols-1 gap-0 border-b border-border-light sm:grid-cols-2 print:border-zinc-800">
        <div className="px-3 py-2 text-black">
          <p className="font-semibold">For {invoice.gym.gymName}</p>
          <p className="mt-1 text-xs text-zinc-700 print:text-black">{invoice.gym.address}</p>
          <p className="text-xs text-zinc-700 print:text-black">{invoice.gym.email}</p>
          <p className="text-xs text-zinc-700 print:text-black">{invoice.gym.phone}</p>
        </div>
        <div className="border-t border-border-light px-3 py-2 text-black sm:border-l sm:border-t-0 print:border-zinc-800">
          <p><span className="font-semibold">Created By:</span> {displayText(invoice.staff.createdBy)}</p>
          <p className="mt-1"><span className="font-semibold">Counsellor:</span> {displayText(invoice.staff.counsellor)}</p>
          <p className="mt-1 text-xs text-zinc-700 print:text-black">{invoice.gym.panNumber}</p>
          <p className="text-xs text-zinc-700 print:text-black">{invoice.gym.gstNumber}</p>
        </div>
      </div>

      {invoice.remarks ? (
        <div className="px-3 py-2 text-black">
          <p className="font-semibold">Remarks</p>
          <p className="mt-1 text-sm text-zinc-700 print:text-black">{invoice.remarks}</p>
        </div>
      ) : null}
    </section>
  )
}
