const MonitoringPoint = require('../models/MonitoringPoint');

/**
 * Monitoring Points Controller
 * Handles CRUD operations for monitoring points (GIS locations)
 */
class MonitoringPointController {
  /**
   * Get all monitoring points
   * GET /api/monitoring-points
   */
  static async getAll(req, res, next) {
    try {
      const { type, status } = req.query;

      const points = await MonitoringPoint.findAll({ type, status });

      res.json({
        success: true,
        data: { points },
        count: points.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get monitoring point by ID
   * GET /api/monitoring-points/:id
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const { includeLatest } = req.query;

      let point;
      if (includeLatest === 'true') {
        point = await MonitoringPoint.findWithLatestRecord(id);
      } else {
        point = await MonitoringPoint.findById(id);
      }

      if (!point) {
        return res.status(404).json({
          success: false,
          message: 'Monitoring point not found',
        });
      }

      res.json({
        success: true,
        data: { point },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new monitoring point
   * POST /api/monitoring-points
   * Admin only
   */
  static async create(req, res, next) {
    try {
      const { name, description, latitude, longitude, type, status, installedDate } = req.body;

      const point = await MonitoringPoint.create({
        name,
        description,
        latitude,
        longitude,
        type,
        status: status || 'active',
        installedDate,
        createdBy: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: 'Monitoring point created successfully',
        data: { point },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update monitoring point
   * PUT /api/monitoring-points/:id
   * Admin only
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, latitude, longitude, type, status, installedDate } = req.body;

      const existingPoint = await MonitoringPoint.findById(id);
      if (!existingPoint) {
        return res.status(404).json({
          success: false,
          message: 'Monitoring point not found',
        });
      }

      const updatedPoint = await MonitoringPoint.update(id, {
        name,
        description,
        latitude,
        longitude,
        type,
        status,
        installedDate,
      });

      res.json({
        success: true,
        message: 'Monitoring point updated successfully',
        data: { point: updatedPoint },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete monitoring point
   * DELETE /api/monitoring-points/:id
   * Admin only
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const existingPoint = await MonitoringPoint.findById(id);
      if (!existingPoint) {
        return res.status(404).json({
          success: false,
          message: 'Monitoring point not found',
        });
      }

      await MonitoringPoint.delete(id);

      res.json({
        success: true,
        message: 'Monitoring point deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get statistics by type
   * GET /api/monitoring-points/stats/by-type
   */
  static async getStatsByType(req, res, next) {
    try {
      const stats = await MonitoringPoint.getStatsByType();

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MonitoringPointController;
