const Chat = require('../models/Chat');
const ChatService = require('../services/chatService');

/**
 * Chat Controller
 * Handles AI chatbot interactions and conversation management
 */
class ChatController {
  /**
   * Send a chat message and get AI response
   * POST /api/chat/message
   */
  static async sendMessage(req, res, next) {
    try {
      const { sessionId, message } = req.body;
      const userId = req.user.id;

      let session;

      // Create new session if not provided
      if (!sessionId) {
        session = await Chat.createSession(userId, 'New Chat');
      } else {
        session = await Chat.getSession(sessionId, userId);
        if (!session) {
          return res.status(404).json({
            success: false,
            message: 'Chat session not found',
          });
        }
      }

      // Save user message
      const userMessage = await Chat.createMessage(session.id, 'user', message);

      // Get conversation history for context
      const history = await Chat.getRecentMessages(session.id, 10);

      // Generate AI response
      const aiResponse = await ChatService.generateResponse(message, history);

      // Save AI response
      const assistantMessage = await Chat.createMessage(session.id, 'assistant', aiResponse);

      // Update session title based on first message if needed
      if (session.title === 'New Chat') {
        const newTitle = message.length > 50 
          ? message.substring(0, 50) + '...' 
          : message;
        await Chat.updateSessionTitle(session.id, userId, newTitle);
      }

      res.json({
        success: true,
        data: {
          sessionId: session.id,
          userMessage,
          assistantMessage,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all chat sessions for current user
   * GET /api/chat/sessions
   */
  static async getSessions(req, res, next) {
    try {
      const userId = req.user.id;
      const sessions = await Chat.getUserSessions(userId);

      res.json({
        success: true,
        data: { sessions },
        count: sessions.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get messages for a specific session
   * GET /api/chat/sessions/:sessionId/messages
   */
  static async getSessionMessages(req, res, next) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      // Verify session belongs to user
      const session = await Chat.getSession(sessionId, userId);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Chat session not found',
        });
      }

      const messages = await Chat.getSessionMessages(sessionId);

      res.json({
        success: true,
        data: {
          session,
          messages,
        },
        count: messages.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new chat session
   * POST /api/chat/sessions
   */
  static async createSession(req, res, next) {
    try {
      const userId = req.user.id;
      const { title } = req.body;

      const session = await Chat.createSession(userId, title || 'New Chat');

      res.status(201).json({
        success: true,
        message: 'Chat session created successfully',
        data: { session },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update session title
   * PUT /api/chat/sessions/:sessionId
   */
  static async updateSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { title } = req.body;
      const userId = req.user.id;

      const session = await Chat.updateSessionTitle(sessionId, userId, title);

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Chat session not found',
        });
      }

      res.json({
        success: true,
        message: 'Session updated successfully',
        data: { session },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a chat session
   * DELETE /api/chat/sessions/:sessionId
   */
  static async deleteSession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const deletedSession = await Chat.deleteSession(sessionId, userId);

      if (!deletedSession) {
        return res.status(404).json({
          success: false,
          message: 'Chat session not found',
        });
      }

      res.json({
        success: true,
        message: 'Chat session deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get chat statistics
   * GET /api/chat/stats
   */
  static async getStats(req, res, next) {
    try {
      const userId = req.user.id;
      const stats = await Chat.getStats(userId);

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search messages
   * GET /api/chat/search
   */
  static async searchMessages(req, res, next) {
    try {
      const { q } = req.query;
      const userId = req.user.id;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
      }

      const results = await Chat.searchMessages(userId, q);

      res.json({
        success: true,
        data: { results },
        count: results.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ChatController;
