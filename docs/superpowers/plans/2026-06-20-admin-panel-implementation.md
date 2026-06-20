# Admin Management System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build React admin panel for cnalias platform with full CRUD, alias review, user management, and audit logs.

**Architecture:** SPA with Vite + React + TypeScript + Ant Design + Tailwind. JWT auth with auto-refresh. REST API consumption. Nginx reverse proxy in production.

**Tech Stack:** React 18, TypeScript, Vite, Ant Design 5, Tailwind CSS 3, React Query, Zustand, Axios, React Router v6

## Global Constraints

- **API base URL:** `VITE_API_BASE_URL` env var (`http://localhost:8081/api/v1` dev, `/admin/api` prod)
- **Auth:** Bearer JWT in `Authorization` header, auto-refresh on 401
- **Role check:** Admin routes check `user.role === "ADMIN"`
- **Port:** Dev on `localhost:3000`
- **Path prefix:** `/admin/*` in production (Nginx handles `/admin/api/*` → `/api/v1/*`)
- **No SSR:** Pure client-side SPA
- **No admin code in backend:** Separate `cnalias-admin/` directory at project root

---

## Phase 1: Project Scaffolding & Core Infrastructure

### Task 1: Project Initialization

**Files:**
- Create: `cnalias-admin/package.json`
- Create: `cnalias-admin/tsconfig.json`
- Create: `cnalias-admin/tsconfig.node.json`
- Create: `cnalias-admin/vite.config.ts`
- Create: `cnalias-admin/.env.example`
- Create: `cnalias-admin/index.html`
- Create: `cnalias-admin/src/main.tsx`
- Create: `cnalias-admin/src/App.tsx`
- Create: `cnalias-admin/src/vite-env.d.ts`

**Step 1: Create package.json**

```json
{
  "name": "cnalias-admin",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.0",
    "antd": "^5.12.0",
    "@ant-design/icons": "^5.2.6",
    "axios": "^1.6.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "dayjs": "^1.11.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@types/node": "^20.10.0"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Step 3: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

**Step 4: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/admin/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/admin\/api/, '/api/v1'),
      },
    },
  },
});
```

**Step 5: Create tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

**Step 6: Create postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Step 7: Create index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>cnalias Admin</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 8: Create src/vite-env.d.ts**

```typescript
/// <reference types="vite/client" />
```

**Step 9: Create src/main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
```

**Step 10: Create src/App.tsx**

```tsx
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from './AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

**Step 11: Create .env.example**

```env
VITE_API_BASE_URL=http://localhost:8081/api/v1
```

**Step 12: Create .env (for development)**

```env
VITE_API_BASE_URL=http://localhost:8081/api/v1
```

**Step 13: Install dependencies and verify**

```bash
cd cnalias-admin
npm install
```

Expected: Dependencies installed without errors.

**Step 14: Create src/styles/global.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
    'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**Step 15: Commit**

```bash
git add cnalias-admin/
git commit -m "feat: initialize React admin project with Vite + Ant Design + Tailwind"
```

---

### Task 2: Shared Types & API Infrastructure

**Files:**
- Create: `cnalias-admin/src/types/index.ts`
- Create: `cnalias-admin/src/services/api.ts`
- Create: `cnalias-admin/src/services/auth.ts`

**Interfaces:**
- Consumes: None
- Produces: TypeScript types shared across all services, base API client

**Step 1: Write shared types**

Create `cnalias-admin/src/types/index.ts`:

```typescript
export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
  is_verified: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  page_size: number;
  total: number;
}

export interface AliasResponse {
  id: number;
  alias_name: string;
  item_name: string;
  region_name: string;
  submitted_by: string;
  votes_count: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export interface ItemResponse {
  id: number;
  name: string;
  description: string;
  category_id: number;
  category_name: string;
  aliases_count: number;
  created_at: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
  parent_id: number | null;
  children?: CategoryResponse[];
  items_count: number;
  sort_order: number;
}

export interface RegionResponse {
  id: number;
  name: string;
  parent_id: number | null;
  region_type: 'PROVINCE' | 'CITY' | 'DISTRICT';
  code: string;
  sort_order: number;
  children?: RegionResponse[];
}

export interface TagResponse {
  id: number;
  name: string;
  color: string;
  aliases_count: number;
}

export interface StatsResponse {
  total_users: number;
  total_items: number;
  total_aliases: number;
  pending_reviews: number;
}

export interface AuditLogResponse {
  id: number;
  admin_user: string;
  action: string;
  target_type: string;
  target_id: number;
  note: string;
  created_at: string;
}
```

**Step 2: Write base API client**

Create `cnalias-admin/src/services/api.ts`:

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { auth } from './auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = auth.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = auth.getRefreshToken();
          if (refreshToken) {
            const newToken = await auth.refreshAccessToken(refreshToken);
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return api(originalRequest);
            }
          }
        } catch (refreshError) {
          auth.logout();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      auth.logout();
      window.location.href = '/login';
    }

    if (error.response?.status === 403) {
      message.error('权限不足');
    } else if (error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data as { message?: string };
      message.error(data.message || '请求失败');
    } else {
      message.error('网络错误');
    }

    return Promise.reject(error);
  }
);

