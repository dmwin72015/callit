/**
 * FetchService 完整测试套件
 *
 * 覆盖场景：
 * - 基础请求（GET/POST/PUT/DELETE/PATCH）
 * - 自动 Authorization 头添加
 * - Token 自动刷新
 * - 请求取消
 * - 拦截器（请求/响应/错误）
 * - 事件系统
 * - 错误处理
 * - Token 管理
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchService } from '../lib/http/fetch';
import { FetchCancelError } from '../lib/http/fetch';

// Mock fetch globally
global.fetch = vi.fn();

describe('FetchService', () => {
  beforeEach(() => {
    // 清空 localStorage
    localStorage.clear();

    // 重置 fetch mock
    vi.clearAllMocks();

    // 设置默认 token
    localStorage.setItem('callit_access_token', 'test-access-token');
    localStorage.setItem('callit_refresh_token', 'test-refresh-token');
  });

  afterEach(() => {
    localStorage.clear();
    // 清理所有待处理请求
    fetchService.cancelAllRequests('Test cleanup');
  });

  describe('GET 请求', () => {
    it('应该发送 GET 请求并返回数据', async () => {
      const mockData = { id: 1, name: 'test' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ code: 0, data: mockData, message: 'success' }),
      });

      const result = await fetchService.get('/admin/items');

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        '/admin/api/v1/admin/items',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('应该在请求头中包含 Authorization', async () => {
      const mockData = { id: 1 };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ code: 0, data: mockData, message: 'success' }),
      });

      await fetchService.get('/admin/items');

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[1].headers.Authorization).toBe('Bearer test-access-token');
    });

    it('应该支持查询参数', async () => {
      const mockData = { items: [] };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ code: 0, data: mockData, message: 'success' }),
      });

      await fetchService.get('/admin/items', {
        params: { page: 1, page_size: 20 },
      });

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toContain('?page=1&page_size=20');
    });

    it('应该支持自定义 headers', async () => {
      const mockData = { id: 1 };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ code: 0, data: mockData, message: 'success' }),
      });

      await fetchService.get('/admin/items', {
        headers: { 'X-Custom-Header': 'custom-value' },
      });

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[1].headers['X-Custom-Header']).toBe('custom-value');
    });

    it('应该在没有 token 时仍发送请求', async () => {
      localStorage.clear(); // 清除 token

      const mockData = { public: 'data' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ code: 0, data: mockData, message: 'success' }),
      });

      const result = await fetchService.get('/public/data');

      expect(result).toEqual(mockData);

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[1].headers.Authorization).toBeUndefined();
    });
  });

  describe('POST 请求', () => {
    it('应该发送 POST 请求并返回数据', async () => {
      const mockData = { id: 1, name: 'new item' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ code: 0, data: mockData, message: 'success' }),
      });

      const result = await fetchService.post('/admin/items', {
        name: 'new item',
      });

      expect(result).toEqual(mockData);

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[1].method).toBe('POST');
      expect(fetchCall[1].body).toBe(JSON.stringify({ name: 'new item' }));
    });
  });

  describe('PUT 请求', () => {
    it('应该发送 PUT 请求', async () => {
      const mockData = { id: 1, name: 'updated' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ code: 0, data: mockData, message: 'success' }),
      });

      await fetchService.put('/admin/items/1', { name: 'updated' });

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[1].method).toBe('PUT');
    });
  });

  describe('DELETE 请求', () => {
    it('应该发送 DELETE 请求', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ code: 0, data: null, message: 'success' }),
      });

      await fetchService.delete('/admin/items/1');

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[1].method).toBe('DELETE');
    });
  });

  describe('PATCH 请求', () => {
    it('应该发送 PATCH 请求', async () => {
      const mockData = { id: 1, name: 'patched' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ code: 0, data: mockData, message: 'success' }),
      });

      await fetchService.patch('/admin/items/1', { name: 'patched' });

      const fetchCall = (global.fetch as any).mock.calls[0];
      expect(fetchCall[1].method).toBe('PATCH');
    });
  });

  describe('自动 Token 刷新', () => {
    it('应该自动刷新 token 并重试请求', async () => {
      // 第一次请求返回 401
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ code: 401, message: 'unauthorized' }),
        })
        // Token 刷新成功
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            code: 0,
            data: { access_token: 'new-token', refresh_token: 'new-refresh-token' },
          }),
        })
        // 重试的请求成功
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ code: 0, data: { id: 1 }, message: 'success' }),
        });

      const result = await fetchService.get('/admin/items');

      expect(result).toEqual({ id: 1 });

      // 验证第二次调用是刷新 token
      const refreshCall = (global.fetch as any).mock.calls[1];
      expect(refreshCall[0]).toBe('/admin/api/v1/auth/refresh');

      // 验证第三次调用使用了新 token
      const retryCall = (global.fetch as any).mock.calls[2];
      expect(retryCall[1].headers.Authorization).toBe('Bearer new-token');

      // 验证 localStorage 已更新
      expect(localStorage.getItem('callit_access_token')).toBe('new-token');
    });

    it('应该在刷新失败时抛出错误', async () => {
      // 第一次请求返回 401
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ code: 401, message: 'unauthorized' }),
        })
        // Token 刷新失败
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ code: 0, data: null, message: 'failed' }),
        });

      // 应该抛出错误
      await expect(fetchService.get('/admin/items')).rejects.toThrow('401 Unauthorized');
    });
  });

  describe('请求取消', () => {
    it('应该能够创建取消令牌', () => {
      const cancelToken = fetchService.createCancelToken();
      expect(cancelToken).toHaveProperty('cancel');
      expect(cancelToken).toHaveProperty('requestId');
      expect(cancelToken.requestId).toMatch(/^req_\d+_\d+$/);
    });

    it('应该能够取消单个请求', async () => {
      // 设置一个永远 pending 的 fetch
      (global.fetch as any).mockReturnValue(new Promise(() => {}));

      const cancelToken = fetchService.createCancelToken();
      const requestPromise = fetchService.get('/admin/items', {
        signal: cancelToken,
      });

      // 取消请求
      cancelToken.cancel('Test cancellation');

      // 等待一帧以确保错误被抛出
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(fetchService.getPendingRequestsCount()).toBe(0);
    });

    it('应该能够取消所有请求', async () => {
      // 设置三个永远 pending 的 fetch
      for (let i = 0; i < 3; i++) {
        (global.fetch as any).mockReturnValue(new Promise(() => {}));
        fetchService.get(`/admin/items/${i}`, {
          signal: fetchService.createCancelToken(),
        });
      }

      expect(fetchService.getPendingRequestsCount()).toBe(3);

      fetchService.cancelAllRequests('Cleanup');

      expect(fetchService.getPendingRequestsCount()).toBe(0);
    });

    it('应该跟踪待处理请求数量', () => {
      expect(fetchService.getPendingRequestsCount()).toBe(0);

      const token1 = fetchService.createCancelToken();
      const token2 = fetchService.createCancelToken();

      expect(fetchService.getPendingRequestsCount()).toBe(2);

      token1.cancel();
      expect(fetchService.getPendingRequestsCount()).toBe(1);

      token2.cancel();
      expect(fetchService.getPendingRequestsCount()).toBe(0);
    });
  });

  describe('拦截器', () => {
    it('应该执行请求拦截器', async () => {
      const interceptor = vi.fn().mockReturnValue({
        method: 'GET',
        url: '/admin/items',
      });

      fetchService.addRequestInterceptor(interceptor);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ code: 0, data: {} }),
      });

      await fetchService.get('/admin/items');

      expect(interceptor).toHaveBeenCalled();
    });

    it('应该执行响应拦截器', async () => {
      const interceptor = vi.fn().mockImplementation(({ data }) => {
        return { ...data, transformed: true };
      });

      fetchService.addResponseInterceptor(interceptor);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ code: 0, data: { name: 'test' } }),
      });

      const result = await fetchService.get('/admin/items');

      expect(interceptor).toHaveBeenCalled();
      expect(result).toEqual({ name: 'test', transformed: true });
    });

    it('应该执行错误拦截器', async () => {
      const errorInterceptor = vi.fn();

      fetchService.addErrorInterceptor(errorInterceptor);

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ code: 500, message: 'server error' }),
      });

      try {
        await fetchService.get('/admin/items');
      } catch (e) {
        // Expected to throw
      }

      expect(errorInterceptor).toHaveBeenCalled();
    });

    it('应该支持移除拦截器', async () => {
      const interceptor = vi.fn();

      const index = fetchService.addRequestInterceptor(interceptor);
      fetchService.removeRequestInterceptor(index);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ code: 0, data: {} }),
      });

      await fetchService.get('/admin/items');

      expect(interceptor).not.toHaveBeenCalled();
    });
  });

  describe('事件系统', () => {
    it('应该触发 request 事件', async () => {
      const listener = vi.fn();
      fetchService.on('request', listener);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ code: 0, data: {} }),
      });

      await fetchService.get('/admin/items');

      expect(listener).toHaveBeenCalled();
    });

    it('应该触发 response 事件', async () => {
      const listener = vi.fn();
      fetchService.on('response', listener);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ code: 0, data: {} }),
      });

      await fetchService.get('/admin/items');

      expect(listener).toHaveBeenCalled();
    });

    it('应该触发 error 事件', async () => {
      const listener = vi.fn();
      fetchService.on('error', listener);

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ code: 500, message: 'error' }),
      });

      try {
        await fetchService.get('/admin/items');
      } catch (e) {
        // Expected
      }

      expect(listener).toHaveBeenCalled();
    });

    it('应该能够移除事件监听器', async () => {
      const listener = vi.fn();
      fetchService.on('request', listener);
      fetchService.off('request', listener);

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ code: 0, data: {} }),
      });

      await fetchService.get('/admin/items');

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Token 管理', () => {
    it('应该能设置和获取 access token', () => {
      fetchService.setAccessToken('new-token');
      expect(fetchService.getAccessToken()).toBe('new-token');
    });

    it('应该能获取 refresh token', () => {
      expect(fetchService.getRefreshToken()).toBe('test-refresh-token');
    });

    it('应该能清除所有 tokens', () => {
      fetchService.setAccessToken('token1');
      localStorage.setItem('callit_refresh_token', 'refresh1');

      fetchService.clearTokens();

      expect(fetchService.getAccessToken()).toBeNull();
      expect(fetchService.getRefreshToken()).toBeNull();
    });
  });

  describe('错误处理', () => {
    it('应该抛出 401 错误', async () => {
      // 首次请求返回 401（且 refresh token 无效）
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ code: 401, message: 'unauthorized' }),
        })
        // 刷新 token 失败（返回 code !== 0）
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ code: 500, message: 'refresh failed' }),
        });

      await expect(fetchService.get('/admin/items')).rejects.toThrow('401 Unauthorized');
    }, 10000);

    it('应该抛出业务错误（code !== 0）', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ code: 400, message: 'bad request', data: null }),
      });

      await expect(fetchService.get('/admin/items')).rejects.toThrow('bad request');
    });

    it('应该处理网络错误', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchService.get('/admin/items')).rejects.toThrow('Network error');
    });
  });
});
