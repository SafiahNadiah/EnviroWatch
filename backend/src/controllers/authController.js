const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Controller
 * Handles user registration, login, and authentication
 */
class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  static async register(req, res, next) {
    try {
      const { email, password, fullName, role = 'user' } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists',
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        email,
        passwordHash,
        fullName,
        role,
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated. Please contact administrator.',
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  static async getCurrentUser(req, res, next) {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            isActive: user.is_active,
            createdAt: user.created_at,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  static async updateProfile(req, res, next) {
    try {
      const { fullName, currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Get user
      const user = await User.findByEmail(req.user.email);

      // If changing password, verify current password
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({
            success: false,
            message: 'Current password is required to set new password',
          });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isPasswordValid) {
          return res.status(401).json({
            success: false,
            message: 'Current password is incorrect',
          });
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        await db.query(
          'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [newPasswordHash, userId]
        );
      }

      // Update full name if provided
      if (fullName) {
        await db.query(
          'UPDATE users SET full_name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [fullName, userId]
        );
      }

      const updatedUser = await User.findById(userId);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            fullName: updatedUser.full_name,
            role: updatedUser.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
