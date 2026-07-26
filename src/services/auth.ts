/**
 * Authentication Service
 * Handles login and authentication operations
 */

import { httpClient } from '../api/http-client';
import { API_ENDPOINTS } from '../api/config';
import { LoginRequest, LoginResponse, UserInfo } from '../api/types';
import { canAccessAdmin } from '../auth/authorization';
import { USER_ROLES, UserRole } from '../auth/roles';

export class AuthService {
  /**
   * Login user with email and password
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await httpClient.post<LoginResponse>(
        API_ENDPOINTS.LOGIN,
        credentials
      );

      // Store authentication data
      if (response.success) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userRole', response.user.role);
        localStorage.setItem('userName', response.user.name);
        localStorage.setItem('userId', response.user.id);
        localStorage.setItem('userEmail', response.user.email);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user
   */
  static logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
  }

  /**
   * Get stored authentication token
   */
  static getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Get stored user role
   */
  static getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  /**
   * Get stored user information
   */
  static getUserInfo(): UserInfo | null {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    return {
      id: localStorage.getItem('userId') || '',
      name: localStorage.getItem('userName') || '',
      email: localStorage.getItem('userEmail') || '',
      role: (localStorage.getItem('userRole') || USER_ROLES.MEMBER) as UserRole,
    };
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  /**
   * Check if user has specific role
   */
  static hasRole(role: string): boolean {
    const currentRole = this.getUserRole();
    if (!currentRole) {
      return false;
    }
    return currentRole === role;
  }

  static canAccessAdmin(): boolean {
    return canAccessAdmin(this.getUserRole());
  }
}