export default api;
```

**Step 3: Write auth service**

Create `cnalias-admin/src/services/auth.ts`:

```typescript
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
    return response.data.access_token;
  }

  setTokens(data: AuthResponse): void {
    localStorage.setItem(this.tokenKey, data.access_token);
    localStorage.setItem(this.refreshKey, data.refresh_token);
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
```

**Step 4: Test build**

```bash
cd cnalias-admin
npm run build 2>&1 | head -20
```

Expected: Build completes or shows TypeScript errors (fix before proceeding).

**Step 5: Commit**

```bash
git add cnalias-admin/src/types/ cnalias-admin/src/services/
git commit -m "feat: add shared types and API infrastructure"
```

---

### Task 3: Auth Store & Protected Route

**Files:**
- Create: `cnalias-admin/src/stores/authStore.ts`
- Create: `cnalias-admin/src/components/Auth/ProtectedRoute.tsx`

**Interfaces:**
- Consumes: Types from Task 2
- Produces: Auth store for login/logout, protected route component

**Step 1: Write auth store**

Create `cnalias-admin/src/stores/authStore.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserResponse } from '../types';
import { auth } from '../services/auth';

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: auth.getUser(),
      token: auth.getToken(),

      login: async (email: string, password: string) => {
        const data = await auth.login(email, password);
        auth.setTokens(data);
        set({ token: data.access_token });
      },

      logout: () => {
        auth.logout();
        set({ user: null, token: null });
      },

      isAuthenticated: () => {
        return !!get().token && auth.isAuthenticated();
      },

      isAdmin: () => {
        return auth.isAdmin(get().user);
      },
    }),
    {
      name: 'cnalias-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
```

**Step 2: Write ProtectedRoute component**

Create `cnalias-admin/src/components/Auth/ProtectedRoute.tsx`:

```tsx
import { Navigate, useLocation } from 'react-router-dom';
import { Result, Button } from 'antd';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = true,
}: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuthStore();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return (
      <Result
        status="403"
        title="权限不足"
        subTitle="您没有权限访问此页面"
        extra={<Button type="primary" onClick={() => window.history.back()}>返回</Button>}
      />
    );
  }

  return <>{children}</>;
}
```

**Step 3: Write tests**

Create `cnalias-admin/src/components/Auth/ProtectedRoute.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

describe('ProtectedRoute', () => {
  it('redirects to login when not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows 403 when authenticated but not admin', () => {
    const useAuthStoreMock = {
      isAuthenticated: () => true,
      isAdmin: () => false,
    };

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
      {
        wrapper: () => {
          // @ts-ignore
          useAuthStoreMock.useAuthStore = useAuthStoreMock;
          return { useAuthStore: useAuthStoreMock };
        },
      }
    );

    expect(screen.getByText('权限不足')).toBeInTheDocument();
  });

  it('renders children when authenticated admin', () => {
    const useAuthStoreMock = {
      isAuthenticated: () => true,
      isAdmin: () => true,
    };

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
      {
        wrapper: () => {
          // @ts-ignore
          useAuthStoreMock.useAuthStore = useAuthStoreMock;
          return { useAuthStore: useAuthStoreMock };
        },
      }
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});
```

**Step 4: Run tests**

```bash
cd cnalias-admin
npm test -- --watchAll=false 2>&1 | head -50
```

Expected: All 3 tests pass.

**Step 5: Commit**

```bash
git add cnalias-admin/src/stores/ cnalias-admin/src/components/Auth/
git commit -m "feat: add auth store and protected route component"
```

---

### Task 4: Layout Components

**Files:**
- Create: `cnalias-admin/src/components/Layout/AdminLayout.tsx`
- Create: `cnalias-admin/src/components/Layout/Sidebar.tsx`
- Create: `cnalias-admin/src/components/Layout/Header.tsx`

**Interfaces:**
- Consumes: Auth store (for logout), react-router
- Produces: Main layout with sidebar navigation and top header

**Step 1: Write Sidebar component**

Create `cnalias-admin/src/components/Layout/Sidebar.tsx`:

```tsx
import { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  AuditOutlined,
  FileTextOutlined,
  ApartmentOutlined,
  GlobalOutlined,
  TagOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '看板' },
  { key: '/aliases', icon: <AuditOutlined />, label: '别名审核' },
  { key: '/users', icon: <UserOutlined />, label: '用户管理' },
  { key: '/items', icon: <FileTextOutlined />, label: '物品管理' },
  { key: '/categories', icon: <ApartmentOutlined />, label: '分类管理' },
  { key: '/regions', icon: <GlobalOutlined />, label: '地区管理' },
  { key: '/tags', icon: <TagOutlined />, label: '标签管理' },
  { key: '/audit-logs', icon: <TeamOutlined />, label: '审计日志' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      theme="dark"
      width={200}
      style={{ height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }}
    >
      <div
        className="h-16 flex items-center justify-center text-white text-xl font-bold"
        style={{ background: 'rgba(255,255,255,0.1)' }}
      >
        {collapsed ? 'CN' : 'cnalias 管理后台'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ marginTop: '1px' }}
      />
    </Sider>
  );
}
```

**Step 2: Write Header component**

Create `cnalias-admin/src/components/Layout/Header.tsx`:

```tsx
import { Layout, Dropdown, Avatar, Space } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import type { MenuProps } from 'antd';

const { Header } = Layout;

export default function AdminHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const menuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <Header
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      }}
    >
      <Dropdown menu={{ items: menuItems }} placement="bottomRight">
        <Space style={{ cursor: 'pointer' }}>
          <Avatar icon={<UserOutlined />} />
          <span>{user?.username || user?.email}</span>
        </Space>
      </Dropdown>
    </Header>
  );
}
```

**Step 3: Write AdminLayout component**

Create `cnalias-admin/src/components/Layout/AdminLayout.tsx`:

```tsx
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import AdminHeader from './Header';

