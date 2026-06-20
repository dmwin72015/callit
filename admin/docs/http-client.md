# HTTP 客户端文档

## 概述

`FetchService` 是基于原生 Fetch API 封装的 HTTP 客户端，提供了类似 axios 的 API 设计和拦截器功能。

**位置**: `src/lib/http/fetch.ts`

## 特性

- ✅ 完整的拦截器支持（请求/响应/错误）
- ✅ 事件系统（request/response/error）
- ✅ **自动认证头管理**（自动从 localStorage 读取 token 并添加到 Authorization 头）
- ✅ 统一的错误处理
- ✅ TypeScript 类型安全
- ✅ 支持所有 HTTP 方法（GET/POST/PUT/DELETE/PATCH）
- ✅ **请求取消**（基于 AbortController）

## 基础使用

### 初始化

```typescript
import { fetchService } from '@/lib/http';

// 自动初始化（main.tsx 中调用）
import { initializeHttpClient } from '@/lib/http/examples';
initializeHttpClient();
```

### 基本请求

```typescript
// GET 请求
const items = await fetchService.get('/admin/items', {
  params: { page: 1, page_size: 20 }
});

// POST 请求
const newItem = await fetchService.post('/admin/items', {
  name: '测试条目',
  description: '描述'
});

// PUT 请求
const updated = await fetchService.put(`/admin/items/${id}`, {
  name: '更新名称'
});

// DELETE 请求
await fetchService.delete(`/admin/items/${id}`);

// PATCH 请求（部分更新）
const patched = await fetchService.patch(`/admin/items/${id}`, {
  description: '更新描述'
});
```

## 拦截器

### 请求拦截器

在请求发送前修改配置：

```typescript
// 添加请求拦截器
fetchService.addRequestInterceptor((config) => {
  // 添加自定义 header
  config.headers = {
    ...config.headers,
    'X-Request-ID': generateRequestId(),
  };

  // 记录请求日志
  console.log('Request:', config.method, config.url);

  return config;
});

// 可以添加多个拦截器，按顺序执行
fetchService.addRequestInterceptor(async (config) => {
  // 异步操作（如动态获取 token）
  const token = await getTokenAsync();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### 响应拦截器

在响应返回后处理数据：

```typescript
fetchService.addResponseInterceptor(({ data, response }) => {
  // 统一处理日期格式
  if (data.created_at) {
    data.created_at = new Date(data.created_at).toLocaleDateString('zh-CN');
  }

  // 添加额外元数据
  return {
    ...data,
    _responseTime: response.headers.get('X-Response-Time'),
  };
});
```

### 错误拦截器

统一处理请求错误：

```typescript
fetchService.addErrorInterceptor(async (error) => {
  const message = error.message;

  // 处理 401 未授权
  if (message.includes('401')) {
    try {
      // 尝试刷新 token
      const newToken = await refreshToken();
      localStorage.setItem('callit_access_token', newToken);

      // 重试原请求（需要手动实现重试逻辑）
    } catch {
      // 刷新失败，跳转到登录页
      window.location.href = '/admin/login';
    }
  }

  // 处理 403 权限不足
  if (message.includes('403')) {
    message.error('权限不足');
  }

  // 处理 500 服务器错误
  if (message.includes('500')) {
    message.error('服务器错误，请稍后重试');
  }

  // 处理网络错误
  if (!navigator.onLine) {
    message.error('网络连接失败');
  }
});
```

## 事件系统

监听请求生命周期事件：

```typescript
// 监听所有请求
fetchService.on('request', (config, next) => {
  console.log('Request:', config.method, config.url);
  // 可以修改 config
  // config.headers['X-Custom'] = 'value';
  next(config); // 继续执行
});

// 监听所有响应
fetchService.on('response', (config) => {
  console.log('Response:', config.url);
});

// 监听所有错误
fetchService.on('error', (config) => {
  console.error('Error:', config.url);
});

// 移除监听器
const listener = (config, next) => { /* ... */ };
fetchService.on('request', listener);
// ...
fetchService.off('request', listener);
```

## 完整初始化示例

```typescript
// src/main.tsx 或 src/App.tsx

import { initializeHttpClient } from '@/lib/http/examples';

