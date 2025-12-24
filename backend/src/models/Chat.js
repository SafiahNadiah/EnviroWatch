const db = require('../config/database');

/**
 * Chat Model
 * Handles all database operations related to AI chatbot sessions and messages
 */
class Chat {
  /**
   * Create a new chat session
   */
  static async createSession(userId, title = 'New Chat') {
    const result = await db.query(
      `INSERT INTO chat_sessions (user_id, title) 
       VALUES ($1, $2) 
       RETURNING *`,
      [userId, title]
    );
    return result.rows[0];
  }

  /**
   * Get all sessions for a user
   */
  static async getUserSessions(userId) {
    const result = await db.query(
      `SELECT 
        cs.*,
        COUNT(cm.id) as message_count,
        MAX(cm.created_at) as last_message_at
      FROM chat_sessions cs
      LEFT JOIN chat_messages cm ON cs.id = cm.session_id
      WHERE cs.user_id = $1
      GROUP BY cs.id
      ORDER BY cs.updated_at DESC`,
      [userId]
    );
    return result.rows;
  }

  /**
   * Get session by ID
   */
  static async getSession(sessionId, userId) {
    const result = await db.query(
      'SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, userId]
    );
    return result.rows[0];
  }

  /**
   * Update session title
   */
  static async updateSessionTitle(sessionId, userId, title) {
    const result = await db.query(
      `UPDATE chat_sessions 
       SET title = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND user_id = $3 
       RETURNING *`,
      [title, sessionId, userId]
    );
    return result.rows[0];
  }

  /**
   * Delete session
   */
  static async deleteSession(sessionId, userId) {
    const result = await db.query(
      'DELETE FROM chat_sessions WHERE id = $1 AND user_id = $2 RETURNING id',
      [sessionId, userId]
    );
    return result.rows[0];
  }

  /**
   * Create a new message in a session
   */
  static async createMessage(sessionId, role, content) {
    const result = await db.query(
      `INSERT INTO chat_messages (session_id, role, content) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [sessionId, role, content]
    );

    // Update session's updated_at timestamp
    await db.query(
      'UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [sessionId]
    );

    return result.rows[0];
  }

  /**
   * Get all messages for a session
   */
  static async getSessionMessages(sessionId) {
    const result = await db.query(
      `SELECT * FROM chat_messages 
       WHERE session_id = $1 
       ORDER BY created_at ASC`,
      [sessionId]
    );
    return result.rows;
  }

  /**
   * Get recent messages for context (for LLM)
   */
  static async getRecentMessages(sessionId, limit = 10) {
    const result = await db.query(
      `SELECT * FROM chat_messages 
       WHERE session_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [sessionId, limit]
    );
    return result.rows.reverse(); // Return in chronological order
  }

  /**
   * Get chat statistics
   */
  static async getStats(userId) {
    const result = await db.query(
      `SELECT 
        COUNT(DISTINCT cs.id) as total_sessions,
        COUNT(cm.id) as total_messages,
        COUNT(cm.id) FILTER (WHERE cm.role = 'user') as user_messages,
        COUNT(cm.id) FILTER (WHERE cm.role = 'assistant') as assistant_messages
      FROM chat_sessions cs
      LEFT JOIN chat_messages cm ON cs.id = cm.session_id
      WHERE cs.user_id = $1`,
      [userId]
    );
    return result.rows[0];
  }

  /**
   * Search messages by content
   */
  static async searchMessages(userId, searchQuery) {
    const result = await db.query(
      `SELECT 
        cm.*,
        cs.title as session_title
      FROM chat_messages cm
      JOIN chat_sessions cs ON cm.session_id = cs.id
      WHERE cs.user_id = $1 
        AND cm.content ILIKE $2
      ORDER BY cm.created_at DESC
      LIMIT 50`,
      [userId, `%${searchQuery}%`]
    );
    return result.rows;
  }
}

module.exports = Chat;
