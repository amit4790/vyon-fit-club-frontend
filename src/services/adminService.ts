/**
 * Admin API service
 */

import { get } from '../api/api'
import { ApiResponse } from '../types'

export const adminService = {
  getDashboard: () => get('/api/admin/dashboard'),

  getMembers: () => get('/api/admin/members'),

  getTrainers: () => get('/api/admin/trainers'),

  getClasses: () => get('/api/admin/classes'),
}
