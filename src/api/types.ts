/**
 * API Types
 * Type definitions for API requests and responses
 */

import { UserRole } from '../auth/roles'

// Authentication Types
export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: UserInfo;
}

// Dashboard Types
export interface RecentRegistration {
  name: string;
  email: string | null;
  registration_date: string;
}

export interface AdminDashboardResponse {
  total_members: number;
  active_members: number;
  inactive_members?: number | null;
  monthly_revenue: number | null;
  expiring_memberships: number | null;
  todays_checkins: number | null;
  recent_registrations: RecentRegistration[];
}

export interface Session {
  id: string;
  member_name: string;
  time: string;
  duration: number;
}

export interface TrainerDashboardResponse {
  trainer_name: string;
  assigned_members: number;
  todays_sessions: number;
  upcoming_sessions: Session[];
  attendance_summary: Record<string, number>;
}

export interface MemberAttendance {
  date: string;
  duration: number;
  workout_type: string;
}

export interface MemberDashboardResponse {
  member_name: string;
  membership_plan: string;
  expiry_date: string;
  remaining_days: number;
  assigned_trainer: string | null;
  attendance_count: number;
  recent_visits: MemberAttendance[];
}

// Health Check Types
export interface HealthResponse {
  status: string;
  message: string;
}