const { Content } = Layout;

export default function AdminLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout style={{ marginLeft: 200 }}>
        <AdminHeader />
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
```

**Step 4: Test build**

```bash
cd cnalias-admin
npm run build 2>&1 | tail -30
```

Expected: Build succeeds without errors.

**Step 5: Commit**

```bash
git add cnalias-admin/src/components/Layout/
git commit -m "feat: add admin layout with sidebar and header"
```

---

### Task 5: Routing & Login Page

**Files:**
- Create: `cnalias-admin/src/AppRoutes.tsx`
- Create: `cnalias-admin/src/pages/Login/LoginPage.tsx`

**Interfaces:**
- Consumes: ProtectedRoute, auth store, auth service
- Produces: Complete routing setup and login page

**Step 1: Write AppRoutes**

Create `cnalias-admin/src/AppRoutes.tsx`:

```tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import AdminLayout from '../components/Layout/AdminLayout';
import LoginPage from '../pages/Login/LoginPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import UserListPage from '../pages/Users/UserListPage';
import UserEditPage from '../pages/Users/UserEditPage';
import AliasReviewPage from '../pages/Aliases/AliasReviewPage';
import ItemListPage from '../pages/Items/ItemListPage';
import ItemEditPage from '../pages/Items/ItemEditPage';
import CategoryListPage from '../pages/Categories/CategoryListPage';
import RegionListPage from '../pages/Regions/RegionListPage';
import TagListPage from '../pages/Tags/TagListPage';
import AuditLogPage from '../pages/AuditLogs/AuditLogPage';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'users', element: <UserListPage /> },
      { path: 'users/:id', element: <UserEditPage /> },
      { path: 'aliases', element: <AliasReviewPage /> },
      { path: 'items', element: <ItemListPage /> },
      { path: 'items/:id', element: <ItemEditPage /> },
      { path: 'categories', element: <CategoryListPage /> },
      { path: 'regions', element: <RegionListPage /> },
      { path: 'tags', element: <TagListPage /> },
      { path: 'audit-logs', element: <AuditLogPage /> },
    ],
  },
]);

