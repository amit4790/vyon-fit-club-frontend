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
