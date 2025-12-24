const db = require('../config/database');

/**
 * MonitoringPoint Model
 * Handles all database operations related to monitoring points (GIS locations)
 */
class MonitoringPoint {
  /**
   * Create a new monitoring point
   */
  static async create({ name, description, latitude, longitude, type, status, installedDate, createdBy }) {
    const result = await db.query(
      `INSERT INTO monitoring_points 
       (name, description, latitude, longitude, type, status, installed_date, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [name, description, latitude, longitude, type, status, installedDate, createdBy]
    );
    return result.rows[0];
  }

  /**
   * Find monitoring point by ID
   */
  static async findById(id) {
    const result = await db.query(
      'SELECT * FROM monitoring_points WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get all monitoring points with optional filters
   */
  static async findAll({ type, status } = {}) {
    let query = 'SELECT * FROM monitoring_points WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Update monitoring point
   */
  static async update(id, { name, description, latitude, longitude, type, status, installedDate }) {
    const result = await db.query(
      `UPDATE monitoring_points 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           latitude = COALESCE($3, latitude),
           longitude = COALESCE($4, longitude),
           type = COALESCE($5, type),
           status = COALESCE($6, status),
           installed_date = COALESCE($7, installed_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [name, description, latitude, longitude, type, status, installedDate, id]
    );
    return result.rows[0];
  }

  /**
   * Delete monitoring point
   */
  static async delete(id) {
    const result = await db.query(
      'DELETE FROM monitoring_points WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get monitoring point with latest record
   */
  static async findWithLatestRecord(id) {
    const result = await db.query(
      `SELECT 
        mp.*,
        mr.recorded_at as last_record_time,
        mr.pm25, mr.pm10, mr.aqi, mr.temperature, mr.humidity,
        mr.ph, mr.dissolved_oxygen, mr.turbidity, mr.conductivity
      FROM monitoring_points mp
      LEFT JOIN LATERAL (
        SELECT * FROM monitoring_records 
        WHERE monitoring_point_id = mp.id 
        ORDER BY recorded_at DESC 
        LIMIT 1
      ) mr ON true
      WHERE mp.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get monitoring points grouped by type with counts
   */
  static async getStatsByType() {
    const result = await db.query(`
      SELECT 
        type,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE status = 'active') as active_count,
        COUNT(*) FILTER (WHERE status = 'inactive') as inactive_count,
        COUNT(*) FILTER (WHERE status = 'maintenance') as maintenance_count
      FROM monitoring_points
      GROUP BY type
      ORDER BY type
    `);
    return result.rows;
  }
}

module.exports = MonitoringPoint;
