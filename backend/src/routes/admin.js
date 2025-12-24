const express = require('express');
const { body } = require('express-validator');
const AdminController = require('../controllers/adminController');
const { auth, adminOnly } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

// All routes require authentication and admin role
router.use(auth, adminOnly);

/**
 * @route   GET /api/admin/stats
 * @desc    Get system-wide statistics
 * @access  Private (Admin only)
 */
router.get('/stats', AdminController.getSystemStats);

/**
 * @route   GET /api/admin/health
 * @desc    Get system health status
 * @access  Private (Admin only)
 */
router.get('/health', AdminController.getSystemHealth);

/**
 * @route   GET /api/admin/logs
 * @desc    Get activity logs
 * @access  Private (Admin only)
 */
router.get('/logs', AdminController.getActivityLogs);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get('/users', AdminController.getAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin only)
 */
router.get('/users/:id', AdminController.getUserById);

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin only)
 */
router.put(
  '/users/:id/role',
  [
    body('role')
      .isIn(['user', 'admin'])
      .withMessage('Role must be either user or admin'),
  ],
  validate,
  AdminController.updateUserRole
);

/**
 * @route   PUT /api/admin/users/:id/status
 * @desc    Update user active status
 * @access  Private (Admin only)
 */
router.put(
  '/users/:id/status',
  [
    body('isActive')
      .isBoolean()
      .withMessage('isActive must be a boolean'),
  ],
  validate,
  AdminController.updateUserStatus
);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete('/users/:id', AdminController.deleteUser);

module.exports = router;
