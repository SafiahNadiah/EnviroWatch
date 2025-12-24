const MonitoringRecord = require('../models/MonitoringRecord');

/**
 * Monitoring Records Controller
 * Handles operations for environmental monitoring data
 */
class MonitoringRecordController {
  /**
   * Get all monitoring records with filters
   * GET /api/monitoring-records
   */
  static async getAll(req, res, next) {
    try {
      const { 
        monitoringPointId, 
        startDate, 
        endDate, 
        limit = 100, 
        offset = 0 
      } = req.query;

      const records = await MonitoringRecord.findAll({
        monitoringPointId: monitoringPointId ? parseInt(monitoringPointId) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json({
        success: true,
        data: { records },
        count: records.length,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get latest records for all monitoring points
   * GET /api/monitoring-records/latest
   */
  static async getLatestForAll(req, res, next) {
    try {
      const records = await MonitoringRecord.getLatestForAllPoints();

      res.json({
        success: true,
        data: { records },
        count: records.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get record by ID
   * GET /api/monitoring-records/:id
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const record = await MonitoringRecord.findById(id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Monitoring record not found',
        });
      }

      res.json({
        success: true,
        data: { record },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new monitoring record
   * POST /api/monitoring-records
   */
  static async create(req, res, next) {
    try {
      const recordData = {
        monitoringPointId: req.body.monitoringPointId,
        recordedAt: req.body.recordedAt,
        pm25: req.body.pm25,
        pm10: req.body.pm10,
        aqi: req.body.aqi,
        temperature: req.body.temperature,
        humidity: req.body.humidity,
        ph: req.body.ph,
        dissolvedOxygen: req.body.dissolvedOxygen,
        turbidity: req.body.turbidity,
        conductivity: req.body.conductivity,
        notes: req.body.notes,
      };

      const record = await MonitoringRecord.create(recordData);

      res.status(201).json({
        success: true,
        message: 'Monitoring record created successfully',
        data: { record },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get statistics for a monitoring point
   * GET /api/monitoring-records/stats/:pointId
   */
  static async getStatsByPoint(req, res, next) {
    try {
      const { pointId } = req.params;
      const { days = 7 } = req.query;

      const stats = await MonitoringRecord.getStatsByPoint(
        parseInt(pointId),
        parseInt(days)
      );

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get time series data for charts
   * GET /api/monitoring-records/timeseries
   */
  static async getTimeSeries(req, res, next) {
    try {
      const { monitoringPointId, parameter, startDate, endDate } = req.query;

      if (!monitoringPointId || !parameter || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'monitoringPointId, parameter, startDate, and endDate are required',
        });
      }

      const data = await MonitoringRecord.getTimeSeries({
        monitoringPointId: parseInt(monitoringPointId),
        parameter,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });

      res.json({
        success: true,
        data: {
          timeseries: data,
          parameter,
        },
        count: data.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get dashboard statistics
   * GET /api/monitoring-records/stats/dashboard
   */
  static async getDashboardStats(req, res, next) {
    try {
      const stats = await MonitoringRecord.getDashboardStats();

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MonitoringRecordController;
