import apiClient from './api';

/**
 * Chat Service
 * Handles all AI chatbot-related API calls
 */

export interface ChatSession {
  id: number;
  user_id: number;
  title: string;
  message_count?: number;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  session_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

class ChatService {
  /**
   * Send a chat message and get AI response
   */
  async sendMessage(message: string, sessionId?: number) {
    const response = await apiClient.post('/api/chat/message', {
      message,
      sessionId,
    });
    return response.data;
  }

  /**
   * Get all chat sessions for current user
   */
  async getSessions() {
    const response = await apiClient.get('/api/chat/sessions');
    return response.data;
  }

  /**
   * Create a new chat session
   */
  async createSession(title = 'New Chat') {
    const response = await apiClient.post('/api/chat/sessions', { title });
    return response.data;
  }

  /**
   * Get messages for a specific session
   */
  async getSessionMessages(sessionId: number) {
    const response = await apiClient.get(`/api/chat/sessions/${sessionId}/messages`);
    return response.data;
  }

  /**
   * Update session title
   */
  async updateSessionTitle(sessionId: number, title: string) {
    const response = await apiClient.put(`/api/chat/sessions/${sessionId}`, { title });
    return response.data;
  }

  /**
   * Delete a chat session
   */
  async deleteSession(sessionId: number) {
    const response = await apiClient.delete(`/api/chat/sessions/${sessionId}`);
    return response.data;
  }

  /**
   * Get chat statistics
   */
  async getStats() {
    const response = await apiClient.get('/api/chat/stats');
    return response.data;
  }

  /**
   * Search messages
   */
  async searchMessages(query: string) {
    const response = await apiClient.get('/api/chat/search', {
      params: { q: query },
    });
    return response.data;
  }
}

export default new ChatService();
