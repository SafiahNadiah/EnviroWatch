const express = require('express');
const { body, query } = require('express-validator');
const MonitoringRecordController = require('../controllers/monitoringRecordController');
const { auth, adminOnly } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

/**
 * @route   GET /api/monitoring-records/stats/dashboard
 * @desc    Get overall dashboard statistics
 * @access  Private
 */
router.get('/stats/dashboard', auth, MonitoringRecordController.getDashboardStats);

/**
 * @route   GET /api/monitoring-records/stats/:pointId
 * @desc    Get statistics for a specific monitoring point
 * @access  Private
 */
router.get(
  '/stats/:pointId',
  auth,
  [
    query('days')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Days must be between 1 and 365'),
  ],
  validate,
  MonitoringRecordController.getStatsByPoint
);

/**
 * @route   GET /api/monitoring-records/latest
 * @desc    Get latest records for all monitoring points
 * @access  Private
 */
router.get('/latest', auth, MonitoringRecordController.getLatestForAll);

/**
 * @route   GET /api/monitoring-records/timeseries
 * @desc    Get time series data for charts
 * @access  Private
 */
router.get(
  '/timeseries',
  auth,
  [
    query('monitoringPointId').notEmpty().withMessage('Monitoring point ID is required'),
    query('parameter')
      .isIn(['pm25', 'pm10', 'aqi', 'temperature', 'humidity', 'ph', 'dissolved_oxygen', 'turbidity', 'conductivity'])
      .withMessage('Invalid parameter'),
    query('startDate').isISO8601().withMessage('Invalid start date'),
    query('endDate').isISO8601().withMessage('Invalid end date'),
  ],
  validate,
  MonitoringRecordController.getTimeSeries
);

/**
 * @route   GET /api/monitoring-records
 * @desc    Get all monitoring records with filters
 * @access  Private
 */
router.get(
  '/',
  auth,
  [
    query('monitoringPointId').optional().isInt().withMessage('Invalid monitoring point ID'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date'),
    query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a positive number'),
  ],
  validate,
  MonitoringRecordController.getAll
);

/**
 * @route   GET /api/monitoring-records/:id
 * @desc    Get monitoring record by ID
 * @access  Private
 */
router.get('/:id', auth, MonitoringRecordController.getById);

/**
 * @route   POST /api/monitoring-records
 * @desc    Create new monitoring record
 * @access  Private
 */
router.post(
  '/',
  auth,
  [
    body('monitoringPointId').isInt().withMessage('Valid monitoring point ID is required'),
    body('recordedAt').optional().isISO8601().withMessage('Invalid date format'),
    body('pm25').optional().isFloat({ min: 0 }).withMessage('PM2.5 must be a positive number'),
    body('pm10').optional().isFloat({ min: 0 }).withMessage('PM10 must be a positive number'),
    body('aqi').optional().isInt({ min: 0 }).withMessage('AQI must be a positive integer'),
    body('temperature').optional().isFloat().withMessage('Temperature must be a number'),
    body('humidity').optional().isFloat({ min: 0, max: 100 }).withMessage('Humidity must be between 0 and 100'),
    body('ph').optional().isFloat({ min: 0, max: 14 }).withMessage('pH must be between 0 and 14'),
    body('dissolvedOxygen').optional().isFloat({ min: 0 }).withMessage('Dissolved oxygen must be positive'),
    body('turbidity').optional().isFloat({ min: 0 }).withMessage('Turbidity must be positive'),
    body('conductivity').optional().isFloat({ min: 0 }).withMessage('Conductivity must be positive'),
    body('notes').optional().trim(),
  ],
  validate,
  MonitoringRecordController.create
);

module.exports = router;