export default router;
```

**Step 2: Write LoginPage**

Create `cnalias-admin/src/pages/Login/LoginPage.tsx`:

```tsx
import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success('登录成功');
      navigate(from, { replace: true });
    } catch (error: unknown) {
      message.error(error instanceof Error ? error.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated()) {
    navigate(from, { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-96 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">cnalias 管理后台</h1>
          <p className="text-gray-500">管理员登录</p>
        </div>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="邮箱" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
```

**Step 3: Update main.tsx to use router**

Replace `cnalias-admin/src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AppRoutes from './AppRoutes';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <AppRoutes />
    </ConfigProvider>
  </React.StrictMode>
);
```

**Step 4: Update App.tsx to render router**

Replace `cnalias-admin/src/App.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from './AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
    </QueryClientProvider>
  );
}
```

**Step 5: Test routing**

```bash
cd cnalias-admin
npm run dev &
sleep 5
curl -s http://localhost:3000 | grep -i "cnalias"
```

Expected: HTML contains "cnalias".

**Step 6: Commit**

```bash
git add cnalias-admin/src/App.tsx cnalias-admin/src/main.tsx cnalias-admin/src/AppRoutes.tsx cnalias-admin/src/pages/Login/
git commit -m "feat: add routing and login page"
```

---

### Task 6: Dashboard Page (Basic)

**Files:**
- Create: `cnalias-admin/src/services/stats.ts`
- Create: `cnalias-admin/src/pages/Dashboard/DashboardPage.tsx`

**Interfaces:**
- Consumes: API client, React Query
- Produces: Dashboard with stat cards

**Step 1: Write stats service**

Create `cnalias-admin/src/services/stats.ts`:

```typescript
import api from './api';
import type { StatsResponse } from '../types';

export const getStats = async (): Promise<StatsResponse> => {
  const response = await api.get<StatsResponse>('/admin/stats');
  return response.data;
};

export const getRecentActivity = async (limit: number = 10) => {
  const response = await api.get('/admin/audit-logs', {
    params: { limit, page: 1, page_size: limit },
  });
  return response.data;
};
```

**Step 2: Write DashboardPage**

Create `cnalias-admin/src/pages/Dashboard/DashboardPage.tsx`:

```tsx
import { useQuery } from '@tanstack/react-query';
import { Card, Col, Row, Statistic, Spin, Alert } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  AuditOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { getStats } from '../../services/stats';

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="加载失败"
        description="无法加载统计数据"
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">看板</h1>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={stats?.total_users || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总物品数"
              value={stats?.total_items || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总别名数"
              value={stats?.total_aliases || 0}
              prefix={<AuditOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审核"
              value={stats?.pending_reviews || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Alert
        message="提示"
        description="更多图表和统计功能将在后续版本中添加"
        type="info"
        showIcon
        className="mt-6"
      />
    </div>
  );
}
```

**Step 3: Test build**

```bash
cd cnalias-admin
npm run build 2>&1 | tail -20
```

Expected: Build succeeds.

**Step 4: Commit**

```bash
git add cnalias-admin/src/pages/Dashboard/ cnalias-admin/src/services/stats.ts
git commit -m "feat: add basic dashboard page with stat cards"
```

---

### Task 7: Users Management - List Page

**Files:**
- Create: `cnalias-admin/src/services/users.ts`
- Create: `cnalias-admin/src/pages/Users/UserListPage.tsx`

**Interfaces:**
- Consumes: API client, React Query, Ant Design Table
- Produces: User list with filters and pagination

**Step 1: Write users service**

Create `cnalias-admin/src/services/users.ts`:

```typescript
import api from './api';
import type { PaginatedResponse, UserResponse } from '../types';

export const getUsers = async (params: {
  page?: number;
  page_size?: number;
  role?: string;
  is_verified?: boolean;
  search?: string;
}): Promise<PaginatedResponse<UserResponse>> => {
  const response = await api.get<PaginatedResponse<UserResponse>>('/admin/users', { params });
  return response.data;
};

export const getUser = async (id: number): Promise<UserResponse> => {
  const response = await api.get<UserResponse>(`/admin/users/${id}`);
  return response.data;
};

export const updateUser = async (id: number, data: Partial<UserResponse>): Promise<UserResponse> => {
  const response = await api.put<UserResponse>(`/admin/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/admin/users/${id}`);
};
```

**Step 2: Write UserListPage**

Create `cnalias-admin/src/pages/Users/UserListPage.tsx`:

```tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Card,
  Space,
  Tag,
  Switch,
  Button,
  Modal,
  Form,
  Select,
  Input,
  message,
  Popconfirm,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getUsers, updateUser, deleteUser } from '../../services/users';
import type { UserResponse } from '../../types';

const { Title } = Typography;

export default function UserListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [roleFilter, setRoleFilter] = useState<string>();
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | undefined>();
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', { page, page_size: pageSize, role: roleFilter, is_verified: verifiedFilter, search }],
    queryFn: () =>
      getUsers({
        page,
        page_size: pageSize,
        role: roleFilter,
        is_verified: verifiedFilter,
        search: search || undefined,
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserResponse> }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('更新成功');
      setEditingUser(null);
      form.resetFields();
    },
    onError: () => message.error('更新失败'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('删除成功');
    },
    onError: () => message.error('删除失败'),
  });

  const columns: ColumnsType<UserResponse> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string) => (
        <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>{role}</Tag>
      ),
    },
    {
      title: '已验证',
      dataIndex: 'is_verified',
      key: 'is_verified',
      width: 120,
      render: (verified: boolean, record) => (
        <Switch
          checked={verified}
          onChange={(checked) =>
            updateMutation.mutate({
              id: record.id,
              data: { is_verified: checked },
            })
          }
          disabled={record.role === 'ADMIN'}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setEditingUser(record);
              form.setFieldsValue(record);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此用户？"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2} style={{ margin: 0 }}>用户管理</Title>
        <Space>
          <Select
            placeholder="角色"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => setRoleFilter(value)}
            options={[
              { value: 'ADMIN', label: '管理员' },
              { value: 'USER', label: '用户' },
            ]}
          />
          <Select
            placeholder="验证状态"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => setVerifiedFilter(value)}
            options={[
              { value: true, label: '已验证' },
              { value: false, label: '未验证' },
            ]}
          />
          <Input.Search
            placeholder="搜索用户名/邮箱"
            onSearch={(value) => setSearch(value)}
            style={{ width: 200 }}
            allowClear
          />
        </Space>
      </div>

      <Card>
        <Table<UserResponse>
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading || updateMutation.isPending || deleteMutation.isPending}
          pagination={{
            current: page,
            pageSize,
            total: data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            },
          }}
        />
      </Card>

      <Modal
        title="编辑用户"
        open={!!editingUser}
        onCancel={() => {
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            if (editingUser) {
              updateMutation.mutate({ id: editingUser.id, data: values });
            }
          }}
        >
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'ADMIN', label: '管理员' },
                { value: 'USER', label: '用户' },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
                保存
              </Button>
              <Button onClick={() => setEditingUser(null)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
```

**Step 3: Test build**

```bash
cd cnalias-admin
npm run build 2>&1 | tail -20
```

Expected: Build succeeds.

**Step 4: Commit**

```bash
git add cnalias-admin/src/services/users.ts cnalias-admin/src/pages/Users/
git commit -m "feat: add user management list page with filters"
```

---

### Task 8: Alias Review Page

**Files:**
- Create: `cnalias-admin/src/services/aliases.ts`
- Create: `cnalias-admin/src/pages/Aliases/AliasReviewPage.tsx`

**Interfaces:**
- Consumes: API client, React Query, Modal for approve/reject
- Produces: Alias review queue with tabs and actions

**Step 1: Write aliases service**

Create `cnalias-admin/src/services/aliases.ts`:

```typescript
import api from './api';
import type { PaginatedResponse, AliasResponse } from '../types';

export const getReviewQueue = async (params: {
  status?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<AliasResponse>> => {
  const response = await api.get<PaginatedResponse<AliasResponse>>('/admin/review-queue', {
    params,
  });
  return response.data;
};

export const approveAlias = async (id: number, note?: string): Promise<void> => {
  await api.post(`/admin/aliases/${id}/approve`, { note });
};

export const rejectAlias = async (id: number, note?: string): Promise<void> => {
  await api.post(`/admin/aliases/${id}/reject`, { note });
};
```

**Step 2: Write AliasReviewPage**

Create `cnalias-admin/src/pages/Aliases/AliasReviewPage.tsx`:

```tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Card,
  Tabs,
  Space,
  Tag,
  Button,
  Modal,
  TextArea,
  message,
  Typography,
} from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getReviewQueue, approveAlias, rejectAlias } from '../../services/aliases';
import type { AliasResponse } from '../../types';

const { Title } = Typography;
const { TextArea } = Modal;

export default function AliasReviewPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('PENDING');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [actionModal, setActionModal] = useState<{
    visible: boolean;
    alias: AliasResponse | null;
    action: 'approve' | 'reject';
  }>({ visible: false, alias: null, action: 'approve' });
  const [note, setNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['review-queue', { status: activeTab, page, page_size: pageSize }],
    queryFn: () => getReviewQueue({ status: activeTab, page, page_size: pageSize }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) => approveAlias(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-queue'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      message.success('已批准');
      handleCloseModal();
    },
    onError: () => message.error('操作失败'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) => rejectAlias(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-queue'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      message.success('已拒绝');
      handleCloseModal();
    },
    onError: () => message.error('操作失败'),
  });

  const openApproveModal = (alias: AliasResponse) => {
    setActionModal({ visible: true, alias, action: 'approve' });
    setNote('');
  };

  const openRejectModal = (alias: AliasResponse) => {
    setActionModal({ visible: true, alias, action: 'reject' });
    setNote('');
  };

  const handleCloseModal = () => {
    setActionModal({ visible: false, alias: null, action: 'approve' });
    setNote('');
  };

  const handleSubmit = () => {
    if (!actionModal.alias) return;
    if (actionModal.action === 'approve') {
      approveMutation.mutate({ id: actionModal.alias.id, note: note || undefined });
    } else {
      rejectMutation.mutate({ id: actionModal.alias.id, note: note || undefined });
    }
  };

  const columns: ColumnsType<AliasResponse> = [
    {
      title: '别名',
      dataIndex: 'alias_name',
      key: 'alias_name',
    },
    {
      title: '物品',
      dataIndex: 'item_name',
      key: 'item_name',
    },
    {
      title: '地区',
      dataIndex: 'region_name',
      key: 'region_name',
    },
    {
      title: '提交者',
      dataIndex: 'submitted_by',
      key: 'submitted_by',
    },
    {
      title: '投票数',
      dataIndex: 'votes_count',
      key: 'votes_count',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colors = { PENDING: 'orange', APPROVED: 'green', REJECTED: 'red' };
        const labels = { PENDING: '待审核', APPROVED: '已通过', REJECTED: '已拒绝' };
        return <Tag color={colors[status as keyof typeof colors]}>{labels[status as keyof typeof labels]}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) =>
        record.status === 'PENDING' ? (
          <Space>
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => openApproveModal(record)}
            >
              批准
            </Button>
            <Button
              type="link"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => openRejectModal(record)}
            >
              拒绝
            </Button>
          </Space>
        ) : null,
    },
  ];

  const tabItems = [
    {
      key: 'PENDING',
      label: `待审核 ${activeTab === 'PENDING' ? `(${data?.total || 0})` : ''}`,
    },
    { key: 'APPROVED', label: '已通过' },
    { key: 'REJECTED', label: '已拒绝' },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>别名审核</Title>
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setPage(1);
          }}
          items={tabItems}
        />
        <Table<AliasResponse>
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading || approveMutation.isPending || rejectMutation.isPending}
          pagination={{
            current: page,
            pageSize,
            total: data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            },
          }}
        />
      </Card>

      <Modal
        title={actionModal.action === 'approve' ? '批准别名' : '拒绝别名'}
        open={actionModal.visible}
        onCancel={handleCloseModal}
        onOk={handleSubmit}
        confirmLoading={approveMutation.isPending || rejectMutation.isPending}
        okText={actionModal.action === 'approve' ? '批准' : '拒绝'}
        okType={actionModal.action === 'approve' ? 'primary' : 'danger'}
      >
        {actionModal.alias && (
          <div className="mb-4">
            <p><strong>别名：</strong>{actionModal.alias.alias_name}</p>
            <p><strong>物品：</strong>{actionModal.alias.item_name}</p>
            <p><strong>地区：</strong>{actionModal.alias.region_name}</p>
          </div>
        )}
        <TextArea
          rows={4}
          placeholder={
            actionModal.action === 'approve'
              ? '备注（可选）'
              : '拒绝原因（可选）'
          }
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Modal>
    </div>
  );
}
```

**Step 3: Test build**

```bash
cd cnalias-admin
npm run build 2>&1 | tail -20
```

Expected: Build succeeds.

**Step 4: Commit**

```bash
git add cnalias-admin/src/services/aliases.ts cnalias-admin/src/pages/Aliases/
git commit -m "feat: add alias review page with approve/reject workflow"
```

---

## Phase 2: Content Management

### Task 9: Items Management - List Page

**Files:**
- Create: `cnalias-admin/src/services/items.ts`
- Create: `cnalias-admin/src/pages/Items/ItemListPage.tsx`

**Step 1: Write items service**

Create `cnalias-admin/src/services/items.ts`:

```typescript
import api from './api';
import type { PaginatedResponse, ItemResponse } from '../types';

