const User = require('../models/User');
const MonitoringPoint = require('../models/MonitoringPoint');
const MonitoringRecord = require('../models/MonitoringRecord');

/**
 * Admin Controller
 * Handles administrative operations (Admin only)
 */
class AdminController {
  /**
   * Get all users
   * GET /api/admin/users
   */
  static async getAllUsers(req, res, next) {
    try {
      const users = await User.findAll();

      res.json({
        success: true,
        data: { users },
        count: users.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   * GET /api/admin/users/:id
   */
  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user role
   * PUT /api/admin/users/:id/role
   */
  static async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      // Prevent admin from demoting themselves
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot change your own role',
        });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const updatedUser = await User.updateRole(id, role);

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: { user: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user active status
   * PUT /api/admin/users/:id/status
   */
  static async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      // Prevent admin from deactivating themselves
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot deactivate your own account',
        });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const updatedUser = await User.updateActiveStatus(id, isActive);

      res.json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: { user: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user
   * DELETE /api/admin/users/:id
   */
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own account',
        });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      await User.delete(id);

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get system statistics
   * GET /api/admin/stats
   */
  static async getSystemStats(req, res, next) {
    try {
      // Get user statistics
      const userStats = await User.getStats();

      // Get monitoring point statistics
      const pointStats = await MonitoringPoint.getStatsByType();

      // Get monitoring record statistics
      const recordStats = await MonitoringRecord.getDashboardStats();

      // Calculate total monitoring points
      const totalPoints = pointStats.reduce((sum, stat) => sum + parseInt(stat.count), 0);
      const activePoints = pointStats.reduce((sum, stat) => sum + parseInt(stat.active_count), 0);

      res.json({
        success: true,
        data: {
          users: userStats,
          monitoringPoints: {
            total: totalPoints,
            active: activePoints,
            byType: pointStats,
          },
          records: recordStats,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get system health
   * GET /api/admin/health
   */
  static async getSystemHealth(req, res, next) {
    try {
      const db = require('../config/database');
      
      // Test database connection
      await db.query('SELECT NOW()');

      // Get database size (PostgreSQL specific)
      const dbSize = await db.query(`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `);

      // Get table statistics
      const tableStats = await db.query(`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes
        FROM pg_stat_user_tables
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      `);

      res.json({
        success: true,
        data: {
          status: 'healthy',
          database: {
            connected: true,
            size: dbSize.rows[0].size,
            tables: tableStats.rows,
          },
          server: {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            nodeVersion: process.version,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'System health check failed',
        error: error.message,
      });
    }
  }

  /**
   * Get activity logs (placeholder for future implementation)
   * GET /api/admin/logs
   */
  static async getActivityLogs(req, res, next) {
    try {
      // This is a placeholder - implement actual logging in production
      res.json({
        success: true,
        message: 'Activity logs feature coming soon',
        data: {
          logs: [],
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
