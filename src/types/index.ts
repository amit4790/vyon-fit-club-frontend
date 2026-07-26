/**
 * Common TypeScript types and interfaces
 */

export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'trainer' | 'member'
}

export interface Member extends User {
  membership_type: string
  join_date: string
  status: 'active' | 'inactive' | 'suspended'
}

export interface MemberRecord {
  id: number
  full_name: string
  mobile_number: string
  joining_date: string
  status: 'active' | 'inactive'
  email?: string | null
  date_of_birth?: string | null
  gender?: 'male' | 'female' | 'other' | null
  address?: string | null
  emergency_contact?: string | null
  emergency_phone?: string | null
  notes?: string | null
  current_plan_label?: string | null
  membership_status?: 'active' | 'expired' | 'none'
  membership_expiry_date?: string | null
}

export interface MemberPayload {
  full_name: string
  mobile_number: string
  joining_date?: string
  status?: 'active' | 'inactive'
  email?: string | null
  date_of_birth?: string | null
  gender?: 'male' | 'female' | 'other' | null
  address?: string | null
  emergency_contact?: string | null
  emergency_phone?: string | null
  notes?: string | null
}

export interface MemberListPagination {
  page: number
  page_size: number
  total_items: number
  total_pages: number
}

export interface MemberListApiResponse {
  message: string
  data: MemberRecord[]
  pagination: MemberListPagination
}

export interface MemberOperationApiResponse {
  message: string
  data: MemberRecord
}

export interface MemberDeleteApiResponse {
  message: string
}

export interface PlanOptionRecord {
  id: number
  sku: string
  label: string
  variant: string | null
  duration_months: number
  duration_label: string
  base_price: number
  tax_percent: number
  tax_amount: number
  total_price: number
}

export interface PlanFamilyRecord {
  family: string
  description: string
  includes: string[]
  options: PlanOptionRecord[]
}

export interface PlanCatalogApiResponse {
  message: string
  data: PlanFamilyRecord[]
}

export interface PlanOptionOperationApiResponse {
  message: string
  data: PlanOptionRecord
}

export interface TrainerRecord {
  id: number
  full_name: string
  email: string
  role: string
  is_active: boolean
}

export interface TrainerPayload {
  full_name: string
  email: string
  is_active?: boolean
}

export interface TrainerListApiResponse {
  message: string
  data: TrainerRecord[]
}

export interface TrainerOperationApiResponse {
  message: string
  data: TrainerRecord
}

export interface TrainerDeleteApiResponse {
  message: string
}

export interface SubscriptionRecord {
  id: number
  member_id: number
  member_name?: string | null
  plan_id: number
  plan_family: string
  plan_variant: string | null
  plan_label: string
  duration_label: string
  start_date: string
  end_date: string
  status: string
  base_price: number
  tax_percent: number
  tax_amount: number
  total_amount: number
  payment_status: string
}

export type PaymentMode = 'cash' | 'upi' | 'card' | 'bank_transfer'

export interface SubscriptionOperationApiResponse {
  message: string
  data: SubscriptionRecord
  notifications?: DeliveryResultRecord[]
}

export interface MemberSubscriptionsApiResponse {
  message: string
  data: SubscriptionRecord[]
}

export interface ExpiringSubscriptionsApiResponse {
  message: string
  data: SubscriptionRecord[]
  pagination: {
    page: number
    page_size: number
    total_items: number
    total_pages: number
    days: number
  }
}

export type InvoiceStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

export interface DeliveryResultRecord {
  channel: 'email' | 'sms'
  target: string | null
  status: 'sent' | 'skipped'
  message: string
  mock_message_id: string | null
}

export interface InvoiceRecord {
  id: number
  invoice_number: string | null
  member_id: number
  member_name: string
  member_email: string | null
  member_phone: string | null
  subscription_id: number
  plan_label: string
  amount: number
  original_price: number | null
  final_amount_received: number | null
  discount_amount: number | null
  discount_percentage: number | null
  gst_amount: number | null
  total_paid: number | null
  payment_mode: string | null
  transaction_reference: string | null
  payment_date: string | null
  notes: string | null
  invoice_download_url: string | null
  status: InvoiceStatus
  issued_at: string
  paid_at: string | null
}

export interface InvoiceListApiResponse {
  message: string
  data: InvoiceRecord[]
  pagination: {
    page: number
    page_size: number
    total_items: number
    total_pages: number
  }
}

export interface InvoiceOperationApiResponse {
  message: string
  data: InvoiceRecord
  notifications: DeliveryResultRecord[]
}

export interface CapturePaymentPayload {
  final_amount_received: number
  payment_mode: PaymentMode
  transaction_reference?: string | null
  payment_date: string
  notes?: string | null
}

export interface CapturePaymentApiResponse {
  message: string
  data: InvoiceRecord
}

export interface Trainer extends User {
  specialization: string
  clients: number
  rating: number
}

export interface Class {
  id: number
  name: string
  trainer: string
  schedule: string
  capacity: number
  enrolled: number
}

export interface ApiResponse<T = any> {
  message: string
  data: T
  status?: 'success' | 'error'
}
