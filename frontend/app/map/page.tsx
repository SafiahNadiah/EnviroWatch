'use client';

import { useEffect, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import monitoringService, { MonitoringRecord } from '@/services/monitoringService';
import { getAQILevel, formatNumber, formatDate } from '@/utils/helpers';

// ArcGIS imports will be loaded dynamically
let Map: any;
let MapView: any;
let Graphic: any;
let GraphicsLayer: any;
let Popup: any;

export default function MapPage() {
  const mapDiv = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [view, setView] = useState<any>(null);
  const [graphicsLayer, setGraphicsLayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [latestRecords, setLatestRecords] = useState<MonitoringRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'air' | 'river' | 'marine'>('all');

  // Load ArcGIS modules
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      loadArcGISModules();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const loadArcGISModules = async () => {
    try {
      // Dynamically import ArcGIS modules
      const [esriConfig, MapModule, MapViewModule, GraphicModule, GraphicsLayerModule] = await Promise.all([
        import('@arcgis/core/config'),
        import('@arcgis/core/Map'),
        import('@arcgis/core/views/MapView'),
        import('@arcgis/core/Graphic'),
        import('@arcgis/core/layers/GraphicsLayer'),
      ]);

      Map = MapModule.default;
      MapView = MapViewModule.default;
      Graphic = GraphicModule.default;
      GraphicsLayer = GraphicsLayerModule.default;

      // Set API key if needed (for production, use environment variable)
      // esriConfig.apiKey = process.env.NEXT_PUBLIC_ARCGIS_API_KEY;

      initializeMap();
    } catch (error) {
      console.error('Error loading ArcGIS modules:', error);
      setLoading(false);
    }
  };

  const initializeMap = async () => {
    if (!mapDiv.current) return;

    try {
      // Create graphics layer for monitoring points
      const layer = new GraphicsLayer();

      // Create map with OpenStreetMap basemap (more stable, non-vector)
      const mapInstance = new Map({
        basemap: 'osm', // OpenStreetMap - raster tiles, more stable
        layers: [layer],
      });

      // Create map view with constraints
      const viewInstance = new MapView({
        container: mapDiv.current,
        map: mapInstance,
        center: [101.6869, 3.1390], // Kuala Lumpur, Malaysia coordinates
        zoom: 11,
        constraints: {
          minZoom: 8,
          maxZoom: 18,
        },
        popup: {
          dockEnabled: true,
          dockOptions: {
            buttonEnabled: false,
            breakpoint: false,
          },
        },
      });

      // Add error handler for view
      viewInstance.on('error', (error: any) => {
        console.warn('Map view error caught:', error);
      });

      setMap(mapInstance);
      setView(viewInstance);
      setGraphicsLayer(layer);

      // Wait for view to be ready
      await viewInstance.when();
      
      // Load monitoring data
      await fetchMonitoringData(layer);
      
      setLoading(false);
    } catch (error) {
      console.error('Error initializing map:', error);
      setLoading(false);
    }
  };

  const fetchMonitoringData = async (layer?: any) => {
    try {
      const response = await monitoringService.getLatestRecords();
      setLatestRecords(response.data.records);
      
      if (layer && response.data.records) {
        addMarkersToMap(response.data.records, layer);
      }
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    }
  };

  const addMarkersToMap = (records: MonitoringRecord[], layer: any) => {
    layer.removeAll();

    records.forEach((record) => {
      if (!record.latitude || !record.longitude) return;

      // Determine marker color based on type and quality
      let color: number[];
      let symbol: string;
      
      if (record.point_type === 'air') {
        symbol = '💨';
        const aqi = record.aqi || 0;
        if (aqi <= 50) color = [34, 197, 94]; // green
        else if (aqi <= 100) color = [234, 179, 8]; // yellow
        else if (aqi <= 150) color = [249, 115, 22]; // orange
        else color = [239, 68, 68]; // red
      } else if (record.point_type === 'river') {
        symbol = '🌊';
        color = [14, 165, 233]; // blue
      } else {
        symbol = '🌊';
        color = [59, 130, 246]; // marine blue
      }

      // Create popup content
      const popupContent = `
        <div style="padding: 10px; min-width: 250px;">
          <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">${record.point_name}</h3>
          <p style="margin: 5px 0; color: #666; font-size: 12px;">
            <strong>Type:</strong> ${record.point_type?.toUpperCase()}
          </p>
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
            ${record.point_type === 'air' ? `
              <p style="margin: 5px 0;"><strong>AQI:</strong> ${record.aqi || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>PM2.5:</strong> ${formatNumber(record.pm25)} µg/m³</p>
              <p style="margin: 5px 0;"><strong>PM10:</strong> ${formatNumber(record.pm10)} µg/m³</p>
              <p style="margin: 5px 0;"><strong>Temperature:</strong> ${formatNumber(record.temperature)}°C</p>
              <p style="margin: 5px 0;"><strong>Humidity:</strong> ${formatNumber(record.humidity)}%</p>
            ` : `
              <p style="margin: 5px 0;"><strong>pH:</strong> ${formatNumber(record.ph)}</p>
              <p style="margin: 5px 0;"><strong>Dissolved Oxygen:</strong> ${formatNumber(record.dissolved_oxygen)} mg/L</p>
              <p style="margin: 5px 0;"><strong>Turbidity:</strong> ${formatNumber(record.turbidity)} NTU</p>
              <p style="margin: 5px 0;"><strong>Temperature:</strong> ${formatNumber(record.temperature)}°C</p>
            `}
          </div>
          <p style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee; font-size: 11px; color: #999;">
            Last updated: ${formatDate(record.recorded_at)}
          </p>
        </div>
      `;

      // Create point graphic
      const point = {
        type: 'point',
        longitude: record.longitude,
        latitude: record.latitude,
      };

      const markerSymbol = {
        type: 'simple-marker',
        color: color,
        size: '14px',
        outline: {
          color: [255, 255, 255],
          width: 2,
        },
      };

      const pointGraphic = new Graphic({
        geometry: point,
        symbol: markerSymbol,
        attributes: record,
        popupTemplate: {
          title: '{point_name}',
          content: popupContent,
        },
      });

      layer.add(pointGraphic);
    });
  };

  const filterMap = (type: 'all' | 'air' | 'river' | 'marine') => {
    setActiveFilter(type);
    
    if (graphicsLayer) {
      const filtered = type === 'all' 
        ? latestRecords 
        : latestRecords.filter(r => r.point_type === type);
      
      addMarkersToMap(filtered, graphicsLayer);
    }
  };

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col">
        <Navbar />
        
        <div className="flex-1 relative" style={{ minHeight: '500px' }}>
          {/* Map Container */}
          <div ref={mapDiv} className="w-full h-full" style={{ minHeight: '500px' }} />

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          )}

          {/* Map Controls */}
          <div className="absolute top-4 left-4 z-10 space-y-2">
            <div className="card p-4 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-3">Layer Filter</h3>
              <div className="space-y-2">
                {(['all', 'air', 'river', 'marine'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => filterMap(filter)}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === filter
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter === 'all' ? '🌍 All Stations' : 
                     filter === 'air' ? '💨 Air Quality' :
                     filter === 'river' ? '🌊 Rivers' :
                     '🌊 Marine/Lakes'}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="card p-4 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-3">Legend</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Good (AQI ≤ 50)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Moderate (51-100)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>Unhealthy (101-150)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Very Unhealthy (&gt;150)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Water Quality</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="card p-4 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-2">Quick Stats</h3>
              <div className="text-sm text-gray-600">
                <p><strong>{latestRecords.length}</strong> Active Stations</p>
                <p className="mt-1">
                  <strong>{latestRecords.filter(r => r.point_type === 'air').length}</strong> Air Quality
                </p>
                <p className="mt-1">
                  <strong>{latestRecords.filter(r => r.point_type === 'river').length}</strong> River
                </p>
                <p className="mt-1">
                  <strong>{latestRecords.filter(r => r.point_type === 'marine').length}</strong> Marine/Lake
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
