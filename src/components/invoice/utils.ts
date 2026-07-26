import { InvoicePaymentStatus } from './types'

export function formatMoney(value: number): string {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function displayText(value?: string | null): string {
  const normalized = value?.trim()
  return normalized ? normalized : '-'
}

export function getStatusBadgeClass(status: InvoicePaymentStatus): string {
  if (status === 'PAID') {
    return 'bg-emerald-100 text-emerald-800 border-emerald-200 print:bg-white print:text-black print:border-black'
  }

  if (status === 'PARTIAL') {
    return 'bg-amber-100 text-amber-800 border-amber-200 print:bg-white print:text-black print:border-black'
  }

  if (status === 'PENDING') {
    return 'bg-zinc-100 text-zinc-800 border-zinc-200 print:bg-white print:text-black print:border-black'
  }

  return 'bg-rose-100 text-rose-800 border-rose-200 print:bg-white print:text-black print:border-black'
}
