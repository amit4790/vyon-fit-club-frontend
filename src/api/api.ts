/**
 * API Service - Public API
 * Aggregated API service for all backend operations
 */

export { httpClient } from './http-client';
export { AuthService } from '../services/auth';
export { DashboardService } from '../services/dashboard';
export type {
  LoginRequest,
  LoginResponse,
  UserInfo,
  AdminDashboardResponse,
  TrainerDashboardResponse,
  MemberDashboardResponse,
  HealthResponse,
} from './types';
