import { MembershipInvoiceData } from './types'
import { displayText, formatMoney } from './utils'

interface PaymentSummaryProps {
  invoice: MembershipInvoiceData
}

export function PaymentSummary({ invoice }: PaymentSummaryProps) {
  const summary = invoice.paymentSummary

  return (
    <section className="border-x border-b border-border-light bg-white print:border-zinc-800 print:break-inside-avoid">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="border-b border-border-light px-3 py-2 text-sm text-black md:border-b-0 md:border-r print:border-zinc-800">
          <span className="font-semibold">Payment Mode:</span> {displayText(summary.paymentMode)}
        </div>
        <div className="px-0 py-0">
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td className="border-b border-r border-border-light px-3 py-2 font-semibold text-black print:border-zinc-800">Taxable Amount</td>
                <td className="border-b border-border-light px-3 py-2 text-right text-black print:border-zinc-800">INR {formatMoney(summary.taxableAmount)}</td>
              </tr>
              <tr>
                <td className="border-b border-r border-border-light bg-zinc-100 px-3 py-2 font-semibold text-black print:border-zinc-800 print:bg-white">Final Amount Payable</td>
                <td className="border-b border-border-light bg-zinc-100 px-3 py-2 text-right font-semibold text-black print:border-zinc-800 print:bg-white">INR {formatMoney(summary.finalAmountPayable)}</td>
              </tr>
              <tr>
                <td className="border-b border-r border-border-light px-3 py-2 font-semibold text-black print:border-zinc-800">Amount Paid</td>
                <td className="border-b border-border-light px-3 py-2 text-right text-black print:border-zinc-800">INR {formatMoney(summary.amountPaid)}</td>
              </tr>
              <tr>
                <td className="border-b border-r border-border-light px-3 py-2 font-semibold text-black print:border-zinc-800">SGST</td>
                <td className="border-b border-border-light px-3 py-2 text-right text-black print:border-zinc-800">INR {formatMoney(summary.sgst)}</td>
              </tr>
              <tr>
                <td className="border-b border-r border-border-light px-3 py-2 font-semibold text-black print:border-zinc-800">CGST</td>
                <td className="border-b border-border-light px-3 py-2 text-right text-black print:border-zinc-800">INR {formatMoney(summary.cgst)}</td>
              </tr>
              <tr>
                <td className="border-r border-border-light px-3 py-2 font-semibold text-black print:border-zinc-800">Outstanding Balance</td>
                <td className="px-3 py-2 text-right font-semibold text-black">INR {formatMoney(summary.outstandingBalance)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
