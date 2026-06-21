import { fetchService } from '../lib/http/fetch';
import type { AuthResponse, UserResponse } from '../types';

class AuthService {
  private tokenKey = 'callit_access_token';
  private refreshKey = 'callit_refresh_token';
  private userKey = 'callit_user';

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshKey);
  }

  getUser(): UserResponse | null {
    const userStr = localStorage.getItem(this.userKey);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      console.error('Failed to parse user from localStorage');
      return null;
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await fetchService.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return data;
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const data = await fetchService.post<AuthResponse>('/auth/refresh', {
      refreshToken: refreshToken,
    });
    this.setTokens(data);
    return data.accessToken;
  }

  setTokens(data: AuthResponse): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    localStorage.removeItem(this.userKey);

    localStorage.setItem(this.tokenKey, data.accessToken);
    localStorage.setItem(this.refreshKey, data.refreshToken);
    if (data.user) {
      localStorage.setItem(this.userKey, JSON.stringify(data.user));
      console.log('AuthService: Stored user with role:', data.user.role);
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
    if (user) return user.role === 'ADMIN';
    const u = this.getUser();
    return u?.role === 'ADMIN';
  }
}

export const auth = new AuthService();
export default auth;
