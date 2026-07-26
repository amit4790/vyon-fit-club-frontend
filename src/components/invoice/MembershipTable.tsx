import { MembershipInvoiceData } from './types'
import { formatMoney } from './utils'

interface MembershipTableProps {
  invoice: MembershipInvoiceData
}

export function MembershipTable({ invoice }: MembershipTableProps) {
  const item = invoice.membership

  return (
    <section className="border-x border-b border-border-light bg-white print:border-zinc-800 print:break-inside-avoid">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-700 print:bg-white print:text-black">
              <th className="border-b border-r border-border-light px-3 py-2 font-semibold print:border-zinc-800">Subscription Name</th>
              <th className="border-b border-r border-border-light px-3 py-2 font-semibold print:border-zinc-800">From Date</th>
              <th className="border-b border-r border-border-light px-3 py-2 font-semibold print:border-zinc-800">To Date</th>
              <th className="border-b border-r border-border-light px-3 py-2 font-semibold print:border-zinc-800">Duration</th>
              <th className="border-b border-border-light px-3 py-2 text-right font-semibold print:border-zinc-800">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-black">
              <td className="border-r border-border-light px-3 py-2 print:border-zinc-800">{item.subscriptionName}</td>
              <td className="border-r border-border-light px-3 py-2 print:border-zinc-800">{item.fromDate}</td>
              <td className="border-r border-border-light px-3 py-2 print:border-zinc-800">{item.toDate}</td>
              <td className="border-r border-border-light px-3 py-2 print:border-zinc-800">{item.duration}</td>
              <td className="px-3 py-2 text-right font-semibold">INR {formatMoney(item.amount)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
