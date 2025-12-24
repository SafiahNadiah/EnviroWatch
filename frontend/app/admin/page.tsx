'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import adminService from '@/services/adminService';
import monitoringService, { MonitoringPoint } from '@/services/monitoringService';
import { User } from '@/services/authService';
import { formatDate, getStatusBadge } from '@/utils/helpers';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'points' | 'stats'>('stats');
  const [users, setUsers] = useState<User[]>([]);
  const [monitoringPoints, setMonitoringPoints] = useState<MonitoringPoint[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreatePointModal, setShowCreatePointModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, pointsRes, statsRes] = await Promise.all([
        adminService.getAllUsers(),
        monitoringService.getMonitoringPoints(),
        adminService.getSystemStats(),
      ]);

      setUsers(usersRes.data.users);
      setMonitoringPoints(pointsRes.data.points);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: number, role: 'admin' | 'user') => {
    if (!confirm(`Change user role to ${role}?`)) return;

    try {
      await adminService.updateUserRole(userId, role);
      await fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update user role');
    }
  };

  const toggleUserStatus = async (userId: number, isActive: boolean) => {
    if (!confirm(`${isActive ? 'Deactivate' : 'Activate'} this user?`)) return;

    try {
      await adminService.updateUserStatus(userId, !isActive);
      await fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await adminService.deleteUser(userId);
      await fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const deleteMonitoringPoint = async (pointId: number) => {
    if (!confirm('Delete this monitoring point? All associated records will be deleted.')) return;

    try {
      await monitoringService.deleteMonitoringPoint(pointId);
      await fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete monitoring point');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute adminOnly>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">System management and administration</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'stats'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📊 System Statistics
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'users'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  👥 User Management ({users.length})
                </button>
                <button
                  onClick={() => setActiveTab('points')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'points'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📍 Monitoring Points ({monitoringPoints.length})
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Statistics Tab */}
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Users Card */}
                    <div className="card">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Users</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Users:</span>
                          <span className="font-bold">{stats?.users?.total_users || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Administrators:</span>
                          <span className="font-bold text-primary-600">{stats?.users?.admin_count || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Regular Users:</span>
                          <span className="font-bold">{stats?.users?.user_count || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Active:</span>
                          <span className="font-bold text-green-600">{stats?.users?.active_count || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Monitoring Points Card */}
                    <div className="card">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monitoring Points</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Points:</span>
                          <span className="font-bold">{stats?.monitoringPoints?.total || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Active:</span>
                          <span className="font-bold text-green-600">{stats?.monitoringPoints?.active || 0}</span>
                        </div>
                        {stats?.monitoringPoints?.byType?.map((type: any) => (
                          <div key={type.type} className="flex justify-between capitalize">
                            <span className="text-gray-600">{type.type}:</span>
                            <span className="font-bold">{type.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Records Card */}
                    <div className="card">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monitoring Records</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Active Stations:</span>
                          <span className="font-bold">{stats?.records?.active_stations || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Records (24h):</span>
                          <span className="font-bold">{stats?.records?.total_records || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg AQI:</span>
                          <span className="font-bold">{stats?.records?.avg_aqi ? Math.round(stats.records.avg_aqi) : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Good Air:</span>
                          <span className="font-bold text-green-600">{stats?.records?.good_air_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{user.fullName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`badge ${user.role === 'admin' ? 'badge-danger' : 'badge-info'} capitalize`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                              <button
                                onClick={() => updateUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                              </button>
                              <button
                                onClick={() => toggleUserStatus(user.id, user.isActive || false)}
                                className="text-yellow-600 hover:text-yellow-800"
                              >
                                {user.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Monitoring Points Tab */}
              {activeTab === 'points' && (
                <div>
                  <div className="mb-4">
                    <button className="btn btn-primary">
                      + Add Monitoring Point
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Installed</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {monitoringPoints.map((point) => (
                          <tr key={point.id}>
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{point.name}</div>
                              <div className="text-sm text-gray-500">{point.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="badge badge-info capitalize">{point.type}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {Number(point.latitude).toFixed(4)}, {Number(point.longitude).toFixed(4)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={getStatusBadge(point.status).className}>
                                {getStatusBadge(point.status).text}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {point.installed_date ? formatDate(point.installed_date) : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                              <button className="text-blue-600 hover:text-blue-800">
                                Edit
                              </button>
                              <button
                                onClick={() => deleteMonitoringPoint(point.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
