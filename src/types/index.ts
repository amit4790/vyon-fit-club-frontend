/**
 * Common TypeScript types and interfaces
 */

import { UserRole } from '../auth/roles'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
}

export interface Member extends User {
  membership_type: string
  join_date: string
  status: 'active' | 'inactive' | 'suspended'
}

export interface ActiveMembershipSummary {
  subscription_id: number
  plan_label: string
  end_date: string
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
  device_sync_status?: string | null
  last_device_sync_at?: string | null
  current_plan_label?: string | null
  membership_status?:
    | 'active'
    | 'active_pending_payment'
    | 'inactive_unpaid'
    | 'expired'
    | 'none'
    | null
  membership_start_date?: string | null
  membership_expiry_date?: string | null
  payment_status?: string | null
  focus_subscription_id?: number | null
  active_memberships?: ActiveMembershipSummary[]
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

export type SubscriptionDurationUnit = 'months' | 'days'

export interface AssignSubscriptionPayload {
  plan_id: number
  start_date: string
  duration_value?: number
  duration_unit?: SubscriptionDurationUnit
  bonus_duration_value?: number
  bonus_duration_unit?: SubscriptionDurationUnit
}

export interface ChangeSubscriptionPlanPayload {
  plan_id: number
  start_date?: string
  duration_value?: number
  duration_unit?: SubscriptionDurationUnit
  bonus_duration_value?: number
  bonus_duration_unit?: SubscriptionDurationUnit
}

export interface TrainerRecord {
  id: number
  full_name: string
  email: string
  phone_number?: string | null
  specialization?: string | null
  role: string
  is_active: boolean
  assigned_member_count?: number
}

export interface TrainerPayload {
  full_name: string
  email: string
  phone_number: string
  temporary_password?: string
  specialization?: string | null
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

export interface TrainerDeviceSyncApiResponse {
  message: string
  trainers_queued: number
  commands_queued: number
}

export interface DailyAttendanceRow {
  person_id: number
  person_name: string
  specialization?: string | null
  pin: number
  punched_at: string
  is_late: boolean
}

export interface DailyAttendanceApiResponse {
  message: string
  date: string
  data: DailyAttendanceRow[]
}

export interface MonthlyAttendanceRow {
  person_id: number
  person_name: string
  specialization?: string | null
  days_present: number
  on_time_days: number
  late_days: number
  last_check_in: string | null
}

export interface MonthlyAttendanceApiResponse {
  message: string
  year: number
  month: number
  data: MonthlyAttendanceRow[]
}

export interface AdminUserRecord {
  id: number
  full_name: string
  email: string
  phone_number: string | null
  role: string
  is_active: boolean
}

export interface AdminUserPayload {
  full_name: string
  email: string
  phone_number: string
  password: string
  is_active?: boolean
}

export interface AdminUserOperationApiResponse {
  message: string
  data: AdminUserRecord
}

export interface ReportsSummaryRecord {
  total_members: number
  active_members: number
  total_invoices: number
  paid_invoices: number
  pending_invoices: number
  collected_revenue: number
  outstanding_revenue: number
  target_revenue: number
  revenue_gap: number
  average_invoice_value: number
  expiring_memberships_next_30_days: number
}

export interface ReportsSummaryApiResponse {
  message: string
  data: ReportsSummaryRecord
}

export interface AdminProfileRecord {
  id: number
  full_name: string
  email: string
  phone_number: string | null
  role: string
  is_active: boolean
  joined_date: string
}

export interface TrainerAssignedMember {
  id: number
  full_name: string
  mobile_number: string
  status?: string | null
  assigned_at?: string | null
}

export interface TrainerDetailRecord {
  id: number
  full_name: string
  email: string
  phone_number: string | null
  specialization: string | null
  role: string
  is_active: boolean
  assigned_member_count?: number
  assigned_members: TrainerAssignedMember[]
}

export interface TrainerDetailApiResponse {
  message: string
  data: TrainerDetailRecord
}

export interface AssignableMemberRecord {
  id: number
  full_name: string
  mobile_number: string
  status: string
  current_trainer_id: number | null
}

export interface AssignableMembersApiResponse {
  message: string
  data: AssignableMemberRecord[]
}

export interface AssignMemberToTrainerPayload {
  member_id: number
}

export interface AssignMemberToTrainerApiResponse {
  message: string
  data: TrainerAssignedMember
}

export interface UnassignMemberFromTrainerApiResponse {
  message: string
}

export interface AdminProfileApiResponse {
  id: number
  full_name: string
  email: string
  phone_number: string | null
  role: string
  is_active: boolean
  joined_date: string
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
  duration_value?: number | null
  duration_unit?: SubscriptionDurationUnit | null
  bonus_duration_value?: number | null
  bonus_duration_unit?: SubscriptionDurationUnit | null
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

export type InvoiceStatus = 'pending' | 'partial' | 'paid' | 'failed' | 'cancelled'

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
  amount_paid_today: number | null
  outstanding_balance: number | null
  total_paid: number | null
  payment_mode: string | null
  transaction_reference: string | null
  payment_date: string | null
  counsellor: string | null
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
  amount_paid_today: number
  original_price?: number | null
  payment_mode: PaymentMode
  transaction_reference?: string | null
  payment_date: string
  counsellor?: string | null
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

export interface PushDeviceRecord {
  id: number
  serial_number: string
  device_name?: string | null
  is_active: boolean
  last_seen?: string | null
}

export interface PushDeviceListApiResponse {
  devices: PushDeviceRecord[]
}

export interface DeviceSyncApiResponse {
  status: string
  device_sn: string
  queued_commands: number
  members_synced?: number
  user_id?: number
}
