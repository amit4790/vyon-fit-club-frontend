/**
 * Admin API service
 */

import { httpClient } from '../api/http-client'
import {
  ExpiringSubscriptionsApiResponse,
  InvoiceListApiResponse,
  InvoiceOperationApiResponse,
  InvoiceStatus,
  MemberSubscriptionsApiResponse,
  MemberDeleteApiResponse,
  MemberListApiResponse,
  MemberOperationApiResponse,
  MemberPayload,
  PlanCatalogApiResponse,
  SubscriptionOperationApiResponse,
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

  updateMember: (memberId: number, payload: Partial<MemberPayload>) =>
    httpClient.put<MemberOperationApiResponse>(`/admin/members/${memberId}`, payload),

  deleteMember: (memberId: number) =>
    httpClient.delete<MemberDeleteApiResponse>(`/admin/members/${memberId}`),

  getPlanCatalog: () => httpClient.get<PlanCatalogApiResponse>('/admin/plans'),

  assignSubscription: (memberId: number, payload: { plan_id: number; start_date: string }) =>
    httpClient.post<SubscriptionOperationApiResponse>(`/admin/members/${memberId}/subscriptions`, payload),

  getMemberSubscriptions: (memberId: number) =>
    httpClient.get<MemberSubscriptionsApiResponse>(`/admin/members/${memberId}/subscriptions`),

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

  updateInvoiceStatus: (invoiceId: number, status: InvoiceStatus) =>
    httpClient.patch<InvoiceOperationApiResponse>(`/admin/invoices/${invoiceId}/status`, { status }),

  resendInvoice: (invoiceId: number) =>
    httpClient.post<InvoiceOperationApiResponse>(`/admin/invoices/${invoiceId}/resend`),

  getTrainers: () => httpClient.get('/admin/trainers'),

  getClasses: () => httpClient.get('/admin/classes'),
}
