import { MembershipInvoiceData } from './types'

interface InvoiceMemberDetailsProps {
  invoice: MembershipInvoiceData
}

export function InvoiceMemberDetails({ invoice }: InvoiceMemberDetailsProps) {
  return (
    <section className="border-x border-b border-border-light bg-white px-4 py-3 print:border-zinc-800 print:px-3 print:py-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-700 print:text-black">Bill To</p>
      <div className="mt-2 grid grid-cols-1 gap-1 text-sm text-black sm:grid-cols-2">
        <p>
          <span className="font-semibold">Member Name:</span> {invoice.billTo.memberName}
        </p>
        <p>
          <span className="font-semibold">Member ID:</span> {invoice.billTo.memberId}
        </p>
      </div>
    </section>
  )
}
