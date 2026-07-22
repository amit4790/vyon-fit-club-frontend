/**
 * Trainer API service
 */

import { get } from '../api/api'

export const trainerService = {
  getDashboard: () => get('/api/trainer/dashboard'),

  getClients: () => get('/api/trainer/clients'),

  getSchedule: () => get('/api/trainer/schedule'),
}
