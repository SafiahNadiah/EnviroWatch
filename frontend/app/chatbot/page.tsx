'use client';

import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import chatService, { ChatMessage, ChatSession } from '@/services/chatService';
import { formatDate, timeAgo } from '@/utils/helpers';

export default function ChatbotPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await chatService.getSessions();
      setSessions(response.data.sessions);
      
      // Load first session if exists
      if (response.data.sessions.length > 0) {
        loadSession(response.data.sessions[0].id);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSession = async (sessionId: number) => {
    try {
      const response = await chatService.getSessionMessages(sessionId);
      setCurrentSession(response.data.session);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const createNewSession = async () => {
    try {
      const response = await chatService.createSession('New Chat');
      const newSession = response.data.session;
      
      setSessions([newSession, ...sessions]);
      setCurrentSession(newSession);
      setMessages([]);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    setSendingMessage(true);
    const messageText = inputMessage;
    setInputMessage('');

    try {
      const response = await chatService.sendMessage(
        messageText,
        currentSession?.id
      );

      // Update messages
      setMessages([
        ...messages,
        response.data.userMessage,
        response.data.assistantMessage,
      ]);

      // Update current session ID if new session was created
      if (!currentSession) {
        setCurrentSession({ ...response.data.session, id: response.data.sessionId });
        await fetchSessions(); // Refresh sessions list
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setInputMessage(messageText); // Restore message on error
    } finally {
      setSendingMessage(false);
    }
  };

  const deleteSession = async (sessionId: number) => {
    if (!confirm('Are you sure you want to delete this chat?')) return;

    try {
      await chatService.deleteSession(sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const suggestedQuestions = [
    "What's the current air quality?",
    "Tell me about water quality in rivers",
    "How many monitoring stations are active?",
    "What are the AQI trends?",
    "Explain the water quality parameters",
  ];

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col">
        <Navbar />
        
        <div className="flex-1 flex overflow-hidden bg-gray-50">
          {/* Sidebar - Chat Sessions */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={createNewSession}
                className="w-full btn btn-primary"
              >
                + New Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : sessions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No chat history</p>
                  <p className="text-sm mt-2">Start a new conversation!</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => loadSession(session.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                        currentSession?.id === session.id
                          ? 'bg-primary-100 text-primary-900'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{session.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {session.message_count || 0} messages • {timeAgo(session.updated_at)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.id);
                          }}
                          className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">EnviroWatch AI Assistant</h2>
                  <p className="text-sm text-gray-500">Ask me anything about environmental data</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="max-w-3xl mx-auto text-center py-12">
                  <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 rounded-full inline-block mb-6">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Welcome to EnviroWatch AI
                  </h3>
                  <p className="text-gray-600 mb-8">
                    I can help you understand environmental monitoring data, air quality, water quality, and provide insights about our monitoring network.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setInputMessage(question)}
                        className="p-3 text-left bg-white rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
                      >
                        <span className="text-sm text-gray-700">{question}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          message.role === 'user' ? 'bg-primary-600' : 'bg-gradient-to-r from-primary-500 to-secondary-500'
                        }`}>
                          {message.role === 'user' ? (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          )}
                        </div>
                        <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                          <div className={`inline-block p-4 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-primary-600 text-white'
                              : 'bg-white border border-gray-200'
                          }`}>
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 px-1">
                            {timeAgo(message.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={sendMessage} className="max-w-4xl mx-auto">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me about environmental data..."
                    className="flex-1 input"
                    disabled={sendingMessage}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || sendingMessage}
                    className="btn btn-primary px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingMessage ? (
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      'Send'
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Ask about air quality, water parameters, station locations, or trends
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
