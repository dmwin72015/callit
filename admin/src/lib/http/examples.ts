/**
 * FetchService 使用示例
 *
 * 本文件展示如何使用拦截器和其他高级功能
 */

import { fetchService } from './fetch';

// ============================================================================
// 拦截器使用示例
// ============================================================================

/**
 * 示例 1: 请求拦截器 - 添加自定义请求头
 *
 * ⚠️ 注意：Authorization 头已由 FetchService 自动处理（从 localStorage 读取 token）
 * 此示例仅用于演示拦截器模式，实际使用中不需要手动添加 token
 */
export function setupCustomHeadersInterceptor() {
  fetchService.addRequestInterceptor((config) => {
    // 可以添加其他自定义请求头
    config.headers = {
      ...config.headers,
      'X-Custom-Header': 'custom-value',
    };
    return config;
  });
}

/**
 * 示例 2: 请求拦截器 - 自动添加时间戳
 */
export function setupTimestampInterceptor() {
  fetchService.addRequestInterceptor((config) => {
    config.headers = {
      ...config.headers,
      'X-Request-Time': new Date().toISOString(),
    };
    return config;
  });
}

/**
 * 示例 3: 响应拦截器 - 统一处理响应数据
 */
export function setupResponseInterceptor() {
  fetchService.addResponseInterceptor(({ data, response }) => {
    // 可以在这里统一处理响应数据
    console.log('Response received:', response.url);

    // 例如：统一处理日期格式
    if (data && typeof data === 'object' && 'created_at' in data) {
      return {
        ...data,
        created_at: new Date((data as any).created_at).toLocaleDateString('zh-CN'),
      };
    }

    return data;
  });
}

/**
 * 示例 4: 错误拦截器 - 统一处理 401 未授权
 */
export function setupErrorInterceptor() {
  fetchService.addErrorInterceptor(async (error) => {
    const message = error.message;

    // 处理 401 未授权 - 刷新 token
    if (message.includes('401') || message.includes('未授权')) {
      console.log('Token expired, attempting to refresh...');

      try {
        const refreshToken = localStorage.getItem('callit_refresh_token');
        if (refreshToken) {
          // 调用刷新 token 接口
          // const newToken = await refreshTokenApi(refreshToken);
          // localStorage.setItem('callit_access_token', newToken);
          console.log('Token refreshed successfully');
        } else {
          // 没有 refresh token，跳转到登录页
          window.location.href = '/admin/login';
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        window.location.href = '/admin/login';
      }
    }

    // 处理 403 权限不足
    if (message.includes('403') || message.includes('权限')) {
      console.error('Permission denied');
      // 可以跳转到权限不足页面
    }

    // 处理 500 服务器错误
    if (message.includes('500') || message.includes('服务器')) {
      console.error('Server error');
      // 可以显示友好的错误提示
    }
  });
}

/**
 * 示例 5: 事件监听 - 监控所有请求
 */
export function setupEventListeners() {
  // 监听所有请求
  fetchService.on('request', (config, next) => {
    console.log('Request:', config.method, config.url);
    next(config);
  });

  // 监听所有响应
  fetchService.on('response', (config) => {
    console.log('Response received for:', config.url);
  });

  // 监听所有错误
  fetchService.on('error', (config) => {
    console.error('Request error:', config.url);
  });
}

// ============================================================================
// 请求取消示例
// ============================================================================

/**
 * 示例 6: 创建可取消的请求
 */
export function setupCancellableRequest() {
  // 创建取消令牌
  const cancelToken = fetchService.createCancelToken();
  const requestId = cancelToken.requestId;

  // 发起请求
  fetchService
    .get('/admin/items', { signal: cancelToken })
    .then((data) => {
      console.log('Request completed:', data);
    })
    .catch((error) => {
      if (error instanceof Error && error.name === 'FetchCancelError') {
        console.log('Request was cancelled:', error.message);
      } else {
        console.error('Request failed:', error);
      }
    });

  // 在某个时刻取消请求（例如组件卸载、用户操作等）
  // cancelToken.cancel('User navigated away');

  return { cancelToken, requestId };
}

/**
 * 示例 7: 组件卸载时取消请求（React Hooks 模式）
 */
export function useCancellableRequest() {
  // 在组件挂载时创建取消令牌
  const cancelTokenRef = { current: null as any };

  // 发起请求
  const fetchData = async () => {
    const cancelToken = fetchService.createCancelToken();
    cancelTokenRef.current = cancelToken;

    try {
      const data = await fetchService.get('/admin/items', {
        signal: cancelToken,
        params: { page: 1 },
      });
      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'FetchCancelError') {
        console.log('Request cancelled');
        return null;
      }
      throw error;
    }
  };

  // 在组件卸载时取消请求
  // useEffect(() => {
  //   return () => {
  //     if (cancelTokenRef.current) {
  //       cancelTokenRef.current.cancel('Component unmounted');
  //     }
  //   };
  // }, []);

  return { fetchData };
}

