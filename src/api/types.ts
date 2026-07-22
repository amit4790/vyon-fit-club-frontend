/**
 * API Types
 * Type definitions for API requests and responses
 */

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'member';
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: UserInfo;
}

// Dashboard Types
export interface RecentRegistration {
  name: string;
  email: string;
  registration_date: string;
}

export interface AdminDashboardResponse {
  total_members: number;
  active_members: number;
  monthly_revenue: number;
  expiring_memberships: number;
  todays_checkins: number;
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
