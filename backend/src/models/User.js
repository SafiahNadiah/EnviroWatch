const db = require('../config/database');

/**
 * User Model
 * Handles all database operations related to users
 */
class User {
  /**
   * Create a new user
   */
  static async create({ email, passwordHash, fullName, role = 'user' }) {
    const result = await db.query(
      `INSERT INTO users (email, password_hash, full_name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, full_name, role, is_active, created_at`,
      [email, passwordHash, fullName, role]
    );
    return result.rows[0];
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const result = await db.query(
      `SELECT id, email, full_name, role, is_active, created_at, updated_at 
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get all users (admin only)
   */
  static async findAll() {
    const result = await db.query(
      `SELECT id, email, full_name, role, is_active, created_at, updated_at 
       FROM users 
       ORDER BY created_at DESC`
    );
    return result.rows;
  }

  /**
   * Update user role
   */
  static async updateRole(id, role) {
    const result = await db.query(
      `UPDATE users 
       SET role = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, email, full_name, role, is_active`,
      [role, id]
    );
    return result.rows[0];
  }

  /**
   * Update user active status
   */
  static async updateActiveStatus(id, isActive) {
    const result = await db.query(
      `UPDATE users 
       SET is_active = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, email, full_name, role, is_active`,
      [isActive, id]
    );
    return result.rows[0];
  }

  /**
   * Delete user
   */
  static async delete(id) {
    const result = await db.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get user statistics
   */
  static async getStats() {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
        COUNT(*) FILTER (WHERE role = 'user') as user_count,
        COUNT(*) FILTER (WHERE is_active = true) as active_count
      FROM users
    `);
    return result.rows[0];
  }
}

module.exports = User;