/**
 * 示例 8: 搜索防抖 + 取消旧请求
 */
export function setupSearchWithCancel() {
  let currentCancelToken: any = null;

  const search = async (query: string) => {
    // 取消之前的请求
    if (currentCancelToken) {
      currentCancelToken.cancel('New search query');
    }

    // 创建新的取消令牌
    currentCancelToken = fetchService.createCancelToken();

    try {
      const results = await fetchService.get('/admin/items/search', {
        signal: currentCancelToken,
        params: { q: query },
      });
      return results;
    } catch (error) {
      if (error instanceof Error && error.name === 'FetchCancelError') {
        console.log('Previous search cancelled');
        return null;
      }
      throw error;
    }
  };

  return search;
}

/**
 * 示例 9: 取消所有请求
 */
export function cancelAllPendingRequests() {
  fetchService.cancelAllRequests('User logged out');
}

/**
 * 示例 10: 检查请求状态
 */
export function checkRequestStatus() {
  // 检查有多少请求正在执行
  const pendingCount = fetchService.getPendingRequestsCount();
  console.log(`Pending requests: ${pendingCount}`);

  // 检查特定请求是否还在执行
  const cancelToken = fetchService.createCancelToken();
  const isPending = fetchService.isRequestPending(cancelToken.requestId);
  console.log(`Request ${cancelToken.requestId} is pending: ${isPending}`);

  return { cancelToken, isPending };
}

/**
 * 示例 11: 自动刷新 Token
 */
export function setupAutoRefreshToken() {
  // 监听认证错误事件
  fetchService.on('authError', () => {
    console.log('认证失败，跳转到登录页');
    // 这里可以显示提示信息
    // message.error('登录已过期，请重新登录');
  });

  // FetchService 会自动处理 401 错误并刷新 token
  // 无需手动干预，除非需要自定义处理逻辑

  console.log('自动刷新 token 已启用（自动处理，无需手动调用）');
}

// ============================================================================
// 实际使用示例
// ============================================================================

/**
 * 基础 GET 请求（示例）
 */
// @ts-expect-error - 示例代码，仅用于展示用法
async function _fetchItems() {
  try {
    const items = await fetchService.get('/admin/items', {
      params: { page: 1, page_size: 20 },
    });
    return items;
  } catch (error) {
    console.error('Failed to fetch items:', error);
    throw error;
  }
}

/**
 * POST 请求（示例）
 */
// @ts-expect-error - 示例代码，仅用于展示用法
async function _createItem(itemData: { name: string; description: string }) {
  try {
    const newItem = await fetchService.post('/admin/items', itemData);
    return newItem;
  } catch (error) {
    console.error('Failed to create item:', error);
    throw error;
  }
}

/**
 * 带自定义配置的请求（示例）
 */
// @ts-expect-error - 示例代码，仅用于展示用法
async function _fetchWithCustomConfig() {
  try {
    const data = await fetchService.get('/admin/stats', {
      headers: {
        'X-Custom-Header': 'value',
      },
    });
    return data;
  } catch (error) {
    console.error('Failed:', error);
    throw error;
  }
}

/**
 * PATCH 请求（示例）
 */
// @ts-expect-error - 示例代码，仅用于展示用法
async function _updateItemPartial(id: number, updates: Partial<{ name: string; description: string }>) {
  try {
    const updated = await fetchService.patch(`/admin/items/${id}`, updates);
    return updated;
  } catch (error) {
    console.error('Failed to update item:', error);
    throw error;
  }
}

// ============================================================================
// 完整初始化示例
// ============================================================================

/**
 * 在应用启动时配置所有拦截器
 *
 * 注意：Authorization 头已由 FetchService 自动处理，无需手动配置
 */
export function initializeHttpClient() {
  // 添加时间戳拦截器（可选）
  setupTimestampInterceptor();

  // 添加响应拦截器
  setupResponseInterceptor();

  // 添加错误拦截器
  setupErrorInterceptor();

  // 添加事件监听（可选，用于调试）
  if (import.meta.env.DEV) {
    setupEventListeners();
  }

  console.log('HTTP client initialized with interceptors');
}
