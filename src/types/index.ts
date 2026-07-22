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
