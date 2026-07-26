/**
 * Member API service
 */

import { httpClient } from '../api/api'

export const memberService = {
  getDashboard: () => httpClient.get('/api/member/dashboard'),

  getProfile: () => httpClient.get('/api/member/profile'),

  getClasses: () => httpClient.get('/api/member/classes'),

  getBookings: () => httpClient.get('/api/member/bookings'),
}
