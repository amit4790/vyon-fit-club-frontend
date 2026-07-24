/**
 * Admin API service
 */

import { httpClient } from '../api/http-client'
import {
  MemberDeleteApiResponse,
  MemberListApiResponse,
  MemberOperationApiResponse,
  MemberPayload,
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

  getTrainers: () => httpClient.get('/admin/trainers'),

  getClasses: () => httpClient.get('/admin/classes'),
}
