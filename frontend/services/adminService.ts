import apiClient from './api';
import { User } from './authService';

/**
 * Admin Service
 * Handles all admin-related API calls (Admin only)
 */

export interface SystemStats {
  users: {
    total_users: number;
    admin_count: number;
    user_count: number;
    active_count: number;
  };
  monitoringPoints: {
    total: number;
    active: number;
    byType: Array<{
      type: string;
      count: number;
      active_count: number;
      inactive_count: number;
      maintenance_count: number;
    }>;
  };
  records: {
    active_stations: number;
    total_records: number;
    avg_aqi: number;
    avg_pm25: number;
    unhealthy_air_count: number;
    good_air_count: number;
  };
}

class AdminService {
  /**
   * Get all users
   */
  async getAllUsers() {
    const response = await apiClient.get('/api/admin/users');
    return response.data;
  }

  /**
   * Get user by ID
   */
  async getUser(id: number) {
    const response = await apiClient.get(`/api/admin/users/${id}`);
    return response.data;
  }

  /**
   * Update user role
   */
  async updateUserRole(id: number, role: 'admin' | 'user') {
    const response = await apiClient.put(`/api/admin/users/${id}/role`, { role });
    return response.data;
  }

  /**
   * Update user active status
   */
  async updateUserStatus(id: number, isActive: boolean) {
    const response = await apiClient.put(`/api/admin/users/${id}/status`, { isActive });
    return response.data;
  }

  /**
   * Delete user
   */
  async deleteUser(id: number) {
    const response = await apiClient.delete(`/api/admin/users/${id}`);
    return response.data;
  }

  /**
   * Get system statistics
   */
  async getSystemStats() {
    const response = await apiClient.get('/api/admin/stats');
    return response.data;
  }

  /**
   * Get system health
   */
  async getSystemHealth() {
    const response = await apiClient.get('/api/admin/health');
    return response.data;
  }

  /**
   * Get activity logs
   */
  async getActivityLogs() {
    const response = await apiClient.get('/api/admin/logs');
    return response.data;
  }
}

export default new AdminService();