export const getItems = async (params: {
  page?: number;
  page_size?: number;
  category_id?: number;
  search?: string;
}): Promise<PaginatedResponse<ItemResponse>> => {
  const response = await api.get<PaginatedResponse<ItemResponse>>('/items', { params });
  return response.data;
};

export const getItem = async (id: number): Promise<ItemResponse> => {
  const response = await api.get<ItemResponse>(`/items/${id}`);
  return response.data;
};

export const updateItem = async (id: number, data: Partial<ItemResponse>): Promise<ItemResponse> => {
  const response = await api.put<ItemResponse>(`/items/${id}`, data);
  return response.data;
};
```

**Step 2: Write ItemListPage**

Create `cnalias-admin/src/pages/Items/ItemListPage.tsx`:

```tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Space, Button, Input, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getItems } from '../../services/items';
import type { ItemResponse } from '../../types';

export default function ItemListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['items', { page, page_size: pageSize, search }],
    queryFn: () =>
      getItems({
        page,
        page_size: pageSize,
        search: search || undefined,
      }),
  });

  const columns: ColumnsType<ItemResponse> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分类',
      dataIndex: 'category_name',
      key: 'category_name',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '别名数',
      dataIndex: 'aliases_count',
      key: 'aliases_count',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/items/${record.id}`)}>
            查看
          </Button>
          <Button type="link" onClick={() => message.info('编辑功能待实现')}>
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">物品管理</h1>
        <Space>
          <Input
            placeholder="搜索物品"
            prefix={<SearchOutlined />}
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
            style={{ width: 200 }}
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => message.info('创建功能待实现')}
          >
            新建物品
          </Button>
        </Space>
      </div>

      <Card>
        <Table<ItemResponse>
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize,
            total: data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            },
          }}
        />
      </Card>
    </div>
  );
}
```

