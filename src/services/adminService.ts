/**
 * Admin API service
 */

import { httpClient } from '../api/http-client'
import {
  CapturePaymentApiResponse,
  CapturePaymentPayload,
  ExpiringSubscriptionsApiResponse,
  InvoiceListApiResponse,
  InvoiceOperationApiResponse,
  InvoiceStatus,
  AssignSubscriptionPayload,
  ChangeSubscriptionPlanPayload,
  MemberSubscriptionsApiResponse,
  MemberDeleteApiResponse,
  MemberListApiResponse,
  MemberOperationApiResponse,
  MemberPayload,
  PlanCatalogApiResponse,
  PlanOptionOperationApiResponse,
  SubscriptionOperationApiResponse,
  TrainerDeleteApiResponse,
  TrainerDeviceSyncApiResponse,
  TrainerListApiResponse,
  TrainerOperationApiResponse,
  TrainerPayload,
  AdminUserPayload,
  AdminUserOperationApiResponse,
  ReportsSummaryApiResponse,
  AdminProfileApiResponse,
  TrainerDetailApiResponse,
  PushDeviceListApiResponse,
  DeviceSyncApiResponse,
  DailyAttendanceApiResponse,
  MonthlyAttendanceApiResponse,
  AssignableMembersApiResponse,
  AssignMemberToTrainerApiResponse,
  AssignMemberToTrainerPayload,
  UnassignMemberFromTrainerApiResponse,
} from '../types'

