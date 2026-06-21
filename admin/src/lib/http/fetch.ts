import type { ApiResponse } from '../../types';

// ============================================================================
// 类型定义
// ============================================================================

/** 请求配置 */
export interface FetchConfig extends Omit<RequestInit, 'signal'> {
  params?: Record<string, unknown>;
  url?: string; // 用于事件监听时保存完整 URL
  signal?: CancelToken; // 取消令牌（自定义，非 AbortSignal）
  _retry?: boolean; // 内部标记：是否已经重试过
}

/** 请求拦截器 - 在发送请求前修改配置 */
export type RequestInterceptor = (config: FetchConfig) => FetchConfig | Promise<FetchConfig>;

/** 响应拦截器 - 在响应返回后处理数据 */
export type ResponseInterceptor = <T>(
  response: { data: T; response: Response }
) => T | Promise<T>;

/** 错误拦截器 - 处理请求错误 */
export type ErrorInterceptor = (error: Error) => void | Promise<void>;

/** 请求事件类型 */
export type FetchEventType = 'request' | 'response' | 'error' | 'authError';

/** 请求事件监听器 */
export type FetchEventListener = (
  config: FetchConfig,
  next: (config: FetchConfig) => void
) => void;

/** 请求取消令牌 */
export interface CancelToken {
  /** 取消请求 */
  cancel: (reason?: string) => void;
  /** 请求 ID */
  requestId: string;
}

/** 取消错误 */
export class FetchCancelError extends Error {
  constructor(
    public requestId: string,
    message?: string
  ) {
    super(message || `Request ${requestId} was cancelled`);
    this.name = 'FetchCancelError';
  }
}

// ============================================================================
// FetchService 类
// ============================================================================

class FetchService {
  private baseURL: string;

  // 拦截器集合
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  // 事件监听器
  private eventListeners: Map<FetchEventType, FetchEventListener[]> = new Map();

  // 请求 ID 生成器
  private requestIdCounter = 0;

  // 存储取消令牌和对应的 AbortController
  private abortControllers = new Map<string, AbortController>();

