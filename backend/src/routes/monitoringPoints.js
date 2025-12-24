const express = require('express');
const { body, query } = require('express-validator');
const MonitoringPointController = require('../controllers/monitoringPointController');
const { auth, adminOnly } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

/**
 * @route   GET /api/monitoring-points/stats/by-type
 * @desc    Get monitoring points statistics grouped by type
 * @access  Private
 */
router.get('/stats/by-type', auth, MonitoringPointController.getStatsByType);

/**
 * @route   GET /api/monitoring-points
 * @desc    Get all monitoring points (with optional filters)
 * @access  Private
 */
router.get(
  '/',
  auth,
  [
    query('type')
      .optional()
      .isIn(['air', 'river', 'marine'])
      .withMessage('Type must be air, river, or marine'),
    query('status')
      .optional()
      .isIn(['active', 'inactive', 'maintenance'])
      .withMessage('Status must be active, inactive, or maintenance'),
  ],
  validate,
  MonitoringPointController.getAll
);

/**
 * @route   GET /api/monitoring-points/:id
 * @desc    Get monitoring point by ID
 * @access  Private
 */
router.get('/:id', auth, MonitoringPointController.getById);

/**
 * @route   POST /api/monitoring-points
 * @desc    Create new monitoring point
 * @access  Private (Admin only)
 */
router.post(
  '/',
  auth,
  adminOnly,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').optional().trim(),
    body('latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    body('longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
    body('type')
      .isIn(['air', 'river', 'marine'])
      .withMessage('Type must be air, river, or marine'),
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'maintenance'])
      .withMessage('Status must be active, inactive, or maintenance'),
    body('installedDate').optional().isISO8601().withMessage('Invalid date format'),
  ],
  validate,
  MonitoringPointController.create
);

/**
 * @route   PUT /api/monitoring-points/:id
 * @desc    Update monitoring point
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  auth,
  adminOnly,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('description').optional().trim(),
    body('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    body('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
    body('type')
      .optional()
      .isIn(['air', 'river', 'marine'])
      .withMessage('Type must be air, river, or marine'),
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'maintenance'])
      .withMessage('Status must be active, inactive, or maintenance'),
    body('installedDate').optional().isISO8601().withMessage('Invalid date format'),
  ],
  validate,
  MonitoringPointController.update
);

/**
 * @route   DELETE /api/monitoring-points/:id
 * @desc    Delete monitoring point
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, adminOnly, MonitoringPointController.delete);

module.exports = router;
