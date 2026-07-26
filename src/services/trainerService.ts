/**
 * Trainer API service
 */

import { httpClient } from '../api/api'

export const trainerService = {
  getDashboard: () => httpClient.get('/api/trainer/dashboard'),

  getClients: () => httpClient.get('/api/trainer/clients'),

  getSchedule: () => httpClient.get('/api/trainer/schedule'),
}
