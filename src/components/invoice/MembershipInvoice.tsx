import { Button } from '../Button'
import { DEFAULT_GYM_PROFILE, DEFAULT_INVOICE_RULES } from './constants'
import { InvoiceFooter } from './InvoiceFooter'
import { InvoiceHeader } from './InvoiceHeader'
import { InvoiceMemberDetails } from './InvoiceMemberDetails'
import { MembershipTable } from './MembershipTable'
import { PaymentSummary } from './PaymentSummary'
import { RulesSection } from './RulesSection'
import { MembershipInvoiceData } from './types'

interface MembershipInvoiceProps {
  invoice: MembershipInvoiceData
  showDownload?: boolean
  downloading?: boolean
  onDownloadInvoice?: () => void
}

export function MembershipInvoice({
  invoice,
  showDownload = false,
  downloading = false,
  onDownloadInvoice,
}: MembershipInvoiceProps) {
  const mergedInvoice: MembershipInvoiceData = {
    ...invoice,
    gym: {
      ...DEFAULT_GYM_PROFILE,
      ...invoice.gym,
    },
    rules: invoice.rules && invoice.rules.length > 0 ? invoice.rules : DEFAULT_INVOICE_RULES,
  }

  return (
    <article className="mx-auto w-full max-w-[210mm] rounded-lg bg-white p-3 text-black shadow-card print:max-w-none print:rounded-none print:p-0 print:shadow-none">
      {showDownload && onDownloadInvoice ? (
        <div className="mb-3 flex justify-end print:hidden">
          <Button size="sm" onClick={onDownloadInvoice} isLoading={downloading}>
            Download Invoice
          </Button>
        </div>
      ) : null}

      <div className="print:break-inside-avoid">
        <InvoiceHeader invoice={mergedInvoice} />
        <InvoiceMemberDetails invoice={mergedInvoice} />
        <MembershipTable invoice={mergedInvoice} />
        <PaymentSummary invoice={mergedInvoice} />
        <InvoiceFooter invoice={mergedInvoice} />
      </div>

      <RulesSection rules={mergedInvoice.rules || DEFAULT_INVOICE_RULES} />
    </article>
  )
}
