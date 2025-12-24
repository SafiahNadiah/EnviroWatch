const express = require('express');
const { body, query } = require('express-validator');
const ChatController = require('../controllers/chatController');
const { auth } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

/**
 * @route   POST /api/chat/message
 * @desc    Send a chat message and get AI response
 * @access  Private
 */
router.post(
  '/message',
  auth,
  [
    body('message')
      .trim()
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ max: 2000 })
      .withMessage('Message must not exceed 2000 characters'),
    body('sessionId')
      .optional()
      .isInt()
      .withMessage('Invalid session ID'),
  ],
  validate,
  ChatController.sendMessage
);

/**
 * @route   GET /api/chat/sessions
 * @desc    Get all chat sessions for current user
 * @access  Private
 */
router.get('/sessions', auth, ChatController.getSessions);

/**
 * @route   POST /api/chat/sessions
 * @desc    Create a new chat session
 * @access  Private
 */
router.post(
  '/sessions',
  auth,
  [
    body('title')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Title must not exceed 255 characters'),
  ],
  validate,
  ChatController.createSession
);

/**
 * @route   GET /api/chat/sessions/:sessionId/messages
 * @desc    Get all messages for a specific session
 * @access  Private
 */
router.get('/sessions/:sessionId/messages', auth, ChatController.getSessionMessages);

/**
 * @route   PUT /api/chat/sessions/:sessionId
 * @desc    Update session title
 * @access  Private
 */
router.put(
  '/sessions/:sessionId',
  auth,
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 255 })
      .withMessage('Title must not exceed 255 characters'),
  ],
  validate,
  ChatController.updateSession
);

/**
 * @route   DELETE /api/chat/sessions/:sessionId
 * @desc    Delete a chat session
 * @access  Private
 */
router.delete('/sessions/:sessionId', auth, ChatController.deleteSession);

/**
 * @route   GET /api/chat/stats
 * @desc    Get chat statistics for current user
 * @access  Private
 */
router.get('/stats', auth, ChatController.getStats);

/**
 * @route   GET /api/chat/search
 * @desc    Search messages
 * @access  Private
 */
router.get(
  '/search',
  auth,
  [
    query('q')
      .trim()
      .notEmpty()
      .withMessage('Search query is required')
      .isLength({ min: 2 })
      .withMessage('Search query must be at least 2 characters'),
  ],
  validate,
  ChatController.searchMessages
);

module.exports = router;
