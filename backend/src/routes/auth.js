const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const { auth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('fullName')
      .trim()
      .notEmpty()
      .withMessage('Full name is required'),
    body('role')
      .optional()
      .isIn(['user', 'admin'])
      .withMessage('Role must be either user or admin'),
  ],
  validate,
  AuthController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  validate,
  AuthController.login
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', auth, AuthController.getCurrentUser);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  auth,
  [
    body('fullName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Full name cannot be empty'),
    body('currentPassword')
      .optional()
      .notEmpty()
      .withMessage('Current password is required when changing password'),
    body('newPassword')
      .optional()
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long'),
  ],
  validate,
  AuthController.updateProfile
);

module.exports = router;
