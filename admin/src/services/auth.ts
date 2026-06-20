import api from './api';
import type { AuthResponse, UserResponse } from '../types';

class AuthService {
  private tokenKey = 'cnalias_access_token';
  private refreshKey = 'cnalias_refresh_token';
  private userKey = 'cnalias_user';

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshKey);
  }

  getUser(): UserResponse | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const response = await api.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    this.setTokens(response.data);

    // Update Zustand store if available
    try {
      const { set } = require('../stores/authStore').useAuthStore;
      if (set) {
        set({
          token: response.data.access_token,
          user: response.data.user || null,
        });
      }
    } catch (e) {
      // Store may not be available in all contexts
      console.warn('Could not update authStore:', e);
    }

    return response.data.access_token;
  }

  setTokens(data: AuthResponse): void {
    // Clear old data first to prevent stale state
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    localStorage.removeItem(this.userKey);

    // Set new data
    localStorage.setItem(this.tokenKey, data.access_token);
    localStorage.setItem(this.refreshKey, data.refresh_token);
    if (data.user) {
      localStorage.setItem(this.userKey, JSON.stringify(data.user));
      console.log('AuthService: Stored user with role:', data.user.role);
    } else {
      console.warn('AuthService: No user data in response');
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    localStorage.removeItem(this.userKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(user?: UserResponse | null): boolean {
    const u = user || this.getUser();
    return u?.role === 'ADMIN';
  }
}

export const auth = new AuthService();
export default auth;