// 应用启动时初始化
initializeHttpClient();
```

对应的 `initializeHttpClient` 会：

1. 添加认证拦截器（自动添加 Bearer token）
2. 添加时间戳拦截器
3. 添加响应拦截器（统一数据转换）
4. 添加错误拦截器（处理 401/403/500）
5. 在开发环境添加事件监听（调试用）

## API 参考

### FetchService 方法

#### `get<T>(endpoint, config?)`

GET 请求

```typescript
get<T>(
  endpoint: string,
  config?: FetchConfig
): Promise<T>
```

**参数**:

- `endpoint`: API 端点路径
- `config`: 可选配置
  - `params`: URL 查询参数对象
  - `headers`: 自定义请求头
  - 其他标准 RequestInit 选项

#### `post<T>(endpoint, body?, config?)`

POST 请求

```typescript
post<T>(
  endpoint: string,
  body?: unknown,
  config?: FetchConfig
): Promise<T>
```

#### `put<T>(endpoint, body?, config?)`

PUT 请求

```typescript
put<T>(
  endpoint: string,
  body?: unknown,
  config?: FetchConfig
): Promise<T>
```

#### `patch<T>(endpoint, body?, config?)`

PATCH 请求（部分更新）

```typescript
patch<T>(
  endpoint: string,
  body?: unknown,
  config?: FetchConfig
): Promise<T>
```

#### `delete<T>(endpoint, config?)`

DELETE 请求

```typescript
delete<T>(
  endpoint: string,
  config?: FetchConfig
): Promise<T>
```

### 拦截器方法

#### `addRequestInterceptor(interceptor)`

添加请求拦截器，返回索引用于移除

```typescript
addRequestInterceptor(
  interceptor: RequestInterceptor
): number
```

#### `removeRequestInterceptor(index)`

移除请求拦截器

```typescript
removeRequestInterceptor(index: number): void
```

#### `addResponseInterceptor(interceptor)`

添加响应拦截器

```typescript
addResponseInterceptor(
  interceptor: ResponseInterceptor
): number
```

#### `removeResponseInterceptor(index)`

移除响应拦截器

```typescript
removeResponseInterceptor(index: number): void
```

#### `addErrorInterceptor(interceptor)`

添加错误拦截器

```typescript
addErrorInterceptor(
  interceptor: ErrorInterceptor
): number
```

#### `removeErrorInterceptor(index)`

移除错误拦截器

```typescript
removeErrorInterceptor(index: number): void
```

### 事件方法

#### `on(event, listener)`

添加事件监听器

```typescript
on(
  event: FetchEventType,
  listener: FetchEventListener
): void
```

**事件类型**:

- `'request'` - 请求发送前
- `'response'` - 响应收到后
- `'error'` - 请求出错时

#### `off(event, listener)`

移除事件监听器

```typescript
off(
  event: FetchEventType,
  listener: FetchEventListener
): void
```

## 类型定义

### FetchConfig

```typescript
interface FetchConfig extends RequestInit {
  params?: Record<string, unknown>; // 查询参数
  url?: string; // 完整 URL（用于事件监听）
}
```

### RequestInterceptor

```typescript
type RequestInterceptor = (
  config: FetchConfig
) => FetchConfig | Promise<FetchConfig>;
```

### ResponseInterceptor

```typescript
type ResponseInterceptor = <T>(
  response: { data: T; response: Response }
) => T | Promise<T>;
```

### ErrorInterceptor

```typescript
type ErrorInterceptor = (error: Error) => void | Promise<void>;
```

## 与 axios 对比

| 特性 | FetchService | axios |
|------|-------------|-------|
| 拦截器 | ✅ 支持 | ✅ 支持 |
| 请求取消 | ❌ 不支持 | ✅ 支持 |
| 进度监控 | ❌ 不支持 | ✅ 支持 |
| 文件上传 | ✅ 支持 | ✅ 支持 |
| 体积 | 小（原生） | 较大 |
| 类型支持 | ✅ 完整 | ✅ 完整 |
| 浏览器支持 | Fetch API | XMLHttpRequest |

## 最佳实践

1. **在应用启动时初始化拦截器**：统一配置，避免重复代码
2. **错误拦截器放在最后**：先处理特定错误，最后处理通用错误
3. **响应拦截器保持纯净**：只做数据转换，不要包含业务逻辑
4. **合理使用事件系统**：用于日志、监控、调试
5. **不要在拦截器中修改响应数据原始值**：保持数据不可变性

## 注意事项

- 拦截器按添加顺序执行（请求）或逆序执行（响应）
- 拦截器支持异步操作
- 错误拦截器不会阻止错误抛出，只用于额外处理
- 事件监听器是串行执行的
- 取消请求时会抛出 `FetchCancelError`，需要特殊处理
- 取消请求不会触发 error 事件和错误拦截器
- AbortController 基于浏览器原生 API，性能优异

## 请求取消

### 概述

FetchService 支持请求取消功能，基于浏览器原生的 `AbortController` API 实现。

### 创建可取消的请求

```typescript
// 1. 创建取消令牌
const cancelToken = fetchService.createCancelToken();
const requestId = cancelToken.requestId;

// 2. 发起请求时传入取消令牌
try {
  const data = await fetchService.get('/admin/items', {
    signal: cancelToken,
    params: { page: 1 }
  });
  console.log('请求完成:', data);
} catch (error) {
  // 3. 处理取消错误
  if (error instanceof Error && error.name === 'FetchCancelError') {
    console.log('请求被取消:', error.message);
  } else {
    console.error('请求失败:', error);
  }
}

// 4. 在需要时取消请求
cancelToken.cancel('用户取消操作');
```

### 实用场景

#### 场景 1: 组件卸载时取消请求

```typescript
import { useEffect, useRef } from 'react';
import { fetchService } from '@/lib/http';

