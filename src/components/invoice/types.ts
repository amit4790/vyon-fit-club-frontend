export type InvoicePaymentStatus = 'PAID' | 'PARTIAL' | 'PENDING' | 'FAILED' | 'CANCELLED'

export interface GymProfile {
  gymName: string
  address: string
  email: string
  phone: string
  gstNumber: string
  panNumber: string
  logoUrl: string
}

export interface InvoiceMemberDetails {
  memberName: string
  memberId: string
}

export interface MembershipLineItem {
  subscriptionName: string
  fromDate: string
  toDate: string
  duration: string
  amount: number
}

export interface InvoicePaymentSummary {
  discount: number
  taxableAmount: number
  paymentMode: string
  finalAmountPayable: number
  amountPaid: number
  sgst: number
  cgst: number
  outstandingBalance: number
}

export interface InvoiceStaffDetails {
  createdBy: string
  counsellor: string
}

export interface MembershipInvoiceData {
  title: string
  invoiceNumber: string
  invoiceDate: string
  invoiceTime: string
  paymentStatus: InvoicePaymentStatus
  billTo: InvoiceMemberDetails
  membership: MembershipLineItem
  paymentSummary: InvoicePaymentSummary
  staff: InvoiceStaffDetails
  gym: GymProfile
  remarks?: string | null
  rules?: string[]

  // Future-ready extension points.
  qrCodeUrl?: string | null
  barcodeValue?: string | null
  digitalSignatureUrl?: string | null
  gymStampUrl?: string | null
}
