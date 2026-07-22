/**
 * Dashboard Service
 * Handles dashboard data retrieval
 */

import { httpClient } from '../api/http-client';
import { API_ENDPOINTS } from '../api/config';
import {
  AdminDashboardResponse,
  TrainerDashboardResponse,
  MemberDashboardResponse,
} from '../api/types';

export class DashboardService {
  /**
   * Fetch admin dashboard data
   */
  static async getAdminDashboard(): Promise<AdminDashboardResponse> {
    try {
      const data = await httpClient.get<AdminDashboardResponse>(
        API_ENDPOINTS.ADMIN_DASHBOARD
      );
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetch trainer dashboard data
   */
  static async getTrainerDashboard(): Promise<TrainerDashboardResponse> {
    try {
      const data = await httpClient.get<TrainerDashboardResponse>(
        API_ENDPOINTS.TRAINER_DASHBOARD
      );
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetch member dashboard data
   */
  static async getMemberDashboard(): Promise<MemberDashboardResponse> {
    try {
      const data = await httpClient.get<MemberDashboardResponse>(
        API_ENDPOINTS.MEMBER_DASHBOARD
      );
      return data;
    } catch (error) {
      throw error;
    }
  }
}