function MyComponent() {
  const cancelTokenRef = useRef(null);

  useEffect(() => {
    // 创建取消令牌
    cancelTokenRef.current = fetchService.createCancelToken();

    // 发起请求
    fetchService
      .get('/admin/items', { signal: cancelTokenRef.current })
      .then(setData)
      .catch(handleError);

    // 组件卸载时取消请求
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted');
      }
    };
  }, []);

  return <div>...</div>;
}
```

#### 场景 2: 搜索防抖 + 取消旧请求

```typescript
import { useDebounce } from '@/hooks';
import { fetchService } from '@/lib/http';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const cancelTokenRef = useRef(null);

  useEffect(() => {
    // 取消之前的请求
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('New search query');
    }

    if (!debouncedQuery) return;

    // 创建新的取消令牌
    cancelTokenRef.current = fetchService.createCancelToken();

    // 发起新请求
    fetchService
      .get('/admin/items/search', {
        signal: cancelTokenRef.current,
        params: { q: debouncedQuery }
      })
      .then(setResults)
      .catch((error) => {
        // 忽略取消错误
        if (error.name !== 'FetchCancelError') {
          console.error(error);
        }
      });
  }, [debouncedQuery]);

  return <input onChange={(e) => setQuery(e.target.value)} />;
}
```

#### 场景 3: 用户登出时取消所有请求

```typescript
function logout() {
  // 取消所有正在进行的请求
  fetchService.cancelAllRequests('User logged out');

  // 清除认证信息
  authStore.getState().logout();

  // 跳转到登录页
  navigate('/admin/login');
}
```

#### 场景 4: 取消特定请求

```typescript
// 保存取消令牌
const cancelTokens = new Map<string, CancelToken>();

// 发起请求并保存令牌
function fetchItem(id: number) {
  const cancelToken = fetchService.createCancelToken();
  cancelTokens.set(id, cancelToken);

  return fetchService.get(`/admin/items/${id}`, { signal: cancelToken });
}

// 取消特定条目的请求
function cancelFetchItem(id: number) {
  const cancelToken = cancelTokens.get(id);
  if (cancelToken) {
    cancelToken.cancel('User navigated away');
    cancelTokens.delete(id);
  }
}
```

### API 参考

#### `createCancelToken()`

创建取消令牌

```typescript
createCancelToken(): CancelToken
```

**返回值**: `CancelToken` 对象
- `cancel: (reason?: string) => void` - 取消请求的方法
- `requestId: string` - 请求唯一标识

#### `cancelRequest(requestId, reason?)`

取消指定的请求

```typescript
cancelRequest(requestId: string, reason?: string): void
```

**参数**:
- `requestId` - 请求 ID（从 CancelToken 获取）
- `reason` - 取消原因（可选）

#### `cancelAllRequests(reason?)`

取消所有正在进行的请求

```typescript
cancelAllRequests(reason?: string): void
```

**参数**:
- `reason` - 取消原因（可选）

#### `getPendingRequestsCount()`

获取当前正在进行的请求数量

```typescript
getPendingRequestsCount(): number
```

**返回值**: 正在进行的请求数

#### `isRequestPending(requestId)`

检查指定请求是否正在执行

```typescript
isRequestPending(requestId: string): boolean
```

**参数**:
- `requestId` - 请求 ID

**返回值**: 是否正在执行

#### `cleanupRequest(requestId)`

清理已完成的请求记录

```typescript
cleanupRequest(requestId: string): void
```

**参数**:
- `requestId` - 请求 ID

### 类型定义

#### CancelToken

```typescript
interface CancelToken {
  cancel: (reason?: string) => void;
  requestId: string;
}
```

#### FetchCancelError

```typescript
class FetchCancelError extends Error {
  constructor(
    public requestId: string,
    message?: string
  );
}
```

**属性**:
- `requestId` - 被取消的请求 ID
- `message` - 错误信息

### 最佳实践

1. **组件卸载时取消请求**：避免内存泄漏和状态更新警告
2. **搜索场景取消旧请求**：只处理最新的搜索结果，减少服务器压力
3. **用户操作取消请求**：如页面跳转、关闭弹窗时取消
4. **登出时取消所有请求**：避免已登出用户的请求继续执行
5. **忽略取消错误**：在 catch 中检查 `FetchCancelError` 并忽略

### 注意事项

- 取消请求会抛出 `FetchCancelError`，需要特殊处理
- 取消请求不会触发 error 事件和错误拦截器
- 取消请求不会影响其他正在进行的请求
- 每个 CancelToken 只能取消一个请求
- 请求完成后会自动清理，无需手动调用 `cleanupRequest`

## 相关文件

- `src/lib/http/fetch.ts` - HTTP 客户端实现
- `src/lib/http/examples.ts` - 使用示例
- `src/lib/http/index.ts` - 统一导出
- `src/types/index.ts` - 类型定义
