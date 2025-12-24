import apiClient from './api';

/**
 * Monitoring Service
 * Handles all monitoring-related API calls (points and records)
 */

export interface MonitoringPoint {
  id: number;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  type: 'air' | 'river' | 'marine';
  status: 'active' | 'inactive' | 'maintenance';
  installed_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MonitoringRecord {
  id: number;
  monitoring_point_id: number;
  recorded_at: string;
  pm25?: number;
  pm10?: number;
  aqi?: number;
  temperature?: number;
  humidity?: number;
  ph?: number;
  dissolved_oxygen?: number;
  turbidity?: number;
  conductivity?: number;
  notes?: string;
  point_name?: string;
  point_type?: string;
  latitude?: number;
  longitude?: number;
}

class MonitoringService {
  /**
   * Get all monitoring points
   */
  async getMonitoringPoints(filters?: { type?: string; status?: string }) {
    const response = await apiClient.get('/api/monitoring-points', { params: filters });
    return response.data;
  }

  /**
   * Get monitoring point by ID
   */
  async getMonitoringPoint(id: number, includeLatest = false) {
    const response = await apiClient.get(`/api/monitoring-points/${id}`, {
      params: { includeLatest },
    });
    return response.data;
  }

  /**
   * Create monitoring point (Admin only)
   */
  async createMonitoringPoint(data: Partial<MonitoringPoint>) {
    const response = await apiClient.post('/api/monitoring-points', data);
    return response.data;
  }

  /**
   * Update monitoring point (Admin only)
   */
  async updateMonitoringPoint(id: number, data: Partial<MonitoringPoint>) {
    const response = await apiClient.put(`/api/monitoring-points/${id}`, data);
    return response.data;
  }

  /**
   * Delete monitoring point (Admin only)
   */
  async deleteMonitoringPoint(id: number) {
    const response = await apiClient.delete(`/api/monitoring-points/${id}`);
    return response.data;
  }

  /**
   * Get monitoring points statistics by type
   */
  async getPointStatsByType() {
    const response = await apiClient.get('/api/monitoring-points/stats/by-type');
    return response.data;
  }

  /**
   * Get monitoring records
   */
  async getMonitoringRecords(filters?: {
    monitoringPointId?: number;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) {
    const response = await apiClient.get('/api/monitoring-records', { params: filters });
    return response.data;
  }

  /**
   * Get latest records for all monitoring points
   */
  async getLatestRecords() {
    const response = await apiClient.get('/api/monitoring-records/latest');
    return response.data;
  }

  /**
   * Get record by ID
   */
  async getMonitoringRecord(id: number) {
    const response = await apiClient.get(`/api/monitoring-records/${id}`);
    return response.data;
  }

  /**
   * Create monitoring record
   */
  async createMonitoringRecord(data: Partial<MonitoringRecord>) {
    const response = await apiClient.post('/api/monitoring-records', data);
    return response.data;
  }

  /**
   * Get statistics for a monitoring point
   */
  async getPointStats(pointId: number, days = 7) {
    const response = await apiClient.get(`/api/monitoring-records/stats/${pointId}`, {
      params: { days },
    });
    return response.data;
  }

  /**
   * Get time series data for charts
   */
  async getTimeSeries(params: {
    monitoringPointId: number;
    parameter: string;
    startDate: string;
    endDate: string;
  }) {
    const response = await apiClient.get('/api/monitoring-records/timeseries', { params });
    return response.data;
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const response = await apiClient.get('/api/monitoring-records/stats/dashboard');
    return response.data;
  }
}

export default new MonitoringService();