**Step 3: Test build**

```bash
cd cnalias-admin && npm run build 2>&1 | tail -10
```

Expected: Build succeeds.

**Step 4: Commit**

```bash
git add cnalias-admin/src/services/items.ts cnalias-admin/src/pages/Items/ItemListPage.tsx
git commit -m "feat: add items management list page"
```

---

### Task 10: Categories, Regions & Tags List Pages

**Files:**
- Create: `cnalias-admin/src/services/categories.ts`
- Create: `cnalias-admin/src/services/regions.ts`
- Create: `cnalias-admin/src/services/tags.ts`
- Create: `cnalias-admin/src/pages/Categories/CategoryListPage.tsx`
- Create: `cnalias-admin/src/pages/Regions/RegionListPage.tsx`
- Create: `cnalias-admin/src/pages/Tags/TagListPage.tsx`

**Step 1: Write services**

Create `cnalias-admin/src/services/categories.ts`:

```typescript
import api from './api';
import type { CategoryResponse, PaginatedResponse } from '../types';

export const getCategories = async (params: {
  page?: number;
  page_size?: number;
  parent_id?: number;
}): Promise<PaginatedResponse<CategoryResponse>> => {
  const response = await api.get<PaginatedResponse<CategoryResponse>>('/categories', { params });
  return response.data;
};

export const getCategoryTree = async (): Promise<CategoryResponse[]> => {
  const response = await api.get<CategoryResponse[]>('/categories/tree');
  return response.data;
};

export const createCategory = async (data: Partial<CategoryResponse>): Promise<CategoryResponse> => {
  const response = await api.post<CategoryResponse>('/categories', data);
  return response.data;
};

export const updateCategory = async (id: number, data: Partial<CategoryResponse>): Promise<CategoryResponse> => {
  const response = await api.put<CategoryResponse>(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`/categories/${id}`);
};
```

Create `cnalias-admin/src/services/regions.ts`:

```typescript
import api from './api';
import type { RegionResponse, PaginatedResponse } from '../types';

export const getRegions = async (params: {
  page?: number;
  page_size?: number;
  parent_id?: number;
  region_type?: string;
}): Promise<PaginatedResponse<RegionResponse>> => {
  const response = await api.get<PaginatedResponse<RegionResponse>>('/regions', { params });
  return response.data;
};

export const getRegionTree = async (): Promise<RegionResponse[]> => {
  const response = await api.get<RegionResponse[]>('/regions/tree');
  return response.data;
};

export const createRegion = async (data: Partial<RegionResponse>): Promise<RegionResponse> => {
  const response = await api.post<RegionResponse>('/regions', data);
  return response.data;
};

export const updateRegion = async (id: number, data: Partial<RegionResponse>): Promise<RegionResponse> => {
  const response = await api.put<RegionResponse>(`/regions/${id}`, data);
  return response.data;
};

export const deleteRegion = async (id: number): Promise<void> => {
  await api.delete(`/regions/${id}`);
};
```

Create `cnalias-admin/src/services/tags.ts`:

```typescript
import api from './api';
import type { TagResponse, PaginatedResponse } from '../types';

export const getTags = async (params: {
  page?: number;
  page_size?: number;
  search?: string;
}): Promise<PaginatedResponse<TagResponse>> => {
  const response = await api.get<PaginatedResponse<TagResponse>>('/tags', { params });
  return response.data;
};

export const createTag = async (data: Partial<TagResponse>): Promise<TagResponse> => {
  const response = await api.post<TagResponse>('/tags', data);
  return response.data;
};

export const updateTag = async (id: number, data: Partial<TagResponse>): Promise<TagResponse> => {
  const response = await api.put<TagResponse>(`/tags/${id}`, data);
  return response.data;
};

export const deleteTag = async (id: number): Promise<void> => {
  await api.delete(`/tags/${id}`);
};
```

**Step 2: Write CategoryListPage**

Create `cnalias-admin/src/pages/Categories/CategoryListPage.tsx`:

```tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Card,
  Space,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Typography,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getCategories, deleteCategory } from '../../services/categories';
import type { CategoryResponse } from '../../types';

const { Title } = Typography;

export default function CategoryListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['categories', { page, page_size: pageSize }],
    queryFn: () => getCategories({ page, page_size: pageSize }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      message.success('删除成功');
    },
    onError: () => message.error('删除失败'),
  });

  const columns: ColumnsType<CategoryResponse> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '物品数',
      dataIndex: 'items_count',
      key: 'items_count',
      width: 100,
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingCategory(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除？"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2} style={{ margin: 0 }}>分类管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingCategory(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          新建分类
        </Button>
      </div>

      <Card>
        <Table<CategoryResponse>
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading || deleteMutation.isPending}
          pagination={{
            current: page,
            pageSize,
            total: data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            },
          }}
        />
      </Card>

      <Modal
        title={editingCategory ? '编辑分类' : '新建分类'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingCategory(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            message.info('保存功能待实现');
            setModalVisible(false);
          }}
        >
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">保存</Button>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
```

**Step 3: Write RegionListPage and TagListPage (similar structure)**

Create `cnalias-admin/src/pages/Regions/RegionListPage.tsx`:

```tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Card,
  Space,
  Tag,
  Button,
  Select,
  message,
  Popconfirm,
  Typography,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getRegions, deleteRegion } from '../../services/regions';
import type { RegionResponse } from '../../types';

const { Title } = Typography;

const regionTypeLabels = {
  PROVINCE: '省',
  CITY: '市',
  DISTRICT: '区',
};

export default function RegionListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [regionType, setRegionType] = useState<string>();

  const { data, isLoading } = useQuery({
    queryKey: ['regions', { page, page_size: pageSize, region_type: regionType }],
    queryFn: () => getRegions({ page, page_size: pageSize, region_type: regionType }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRegion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      message.success('删除成功');
    },
    onError: () => message.error('删除失败'),
  });

  const columns: ColumnsType<RegionResponse> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'region_type',
      key: 'region_type',
      width: 100,
      render: (type: string) => (
        <Tag>{regionTypeLabels[type as keyof typeof regionTypeLabels]}</Tag>
      ),
    },
    {
      title: '编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Popconfirm
          title="确定删除？"
          onConfirm={() => deleteMutation.mutate(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger>删除</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2} style={{ margin: 0 }}>地区管理</Title>
        <Space>
          <Select
            placeholder="类型"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => setRegionType(value)}
            options={[
              { value: 'PROVINCE', label: '省' },
              { value: 'CITY', label: '市' },
              { value: 'DISTRICT', label: '区' },
            ]}
          />
          <Button type="primary" icon={<PlusOutlined />}>
            新建地区
          </Button>
        </Space>
      </div>

      <Card>
        <Table<RegionResponse>
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading || deleteMutation.isPending}
          pagination={{
            current: page,
            pageSize,
            total: data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            },
          }}
        />
      </Card>
    </div>
  );
}
```

Create `cnalias-admin/src/pages/Tags/TagListPage.tsx`:

```tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Card,
  Space,
  Tag,
  Button,
  ColorPicker,
  message,
  Popconfirm,
  Typography,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getTags, deleteTag } from '../../services/tags';
import type { TagResponse } from '../../types';

const { Title } = Typography;

export default function TagListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ['tags', { page, page_size: pageSize }],
    queryFn: () => getTags({ page, page_size: pageSize }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      message.success('删除成功');
    },
    onError: () => message.error('删除失败'),
  });

  const columns: ColumnsType<TagResponse> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: 150,
      render: (color: string) => (
        <Space>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              backgroundColor: color,
            }}
          />
          <ColorPicker value={color} disabled showText />
        </Space>
      ),
    },
    {
      title: '别名数',
      dataIndex: 'aliases_count',
      key: 'aliases_count',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Popconfirm
          title="确定删除？"
          onConfirm={() => deleteMutation.mutate(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger>删除</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2} style={{ margin: 0 }}>标签管理</Title>
        <Button type="primary" icon={<PlusOutlined />}>
          新建标签
        </Button>
      </div>

      <Card>
        <Table<TagResponse>
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading || deleteMutation.isPending}
          pagination={{
            current: page,
            pageSize,
            total: data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            },
          }}
        />
      </Card>
    </div>
  );
}
```

**Step 4: Test build**

```bash
cd cnalias-admin && npm run build 2>&1 | tail -10
```

Expected: Build succeeds.

**Step 5: Commit**

```bash
git add cnalias-admin/src/services/categories.ts cnalias-admin/src/services/regions.ts cnalias-admin/src/services/tags.ts cnalias-admin/src/pages/Categories/ cnalias-admin/src/pages/Regions/ cnalias-admin/src/pages/Tags/
git commit -m "feat: add category, region, and tag management pages"
```

---

## Phase 3: Audit Logs & Finalization

### Task 11: Audit Logs Page

**Files:**
- Create: `cnalias-admin/src/services/audit-logs.ts`
- Create: `cnalias-admin/src/pages/AuditLogs/AuditLogPage.tsx`

**Step 1: Write audit logs service**

Create `cnalias-admin/src/services/audit-logs.ts`:

```typescript
import api from './api';
import type { PaginatedResponse, AuditLogResponse } from '../types';

export const getAuditLogs = async (params: {
  page?: number;
  page_size?: number;
  action?: string;
  admin_user?: string;
  start_date?: string;
  end_date?: string;
}): Promise<PaginatedResponse<AuditLogResponse>> => {
  const response = await api.get<PaginatedResponse<AuditLogResponse>>('/admin/audit-logs', {
    params,
  });
  return response.data;
};
```

