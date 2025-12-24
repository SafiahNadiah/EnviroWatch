'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import monitoringService, { MonitoringRecord } from '@/services/monitoringService';
import { getAQILevel, formatNumber, formatDate, getPointTypeIcon } from '@/utils/helpers';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [latestRecords, setLatestRecords] = useState<MonitoringRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'air' | 'river' | 'marine'>('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, latestRes] = await Promise.all([
        monitoringService.getDashboardStats(),
        monitoringService.getLatestRecords(),
      ]);

      setStats(statsRes.data.stats);
      setLatestRecords(latestRes.data.records);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = latestRecords.filter(record => {
    if (activeFilter === 'all') return true;
    return record.point_type === activeFilter;
  });

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  const avgAQI = stats?.avg_aqi ? Math.round(Number(stats.avg_aqi)) : 0;
  const aqiInfo = getAQILevel(avgAQI);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Environmental Dashboard</h1>
            <p className="text-gray-600 mt-2">Real-time monitoring data and insights</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Stations</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats?.active_stations || 0}
                  </p>
                </div>
                <div className="bg-primary-100 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average AQI</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{avgAQI}</p>
                  <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${aqiInfo.bgColor} ${aqiInfo.color}`}>
                    {aqiInfo.level}
                  </span>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Good Air Quality</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {stats?.good_air_count || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">AQI ≤ 50</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Records (24h)</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stats?.total_records || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link href="/map" className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">View Map</h3>
                  <p className="text-sm text-gray-600">Interactive GIS map</p>
                </div>
              </div>
            </Link>

            <Link href="/chatbot" className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="bg-secondary-100 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                  <p className="text-sm text-gray-600">Ask about data insights</p>
                </div>
              </div>
            </Link>

            <div className="card bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">All Systems Operational</h3>
                  <p className="text-sm text-white/80">Monitoring active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Records Table */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Latest Monitoring Data</h2>
              <div className="flex space-x-2">
                {(['all', 'air', 'river', 'marine'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === filter
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Station
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parameters
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.slice(0, 10).map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">{getPointTypeIcon(record.point_type || '')}</span>
                          <div className="text-sm font-medium text-gray-900">{record.point_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="badge badge-info capitalize">{record.point_type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {record.point_type === 'air' ? (
                            <>
                              <div>AQI: <strong>{record.aqi || 'N/A'}</strong></div>
                              <div className="text-xs text-gray-500">
                                PM2.5: {formatNumber(record.pm25)} µg/m³
                              </div>
                            </>
                          ) : (
                            <>
                              <div>pH: <strong>{formatNumber(record.ph)}</strong></div>
                              <div className="text-xs text-gray-500">
                                DO: {formatNumber(record.dissolved_oxygen)} mg/L
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.point_type === 'air' && record.aqi !== null && record.aqi !== undefined ? (
                          <span className={`badge ${getAQILevel(Number(record.aqi)).bgColor} ${getAQILevel(Number(record.aqi)).color}`}>
                            {getAQILevel(Number(record.aqi)).level}
                          </span>
                        ) : (
                          <span className="badge badge-success">Active</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(record.recorded_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRecords.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No monitoring data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
