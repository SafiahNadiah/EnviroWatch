const { Pool } = require('pg');
require('dotenv').config();

/**
 * PostgreSQL Database Connection Pool
 * Manages database connections with automatic connection pooling
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'envirowatch',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection on startup
pool.on('connect', () => {
  console.log('✓ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

/**
 * Execute a SQL query
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
const query = (text, params) => pool.query(text, params);

/**
 * Get a client from the pool for transactions
 * @returns {Promise} Database client
 */
const getClient = () => pool.connect();

module.exports = {
  query,
  getClient,
  pool,
};
