/**
 * AuthService 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { auth } from '../services/auth';

// Mock fetchService
vi.mock('../lib/http/fetch', () => ({
  fetchService: {
    post: vi.fn(),
  },
}));

import { fetchService } from '../lib/http/fetch';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getToken', () => {
    it('应该从 localStorage 获取 token', () => {
      localStorage.setItem('callit_access_token', 'test-token');
      expect(auth.getToken()).toBe('test-token');
    });

    it('应该在没有 token 时返回 null', () => {
      expect(auth.getToken()).toBeNull();
    });
  });

  describe('getRefreshToken', () => {
    it('应该从 localStorage 获取 refresh token', () => {
      localStorage.setItem('callit_refresh_token', 'refresh-token');
      expect(auth.getRefreshToken()).toBe('refresh-token');
    });

    it('应该在没有 refresh token 时返回 null', () => {
      expect(auth.getRefreshToken()).toBeNull();
    });
  });

  describe('getUser', () => {
    it('应该从 localStorage 获取用户信息', () => {
      const user = {
        id: 1,
        username: 'admin',
        email: 'admin@test.com',
        role: 'ADMIN',
        is_verified: true,
        created_at: '2024-01-01T00:00:00Z',
      };
      localStorage.setItem('callit_user', JSON.stringify(user));

      expect(auth.getUser()).toEqual(user);
    });

    it('应该在没有用户信息时返回 null', () => {
      expect(auth.getUser()).toBeNull();
    });

    it('应该处理无效的 JSON 数据', () => {
      localStorage.setItem('callit_user', 'invalid-json');
      expect(auth.getUser()).toBeNull();
    });
  });

  describe('login', () => {
    it('应该调用登录接口并返回用户数据', async () => {
      const mockResponse = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        expires_in: 900,
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@test.com',
          role: 'ADMIN',
          is_verified: true,
          created_at: '2024-01-01T00:00:00Z',
        },
      };

      (fetchService.post as any).mockResolvedValue(mockResponse);

      const result = await auth.login('admin@test.com', 'Test1234');

      expect(fetchService.post).toHaveBeenCalledWith('/auth/login', {
        email: 'admin@test.com',
        password: 'Test1234',
      });
      expect(result).toEqual(mockResponse);
    });

    it('应该处理登录失败', async () => {
      (fetchService.post as any).mockRejectedValue(new Error('Invalid credentials'));

      await expect(auth.login('wrong@test.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshAccessToken', () => {
    it('应该使用 refresh token 获取新 token', async () => {
      localStorage.setItem('callit_refresh_token', 'refresh-token');

      const mockResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@test.com',
          role: 'ADMIN',
          is_verified: true,
          created_at: '2024-01-01T00:00:00Z',
        },
      };

      (fetchService.post as any).mockResolvedValue(mockResponse);

      const result = await auth.refreshAccessToken('refresh-token');

      expect(fetchService.post).toHaveBeenCalledWith('/auth/refresh', {
        refresh_token: 'refresh-token',
      });
      expect(result).toBe('new-access-token');
      expect(localStorage.getItem('callit_access_token')).toBe('new-access-token');
    });
  });

  describe('setTokens', () => {
    it('应该保存 tokens 和用户信息到 localStorage', () => {
      const authData = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        expires_in: 900,
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@test.com',
          role: 'ADMIN',
          is_verified: true,
          created_at: '2024-01-01T00:00:00Z',
        },
      };

      auth.setTokens(authData);

      expect(localStorage.getItem('callit_access_token')).toBe('access-token');
      expect(localStorage.getItem('callit_refresh_token')).toBe('refresh-token');

      const user = JSON.parse(localStorage.getItem('callit_user') || '{}');
      expect(user).toEqual(authData.user);
    });

    it('应该在没有用户信息时只保存 tokens', () => {
      const authData = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        token_type: 'Bearer',
        expires_in: 900,
      };

      auth.setTokens(authData);

      expect(localStorage.getItem('callit_access_token')).toBe('access-token');
      expect(localStorage.getItem('callit_refresh_token')).toBe('refresh-token');
      expect(localStorage.getItem('callit_user')).toBeNull();
    });

    it('应该清除旧的 tokens', () => {
      localStorage.setItem('callit_access_token', 'old-token');
      localStorage.setItem('callit_refresh_token', 'old-refresh');
      localStorage.setItem('callit_user', JSON.stringify({ id: 1 }));

      const authData = {
        access_token: 'new-token',
        refresh_token: 'new-refresh',
        token_type: 'Bearer',
        expires_in: 900,
      };

      auth.setTokens(authData);

      expect(localStorage.getItem('callit_access_token')).toBe('new-token');
      expect(localStorage.getItem('callit_refresh_token')).toBe('new-refresh');
    });
  });

  describe('logout', () => {
    it('应该清除所有认证信息', () => {
      localStorage.setItem('callit_access_token', 'token');
      localStorage.setItem('callit_refresh_token', 'refresh');
      localStorage.setItem('callit_user', JSON.stringify({ id: 1 }));

      auth.logout();

      expect(localStorage.getItem('callit_access_token')).toBeNull();
      expect(localStorage.getItem('callit_refresh_token')).toBeNull();
      expect(localStorage.getItem('callit_user')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('应该在 token 存在时返回 true', () => {
      localStorage.setItem('callit_access_token', 'token');
      expect(auth.isAuthenticated()).toBe(true);
    });

    it('应该在 token 不存在时返回 false', () => {
      expect(auth.isAuthenticated()).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('应该根据传入的 user 判断权限', () => {
      const adminUser = { id: 1, username: 'admin', email: 'a@b.com', role: 'ADMIN' };
      const normalUser = { id: 2, username: 'user', email: 'u@b.com', role: 'USER' };

      expect(auth.isAdmin(adminUser)).toBe(true);
      expect(auth.isAdmin(normalUser)).toBe(false);
    });

    it('应该在没有传入 user 时从 localStorage 读取', () => {
      const user = { id: 1, username: 'admin', email: 'a@b.com', role: 'ADMIN' };
      localStorage.setItem('callit_user', JSON.stringify(user));

      expect(auth.isAdmin()).toBe(true);
    });
  });
});