export const adminService = {
  getDashboard: () => httpClient.get('/dashboard/admin'),

  getMembers: (params: { page: number; pageSize: number; search?: string }) => {
    const query = new URLSearchParams({
      page: params.page.toString(),
      page_size: params.pageSize.toString(),
    })

    if (params.search?.trim()) {
      query.set('search', params.search.trim())
    }

    return httpClient.get<MemberListApiResponse>(`/admin/members?${query.toString()}`)
  },

  createMember: (payload: MemberPayload) =>
    httpClient.post<MemberOperationApiResponse>('/admin/members', payload),

  getMemberById: (memberId: number) =>
    httpClient.get<MemberOperationApiResponse>(`/admin/members/${memberId}`),

  updateMember: (memberId: number, payload: Partial<MemberPayload>) =>
    httpClient.put<MemberOperationApiResponse>(`/admin/members/${memberId}`, payload),

  deleteMember: (memberId: number) =>
    httpClient.delete<MemberDeleteApiResponse>(`/admin/members/${memberId}`),

  exportMembersExcel: () =>
    httpClient.get<Blob>('/admin/members/export', {
      responseType: 'blob',
      timeout: 120000,
    }),

  getPlanCatalog: () => httpClient.get<PlanCatalogApiResponse>('/admin/plans'),

  updatePlanPrice: (planId: number, payload: { base_price: number; tax_percent?: number }) =>
    httpClient.patch<PlanOptionOperationApiResponse>(`/admin/plans/${planId}`, payload),

  assignSubscription: (memberId: number, payload: AssignSubscriptionPayload) =>
    httpClient.post<SubscriptionOperationApiResponse>(`/admin/members/${memberId}/subscriptions`, payload),

  changeSubscriptionPlan: (subscriptionId: number, payload: ChangeSubscriptionPlanPayload) =>
    httpClient.patch<SubscriptionOperationApiResponse>(`/admin/subscriptions/${subscriptionId}/plan`, payload),

  getMemberSubscriptions: (memberId: number) =>
    httpClient.get<MemberSubscriptionsApiResponse>(`/admin/members/${memberId}/subscriptions`),

  getSubscriptionById: (subscriptionId: number) =>
    httpClient.get<SubscriptionOperationApiResponse>(`/admin/subscriptions/${subscriptionId}`),

  captureSubscriptionPayment: (subscriptionId: number, payload: CapturePaymentPayload) =>
    httpClient.post<CapturePaymentApiResponse>(`/admin/subscriptions/${subscriptionId}/payment`, payload),

  getExpiringSubscriptions: (params: { days: number; page: number; pageSize: number }) => {
    const query = new URLSearchParams({
      days: params.days.toString(),
      page: params.page.toString(),
      page_size: params.pageSize.toString(),
    })

    return httpClient.get<ExpiringSubscriptionsApiResponse>(`/admin/subscriptions/expiring?${query.toString()}`)
  },

  getInvoices: (params: {
    page: number
    pageSize: number
    status?: InvoiceStatus
    memberId?: number
  }) => {
    const query = new URLSearchParams({
      page: params.page.toString(),
      page_size: params.pageSize.toString(),
    })

    if (params.status) {
      query.set('status', params.status)
    }

    if (params.memberId) {
      query.set('member_id', String(params.memberId))
    }

    return httpClient.get<InvoiceListApiResponse>(`/admin/invoices?${query.toString()}`)
  },

  getInvoiceById: (invoiceId: number) =>
    httpClient.get<InvoiceOperationApiResponse>(`/admin/invoices/${invoiceId}`),

  downloadInvoicePdf: (invoiceId: number) =>
    httpClient.get<Blob>(`/admin/invoices/${invoiceId}/download`, { responseType: 'blob' }),

  updateInvoiceStatus: (invoiceId: number, status: InvoiceStatus) =>
    httpClient.patch<InvoiceOperationApiResponse>(`/admin/invoices/${invoiceId}/status`, { status }),

  resendInvoice: (invoiceId: number) =>
    httpClient.post<InvoiceOperationApiResponse>(`/admin/invoices/${invoiceId}/resend`),

  getTrainers: () => httpClient.get<TrainerListApiResponse>('/admin/trainers'),

  getTrainerById: (trainerId: number) =>
    httpClient.get<TrainerDetailApiResponse>(`/admin/trainers/${trainerId}`),

  searchAssignableMembers: (trainerId: number, search?: string) => {
    const query = new URLSearchParams()
    if (search?.trim()) {
      query.set('search', search.trim())
    }
    const suffix = query.toString() ? `?${query.toString()}` : ''
    return httpClient.get<AssignableMembersApiResponse>(
      `/admin/trainers/${trainerId}/assignable-members${suffix}`
    )
  },

  assignMemberToTrainer: (trainerId: number, payload: AssignMemberToTrainerPayload) =>
    httpClient.post<AssignMemberToTrainerApiResponse>(`/admin/trainers/${trainerId}/members`, payload),

  unassignMemberFromTrainer: (trainerId: number, memberId: number) =>
    httpClient.delete<UnassignMemberFromTrainerApiResponse>(
      `/admin/trainers/${trainerId}/members/${memberId}`
    ),

  createTrainer: (payload: TrainerPayload) =>
    httpClient.post<TrainerOperationApiResponse>('/admin/trainers', payload),

  createAdminUser: (payload: AdminUserPayload) =>
    httpClient.post<AdminUserOperationApiResponse>('/admin/users/admins', payload),

  updateTrainer: (trainerId: number, payload: Partial<TrainerPayload>) =>
    httpClient.put<TrainerOperationApiResponse>(`/admin/trainers/${trainerId}`, payload),

  deleteTrainer: (trainerId: number) =>
    httpClient.delete<TrainerDeleteApiResponse>(`/admin/trainers/${trainerId}`),

  syncTrainersToDevices: () =>
    httpClient.post<TrainerDeviceSyncApiResponse>('/admin/trainers/sync-devices'),

  getClasses: () => httpClient.get('/admin/classes'),

  getReportsSummary: () => httpClient.get<ReportsSummaryApiResponse>('/admin/reports/summary'),

  updateTargetRevenue: (targetRevenue: number) =>
    httpClient.patch<ReportsSummaryApiResponse>('/admin/reports/target-revenue', {
      target_revenue: targetRevenue,
    }),

  getDailyAttendance: (day: string) =>
    httpClient.get<DailyAttendanceApiResponse>('/admin/attendance/daily', { params: { day } }),

  getMonthlyAttendance: (year: number, month: number) =>
    httpClient.get<MonthlyAttendanceApiResponse>('/admin/attendance/monthly', {
      params: { year, month },
    }),

  exportMonthlyAttendanceCsv: (year: number, month: number) =>
    httpClient.get<Blob>('/admin/attendance/export', {
      params: { year, month },
      responseType: 'blob',
    }),

  getProfile: () => httpClient.get<AdminProfileApiResponse>('/admin/profile'),

  getPushDevices: () => httpClient.get<PushDeviceListApiResponse>('/device/devices'),

  syncMemberToDevice: (deviceSn: string, userId: number) =>
    httpClient.post<DeviceSyncApiResponse>(`/device/${encodeURIComponent(deviceSn)}/sync-user/${userId}`),

  resyncAllMembersToDevice: (deviceSn: string) =>
    httpClient.post<DeviceSyncApiResponse>(
      `/device/${encodeURIComponent(deviceSn)}/resync`,
      undefined,
      { timeout: 120000 }
    ),
}