  // Token 刷新相关
  private isRefreshing = false;
  private refreshSubscribers: ((token: string | null) => void)[] = [];

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL;
  }

  // ============================================================================
  // 拦截器管理
  // ============================================================================

  /**
   * 添加请求拦截器
   * @param interceptor 请求拦截器函数
   * @returns 拦截器索引，可用于移除
   */
  addRequestInterceptor(interceptor: RequestInterceptor): number {
    this.requestInterceptors.push(interceptor);
    return this.requestInterceptors.length - 1;
  }

  /**
   * 移除请求拦截器
   * @param index 拦截器索引
   */
  removeRequestInterceptor(index: number): void {
    this.requestInterceptors.splice(index, 1);
  }

  /**
   * 添加响应拦截器
   * @param interceptor 响应拦截器函数
   * @returns 拦截器索引
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): number {
    this.responseInterceptors.push(interceptor);
    return this.responseInterceptors.length - 1;
  }

  /**
   * 移除响应拦截器
   * @param index 拦截器索引
   */
  removeResponseInterceptor(index: number): void {
    this.responseInterceptors.splice(index, 1);
  }

  /**
   * 添加错误拦截器
   * @param interceptor 错误拦截器函数
   * @returns 拦截器索引
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): number {
    this.errorInterceptors.push(interceptor);
    return this.errorInterceptors.length - 1;
  }

  /**
   * 移除错误拦截器
   * @param index 拦截器索引
   */
  removeErrorInterceptor(index: number): void {
    this.errorInterceptors.splice(index, 1);
  }

  // ============================================================================
  // 请求取消管理
  // ============================================================================

  /**
   * 创建取消令牌
   * @returns CancelToken 对象
   */
  createCancelToken(): CancelToken {
    const requestId = `req_${Date.now()}_${++this.requestIdCounter}`;
    const abortController = new AbortController();

    this.abortControllers.set(requestId, abortController);

    return {
      cancel: (reason?: string) => {
        this.cancelRequest(requestId, reason);
      },
      requestId,
    };
  }

  /**
   * 取消指定的请求
   * @param requestId 请求 ID
   * @param reason 取消原因
   */
  cancelRequest(requestId: string, reason?: string): void {
    const abortController = this.abortControllers.get(requestId);
    if (abortController) {
      abortController.abort(reason);
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * 取消所有正在进行的请求
   * @param reason 取消原因
   */
  cancelAllRequests(reason?: string): void {
    this.abortControllers.forEach((controller) => {
      controller.abort(reason);
    });
    this.abortControllers.clear();
  }

  /**
   * 获取当前正在进行的请求数量
   */
  getPendingRequestsCount(): number {
    return this.abortControllers.size;
  }

  /**
   * 检查指定请求是否正在执行
   * @param requestId 请求 ID
   */
  isRequestPending(requestId: string): boolean {
    return this.abortControllers.has(requestId);
  }

  /**
   * 清理已完成的请求记录
   * @param requestId 请求 ID
   */
  cleanupRequest(requestId: string): void {
    this.abortControllers.delete(requestId);
  }

  // ============================================================================
  // Token 刷新管理
  // ============================================================================

  /**
   * 订阅 token 刷新事件
   * @param callback 接收新 token 的回调（null 表示刷新失败）
   */
  subscribeTokenRefresh(callback: (token: string | null) => void): void {
    this.refreshSubscribers.push(callback);
  }

  /**
   * 通知所有订阅者 token 已刷新
   * @param token 新的 access token，null 表示刷新失败
   */
  onTokenRefreshed(token: string | null): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  /**
   * 等待 token 刷新完成
   */
  private waitForTokenRefresh(): Promise<string | null> {
    return new Promise((resolve) => {
      this.subscribeTokenRefresh((token) => {
        resolve(token);
      });
    });
  }

  /**
   * 刷新 access token
   */
  private async refreshAccessToken(config: FetchConfig): Promise<string | null> {
    if (this.isRefreshing) {
      return null;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    this.isRefreshing = true;

    try {
      // 使用 fetch 直接调用刷新接口，避免循环
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data: ApiResponse<{ accessToken: string; refreshToken?: string }> =
        await response.json();

      if (data.code === 0 && data.data.accessToken) {
        const newToken = data.data.accessToken;

        // 更新 token
        this.setAccessToken(newToken);

        // 如果接口返回了新 refresh token，也更新
        if (data.data.refreshToken) {
          localStorage.setItem('callit_refresh_token', data.data.refreshToken);
        }

        // 通知所有等待的请求
        this.onTokenRefreshed(newToken as string);

        return newToken;
      }

      // 刷新失败，清除 token 并跳转登录
      this.clearTokens();
      this.onTokenRefreshed(null);
      this.emitAuthError(config);
      return null;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * 触发认证错误事件（供 UI 层处理跳转）
   */
  private emitAuthError(config: FetchConfig): void {
    // 触发认证错误事件
    this.emit('authError', config);

    // 延迟跳转，让事件监听器有机会处理
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 100);
  }

  /**
   * 设置新的 access token
   * @param token 新的 token
   */
  setAccessToken(token: string): void {
    localStorage.setItem('callit_access_token', token);
  }

  /**
   * 获取当前 access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('callit_access_token');
  }

  /**
   * 获取 refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('callit_refresh_token');
  }

  /**
   * 清除所有 token
   */
  clearTokens(): void {
    localStorage.removeItem('callit_access_token');
    localStorage.removeItem('callit_refresh_token');
  }

  // ============================================================================
  // Token 刷新管理
  // ============================================================================

  // ============================================================================
  // 事件系统
  // ============================================================================

  /**
   * 添加请求事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   */
  on(event: FetchEventType, listener: FetchEventListener): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(listener);
    this.eventListeners.set(event, listeners);
  }

  /**
   * 移除请求事件监听器
   * @param event 事件类型
   * @param listener 监听器函数
   */
  off(event: FetchEventType, listener: FetchEventListener): void {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * 触发事件
   */
  private emit(event: FetchEventType, config: FetchConfig): void {
    const listeners = this.eventListeners.get(event) || [];
    let called = false;

    // 串行执行所有监听器
    const next = (cfg: FetchConfig) => {
      if (!called) {
        called = true;
        listeners.forEach((listener) => listener(cfg, () => {}));
      }
    };

    listeners.forEach((listener) => listener(config, next));
  }

  // ============================================================================
  // 核心请求方法
  // ============================================================================

  /**
   * 执行 HTTP 请求（经过拦截器链）
   */
  private async request<T>(
    endpoint: string,
    config: FetchConfig = {}
  ): Promise<T> {
    // 1. 触发 request 事件
    this.emit('request', config);

    // 2. 执行请求拦截器
    let processedConfig = { ...config };
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig);
    }

    // 3. 构建完整 URL
    let url = `${this.baseURL}${endpoint}`;

    // 处理查询参数
    if (processedConfig.params) {
      const searchParams = new URLSearchParams();
      Object.entries(processedConfig.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    // 4. 准备请求选项
    // 从 processedConfig 中提取 cancelToken 和 abortController，避免传递给 RequestInit
    const { signal: cancelToken, ...restConfig } = processedConfig;
    const abortController = cancelToken
      ? this.abortControllers.get(cancelToken.requestId)
      : undefined;

    // 自动添加 Authorization 头（从 localStorage 读取 token）
    const token = this.getAccessToken();

    const requestOptions: RequestInit = {
      ...restConfig,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...processedConfig.headers,
      },
    };

    // 5. 添加 AbortController 的 signal
    if (abortController) {
      requestOptions.signal = abortController.signal;
    }

    // 6. 发送请求
    try {
      const response = await fetch(url, requestOptions);
      const data: ApiResponse<T> = await response.json();

      // 7. 触发 response 事件
      this.emit('response', processedConfig);

      // 8. 执行响应拦截器
      let result: T = data.data;
      for (const interceptor of this.responseInterceptors) {
        result = await interceptor({ data: result, response });
      }

      // 9. 清理请求记录
      if (cancelToken) {
        this.cleanupRequest(cancelToken.requestId);
      }

      // 10. 检查响应状态
      if (!response.ok || data.code !== 0) {
        // 处理 401 未授权 - 尝试刷新 token
        if (data.code === 401 || response.status === 401) {
          throw new Error('401 Unauthorized');
        }

        throw new Error(data.message || '请求失败');
      }

      return result;
    } catch (error) {
      // 11. 处理取消错误
      if (error instanceof Error && error.name === 'AbortError') {
        const cancelReason = cancelToken
          ? `Request ${cancelToken.requestId} was cancelled`
          : 'Request was cancelled';
        const cancelError = new FetchCancelError(
          cancelToken?.requestId || 'unknown',
          cancelReason
        );

        // 不触发 error 拦截器（取消不是错误）
        // 不触发 error 事件

        // 清理请求记录
        if (cancelToken) {
          this.cleanupRequest(cancelToken.requestId);
        }

        throw cancelError;
      }

      // 12. 处理 401 错误 - 自动刷新 token
      if (error instanceof Error && error.message.includes('401')) {
        // 已经尝试过刷新 token，不再重试
        if (processedConfig._retry) {
          this.clearTokens();
          this.emitAuthError(processedConfig);
          throw error;
        }

        // 标记已经重试过，避免无限循环
        processedConfig._retry = true;

        // 如果正在刷新，等待刷新完成
        if (this.isRefreshing) {
          try {
            const newToken = await this.waitForTokenRefresh();
            if (newToken) {
              // 使用新 token 重试请求
              processedConfig.headers = {
                ...processedConfig.headers,
                Authorization: `Bearer ${newToken}`,
              };
              return this.request<T>(endpoint, processedConfig);
            }
            // 刷新失败，跳转登录
            this.clearTokens();
            this.emitAuthError(processedConfig);
            throw new Error('401 Unauthorized');
          } catch (waitError) {
            this.clearTokens();
            this.emitAuthError(processedConfig);
            throw waitError;
          }
        }

        // 尝试刷新 token
        try {
          const newToken = await this.refreshAccessToken(processedConfig);
          if (newToken) {
            // 使用新 token 重试请求
            processedConfig.headers = {
              ...processedConfig.headers,
              Authorization: `Bearer ${newToken}`,
            };
            return this.request<T>(endpoint, processedConfig);
          }
          // 刷新失败，跳转登录
          this.clearTokens();
          this.emitAuthError(processedConfig);
          throw new Error('401 Unauthorized');
        } catch (refreshError) {
          this.clearTokens();
          this.emitAuthError(processedConfig);
          throw refreshError;
        }
      }

      // 13. 触发 error 事件
      this.emit('error', processedConfig);

      // 14. 执行错误拦截器
      const err = error instanceof Error ? error : new Error(String(error));
      for (const interceptor of this.errorInterceptors) {
        await interceptor(err);
      }

      throw err;
    }
  }

  // ============================================================================
  // HTTP 方法
  // ============================================================================

  async get<T>(endpoint: string, config?: FetchConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, config?: FetchConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown, config?: FetchConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, config?: FetchConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  async patch<T>(endpoint: string, body?: unknown, config?: FetchConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }
}

// ============================================================================
// 导出
// ============================================================================

export const fetchService = new FetchService();
export default fetchService;