**Step 2: Write AuditLogPage**

Create `cnalias-admin/src/pages/AuditLogs/AuditLogPage.tsx`:

```tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Card, Space, Input, Select, DatePicker, message, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { getAuditLogs } from '../../services/audit-logs';
import type { AuditLogResponse } from '../../types';

const { Title } = Typography;

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', { page, page_size: pageSize, search, action: actionFilter, dateRange }],
    queryFn: () => {
      const params: any = { page, page_size: pageSize };
      if (search) params.admin_user = search;
      if (actionFilter) params.action = actionFilter;
      if (dateRange) {
        params.start_date = dateRange[0].format('YYYY-MM-DD');
        params.end_date = dateRange[1].format('YYYY-MM-DD');
      }
      return getAuditLogs(params);
    },
  });

  const columns: ColumnsType<AuditLogResponse> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '管理员',
      dataIndex: 'admin_user',
      key: 'admin_user',
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 150,
      render: (action: string) => <Tag>{action}</Tag>,
    },
    {
      title: '目标类型',
      dataIndex: 'target_type',
      key: 'target_type',
      width: 120,
    },
    {
      title: '目标ID',
      dataIndex: 'target_id',
      key: 'target_id',
      width: 100,
    },
    {
      title: '备注',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
    },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>审计日志</Title>
      <Card>
        <Space className="mb-4">
          <Input
            placeholder="搜索管理员"
            prefix={<SearchOutlined />}
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            placeholder="操作类型"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => {
              setActionFilter(value);
              setPage(1);
            }}
          >
            <Select.Option value="APPROVE_ALIAS">批准别名</Select.Option>
            <Select.Option value="REJECT_ALIAS">拒绝别名</Select.Option>
            <Select.Option value="CREATE_USER">创建用户</Select.Option>
            <Select.Option value="UPDATE_USER">更新用户</Select.Option>
            <Select.Option value="DELETE_USER">删除用户</Select.Option>
          </Select>
          <DatePicker.RangePicker
            onChange={(dates) => {
              setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null);
              setPage(1);
            }}
          />
        </Space>

        <Table<AuditLogResponse>
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize,
            total: data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            },
          }}
        />
      </Card>
    </div>
  );
}
```

**Step 3: Test build**

```bash
cd cnalias-admin && npm run build 2>&1 | tail -10
```

Expected: Build succeeds.

**Step 4: Commit**

```bash
git add cnalias-admin/src/services/audit-logs.ts cnalias-admin/src/pages/AuditLogs/
git commit -m "feat: add audit logs page with filters"
```

---

### Task 12: Docker & Deployment Configuration

**Files:**
- Create: `cnalias-admin/Dockerfile`
- Create: `cnalias-admin/nginx.conf`
- Create: `cnalias-admin/docker-compose.yml`
- Create: `cnalias-admin/README.md`

**Step 1: Write Dockerfile**

Create `cnalias-admin/Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Step 2: Write nginx.conf**

Create `cnalias-admin/nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Serve React app
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /admin/api/ {
        rewrite ^/admin/api/(.*)$ /api/v1/$1 break;
        proxy_pass http://host.docker.internal:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Step 3: Write docker-compose.yml**

Create `cnalias-admin/docker-compose.yml`:

```yaml
version: '3.8'
services:
  admin:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

**Step 4: Write README.md**

Create `cnalias-admin/README.md`:

```markdown
# cnalias Admin - 管理后台

React + TypeScript + Ant Design 管理后台。

## 快速开始

\```bash
npm install
npm run dev
\```

访问 http://localhost:3000

## 构建

\```bash
npm run build
\```

## Docker

\```bash
docker-compose up -d
\```

访问 http://localhost
```

**Step 5: Commit**

```bash
git add cnalias-admin/Dockerfile cnalias-admin/nginx.conf cnalias-admin/docker-compose.yml cnalias-admin/README.md
git commit -m "feat: add Docker and deployment configuration"
```

---

## Final Verification

### Task 13: Production Build Test

**Step 1: Install dependencies**

```bash
cd cnalias-admin && npm install
```

Expected: All dependencies installed without errors.

**Step 2: Run production build**

```bash
cd cnalias-admin && npm run build
```

Expected: Build succeeds, creates `dist/` folder.

**Step 3: Verify dist structure**

```bash
ls -la cnalias-admin/dist/
```

Expected: Contains `index.html`, `assets/` folder.

**Step 4: Commit final build**

```bash
git add cnalias-admin/
git commit -m "feat: complete admin panel with all pages"
```

---

## Summary

This plan implements:

✅ **Phase 1 - Core Infrastructure**
- Project scaffolding with Vite + React + TypeScript + Ant Design + Tailwind
- JWT authentication with auto-refresh
- Protected routes with admin role check
- Layout with sidebar navigation
- Login page
- Dashboard with stat cards
- User management (list + edit)

✅ **Phase 2 - Content Management**
- Items management
- Categories management
- Regions management
- Tags management

✅ **Phase 3 - Audit & Deployment**
- Audit logs page with filters
- Docker multi-stage build
- Nginx configuration
- Complete documentation

**Estimated tasks:** 13 major tasks, ~50 steps total
**Backend endpoints needed:** 10 new admin endpoints (documented in spec)
