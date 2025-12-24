const db = require('../config/database');

/**
 * MonitoringRecord Model
 * Handles all database operations related to environmental monitoring records
 */
class MonitoringRecord {
  /**
   * Create a new monitoring record
   */
  static async create(data) {
    const {
      monitoringPointId,
      recordedAt,
      pm25,
      pm10,
      aqi,
      temperature,
      humidity,
      ph,
      dissolvedOxygen,
      turbidity,
      conductivity,
      notes,
    } = data;

    const result = await db.query(
      `INSERT INTO monitoring_records 
       (monitoring_point_id, recorded_at, pm25, pm10, aqi, temperature, humidity,
        ph, dissolved_oxygen, turbidity, conductivity, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
      [
        monitoringPointId,
        recordedAt || new Date(),
        pm25,
        pm10,
        aqi,
        temperature,
        humidity,
        ph,
        dissolvedOxygen,
        turbidity,
        conductivity,
        notes,
      ]
    );
    return result.rows[0];
  }

  /**
   * Find record by ID
   */
  static async findById(id) {
    const result = await db.query(
      'SELECT * FROM monitoring_records WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get all records with optional filters
   */
  static async findAll({ monitoringPointId, startDate, endDate, limit = 100, offset = 0 } = {}) {
    let query = `
      SELECT mr.*, mp.name as point_name, mp.type as point_type
      FROM monitoring_records mr
      JOIN monitoring_points mp ON mr.monitoring_point_id = mp.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (monitoringPointId) {
      query += ` AND mr.monitoring_point_id = $${paramIndex}`;
      params.push(monitoringPointId);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND mr.recorded_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND mr.recorded_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY mr.recorded_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Get latest records for all monitoring points
   */
  static async getLatestForAllPoints() {
    const result = await db.query(`
      SELECT DISTINCT ON (mp.id)
        mp.id as monitoring_point_id,
        mp.name as point_name,
        mp.type as point_type,
        mp.latitude,
        mp.longitude,
        mp.status,
        mr.*
      FROM monitoring_points mp
      LEFT JOIN monitoring_records mr ON mr.monitoring_point_id = mp.id
      WHERE mp.status = 'active'
      ORDER BY mp.id, mr.recorded_at DESC
    `);
    return result.rows;
  }

  /**
   * Get statistics for a monitoring point
   */
  static async getStatsByPoint(monitoringPointId, days = 7) {
    const result = await db.query(
      `SELECT 
        COUNT(*) as total_records,
        AVG(pm25) as avg_pm25,
        MAX(pm25) as max_pm25,
        MIN(pm25) as min_pm25,
        AVG(pm10) as avg_pm10,
        MAX(pm10) as max_pm10,
        MIN(pm10) as min_pm10,
        AVG(aqi) as avg_aqi,
        MAX(aqi) as max_aqi,
        MIN(aqi) as min_aqi,
        AVG(temperature) as avg_temperature,
        AVG(humidity) as avg_humidity,
        AVG(ph) as avg_ph,
        AVG(dissolved_oxygen) as avg_dissolved_oxygen,
        AVG(turbidity) as avg_turbidity,
        AVG(conductivity) as avg_conductivity
      FROM monitoring_records
      WHERE monitoring_point_id = $1
        AND recorded_at >= NOW() - INTERVAL '${days} days'`,
      [monitoringPointId]
    );
    return result.rows[0];
  }

  /**
   * Get time series data for charts
   */
  static async getTimeSeries({ monitoringPointId, parameter, startDate, endDate }) {
    const validParameters = ['pm25', 'pm10', 'aqi', 'temperature', 'humidity', 'ph', 'dissolved_oxygen', 'turbidity', 'conductivity'];
    
    if (!validParameters.includes(parameter)) {
      throw new Error('Invalid parameter');
    }

    const result = await db.query(
      `SELECT 
        recorded_at,
        ${parameter} as value
      FROM monitoring_records
      WHERE monitoring_point_id = $1
        AND recorded_at >= $2
        AND recorded_at <= $3
        AND ${parameter} IS NOT NULL
      ORDER BY recorded_at ASC`,
      [monitoringPointId, startDate, endDate]
    );
    return result.rows;
  }

  /**
   * Get overall dashboard statistics
   */
  static async getDashboardStats() {
    const result = await db.query(`
      WITH latest_records AS (
        SELECT DISTINCT ON (monitoring_point_id)
          monitoring_point_id,
          aqi,
          pm25,
          ph,
          dissolved_oxygen
        FROM monitoring_records
        ORDER BY monitoring_point_id, recorded_at DESC
      )
      SELECT 
        COUNT(DISTINCT mr.monitoring_point_id) as active_stations,
        COUNT(*) as total_records,
        AVG(lr.aqi) as avg_aqi,
        AVG(lr.pm25) as avg_pm25,
        COUNT(*) FILTER (WHERE lr.aqi > 100) as unhealthy_air_count,
        COUNT(*) FILTER (WHERE lr.aqi <= 50) as good_air_count
      FROM monitoring_records mr
      LEFT JOIN latest_records lr ON mr.monitoring_point_id = lr.monitoring_point_id
      WHERE mr.recorded_at >= NOW() - INTERVAL '24 hours'
    `);
    return result.rows[0];
  }

  /**
   * Delete old records (cleanup)
   */
  static async deleteOlderThan(days) {
    const result = await db.query(
      `DELETE FROM monitoring_records 
       WHERE recorded_at < NOW() - INTERVAL '${days} days'
       RETURNING COUNT(*) as deleted_count`
    );
    return result.rows[0];
  }
}

module.exports = MonitoringRecord;
