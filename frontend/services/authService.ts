import apiClient from './api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  isActive?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/api/auth/login', credentials);
    
    if (response.data.success && response.data.data.token) {
      // Store token and user data
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post('/api/auth/register', data);
    
    if (response.data.success && response.data.data.token) {
      // Store token and user data
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Get current user from API
   */
  async fetchCurrentUser(): Promise<User> {
    const response = await apiClient.get('/api/auth/me');
    return response.data.data.user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  /**
   * Update user profile
   */
  async updateProfile(data: { fullName?: string; currentPassword?: string; newPassword?: string }) {
    const response = await apiClient.put('/api/auth/profile', data);
    
    if (response.data.success && response.data.data.user) {
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }
}

export default new AuthService();
