const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { errorHandler, notFound } = require('./middlewares/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const monitoringPointRoutes = require('./routes/monitoringPoints');
const monitoringRecordRoutes = require('./routes/monitoringRecords');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');

/**
 * Initialize Express Application
 */
const app = express();

/**
 * Middleware Configuration
 */

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/**
 * API Routes
 */

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EnviroWatch API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/monitoring-points', monitoringPointRoutes);
app.use('/api/monitoring-records', monitoringRecordRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

/**
 * Error Handling Middleware
 */

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

/**
 * Start Server
 */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('=================================');
  console.log('EnviroWatch Backend API');
  console.log('=================================');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log('=================================');
  console.log('\nAPI Endpoints:');
  console.log('  GET    /                                - API status');
  console.log('  GET    /health                          - Health check');
  console.log('  POST   /api/auth/register               - Register user');
  console.log('  POST   /api/auth/login                  - Login user');
  console.log('  GET    /api/auth/me                     - Get current user');
  console.log('  GET    /api/monitoring-points           - Get monitoring points');
  console.log('  GET    /api/monitoring-records          - Get monitoring records');
  console.log('  GET    /api/monitoring-records/latest   - Get latest records');
  console.log('  POST   /api/chat/message                - Send chat message');
  console.log('  GET    /api/chat/sessions               - Get chat sessions');
  console.log('  GET    /api/admin/stats                 - Get system stats (Admin)');
  console.log('  GET    /api/admin/users                 - Get all users (Admin)');
  console.log('=================================\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process in production
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

module.exports = app;
