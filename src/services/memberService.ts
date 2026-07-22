/**
 * Member API service
 */

import { get } from '../api/api'

export const memberService = {
  getDashboard: () => get('/api/member/dashboard'),

  getProfile: () => get('/api/member/profile'),

  getClasses: () => get('/api/member/classes'),

  getBookings: () => get('/api/member/bookings'),
}
