/**
 * API Configuration
 * Centralized API base URL and configuration
 */

// Use environment variable for API base URL, fallback to relative URL
const API_BASE_URL_ENV = import.meta.env.VITE_API_BASE_URL || '/api'

export const API_BASE_URL = API_BASE_URL_ENV.endsWith('/api') 
  ? API_BASE_URL_ENV 
  : `${API_BASE_URL_ENV}/api`

export const API_ENDPOINTS = {
  // Health
  HEALTH: '/health',

  // Authentication
  LOGIN: '/auth/login',

  // Dashboard
  ADMIN_DASHBOARD: '/dashboard/admin',
  TRAINER_DASHBOARD: '/dashboard/trainer',
  MEMBER_DASHBOARD: '/dashboard/member',
} as const

export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  withCredentials: true,
} as const
