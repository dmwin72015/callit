# Admin Management System Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React-based admin management system for cnalias platform, exclusively for admin users, deployed separately with Nginx proxy.

**Architecture:** Single-page application (SPA) built with Vite + React + TypeScript + Ant Design, consuming backend REST APIs with JWT authentication. Deployed independently, proxied via Nginx to backend API.

**Tech Stack:**
- **Frontend:** React 18, TypeScript, Vite, Ant Design 5
- **State:** React Query (TanStack Query) for server state, Zustand for client state
- **Routing:** React Router v6 with protected routes
- **HTTP:** Axios with interceptors for auth + error handling
- **Charts:** ECharts or Ant Design Charts
- **Build:** Vite production build, Docker multi-stage
- **Deploy:** Nginx reverse proxy, TLS termination

## Global Constraints

- **Base API URL:** `http://localhost:8081/api/v1` (configurable via `VITE_API_BASE_URL`)
- **Auth scheme:** Bearer token in `Authorization` header
- **Token expiry:** Access 15min, refresh 7 days
- **Role check:** Admin routes require `role === "ADMIN"` from JWT
- **Frontend port:** Development on `localhost:3000`
- **Admin path:** `/admin/*` (Nginx will proxy `/admin/api/*` to backend)
- **No server-side rendering:** Pure client-side SPA
- **No admin UI code in backend repo:** Separate `cnalias-admin/` directory

---

## 1. Project Structure

```
cnalias-admin/
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── App.tsx                    # Root with router
│   ├── main.tsx                   # Entry point
│   ├── vite-env.d.ts
│   ├── types/
│   │   └── index.ts               # Shared TypeScript types
│   ├── services/
│   │   ├── api.ts                 # Axios instance + base URL
│   │   ├── auth.ts                # Login, logout, refresh
│   │   ├── users.ts               # User CRUD, role management
│   │   ├── aliases.ts             # Alias review queue, approve/reject
│   │   ├── items.ts               # Item management
│   │   ├── categories.ts          # Category CRUD + tree
│   │   ├── regions.ts             # Region CRUD + tree
│   │   ├── tags.ts                # Tag CRUD
│   │   ├── stats.ts               # Dashboard statistics
│   │   └── audit-logs.ts          # Admin action logs
│   ├── stores/
│   │   ├── authStore.ts           # Auth state (token, user)
│   │   └── appStore.ts            # App-wide state
│   ├── hooks/
│   │   ├── useAuth.ts             # Auth guard hook
│   │   ├── useApi.ts              # Query wrapper
│   │   └── usePermissions.ts      # RBAC hook
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── AdminLayout.tsx    # Sidebar + header + content
│   │   │   ├── Sidebar.tsx        # Navigation menu
│   │   │   └── Header.tsx         # Top bar (user info, logout)
│   │   ├── Auth/
│   │   │   └── ProtectedRoute.tsx # Route guard
│   │   └── Charts/
│   │       └── StatCard.tsx       # Dashboard stat widget
│   ├── pages/
│   │   ├── Login/
│   │   │   ├── LoginPage.tsx
│   │   │   └── Login.module.less
│   │   ├── Dashboard/
│   │   │   ├── DashboardPage.tsx
│   │   │   └── Dashboard.module.less
│   │   ├── Users/
│   │   │   ├── UserListPage.tsx
│   │   │   ├── UserEditPage.tsx
│   │   │   └── Users.module.less
│   │   ├── Aliases/
│   │   │   ├── AliasReviewPage.tsx
│   │   │   └── Aliases.module.less
│   │   ├── Items/
│   │   │   ├── ItemListPage.tsx
│   │   │   ├── ItemEditPage.tsx
│   │   │   └── Items.module.less
│   │   ├── Categories/
│   │   │   ├── CategoryListPage.tsx
│   │   │   └── Categories.module.less
│   │   ├── Regions/
│   │   │   ├── RegionListPage.tsx
│   │   │   └── Regions.module.less
│   │   ├── Tags/
│   │   │   ├── TagListPage.tsx
│   │   │   └── Tags.module.less
│   │   └── AuditLogs/
│   │       ├── AuditLogPage.tsx
│   │       └── AuditLogs.module.less
│   └── styles/
│       ├── global.less
│       └── theme.ts
├── nginx/
│   └── nginx.conf
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── .env.example
└── README.md
```

---

## 2. Authentication & Authorization

**Flow:**
```
Login → POST /api/v1/auth/login
       { email, password }
       ← { access_token, refresh_token }

API Request
       → Authorization: Bearer <access_token>
       ← 401 if expired

Token Refresh (auto)
       → POST /api/v1/auth/refresh
       { refresh_token }
       ← { access_token, refresh_token }

Logout → Clear tokens from localStorage
```

**Auth Store (Zustand):**
```typescript
interface AuthState {
  user: UserResponse | null;
  token: string | null;
  login: (email, password) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}
```

**Protected Route Guard:**
```tsx
<Route element={<ProtectedRoute requireAdmin />}>
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/users/*" element={<UserRoutes />} />
  {/* All admin routes */}
</Route>
```

**Axios Interceptor:**
- Request: attach `Authorization` header
- Response 401: attempt token refresh, retry original request
- Response 403: redirect to `/login`
- Global error handler for toast notifications

---

## 3. Backend API Integration

**Service layer mirrors backend endpoints:**

```typescript
// services/api.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // '/admin/api' in prod, direct in dev
  timeout: 10000,
});

// services/auth.ts
export const login = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password });

export const refreshToken = (refreshToken: string) =>
  api.post<AuthResponse>('/auth/refresh', { refresh_token: refreshToken });
```

**Route mapping (Nginx proxy):**
```
/admin/api/auth/*    → /api/v1/auth/*
/admin/api/users/*   → /api/v1/users/*
/admin/api/items/*   → /api/v1/items/*
...
```

**Environment config:**
```env
# .env (development)
VITE_API_BASE_URL=http://localhost:8081/api/v1

# .env.production
VITE_API_BASE_URL=/admin/api
```

---

## 4. Page Specifications

### 4.1 Login Page (`/login`)
**Features:**
- Email + password form
- Validation (email format, password required)
- Submit → call auth.login → store tokens → redirect `/dashboard`
- Error toast on failure
- Logo + branding

**State:** Minimal, just form + loading

---

### 4.2 Dashboard (`/dashboard`)
**Features:**
- Stat cards row: total users, total items, total aliases, pending reviews
- Line chart: submissions over last 30 days
- Bar chart: aliases by region top 10
- Recent activity feed (last 10 audit logs)

**Data sources:**
- `GET /admin/stats` → dashboard metrics
- `GET /admin/audit-logs?limit=10` → recent activity

---

### 4.3 User Management (`/users`)
**List page:**
- ProTable with columns: username, email, role, is_verified, created_at, actions
- Filters: role (select), is_verified (switch), search (username/email)
- Actions: edit, delete, view details
- Pagination (server-side)

**Edit page:**
- Form: username, email, role (select), is_verified (switch)
- Submit → `PUT /admin/users/:id` or `POST /admin/users`
- Back → list page

**Backend endpoints needed:**
- `GET /admin/users` → list users
- `GET /admin/users/:id` → get user
- `PUT /admin/users/:id` → update user
- `POST /admin/users` → create user
- `DELETE /admin/users/:id` → delete user

---

### 4.4 Alias Review (`/aliases`)
**Features:**
- Tabs: Pending | Approved | Rejected
- Table: alias_name, item_name, region_name, submitted_by, votes_count, created_at
- Actions: approve (modal with note), reject (modal with reason), view details
- Filter: search (alias/item name), region (select), date range

**Workflow:**
1. Admin clicks "Approve" → modal opens → enter note → submit
2. `POST /admin/aliases/:id/approve` → optimistic update table
3. On error: revert + toast error

**Backend endpoints:**
- `GET /admin/review-queue?status=PENDING&page=1&page_size=20`
- `POST /admin/aliases/:id/approve`
- `POST /admin/aliases/:id/reject`

---

### 4.5 Item Management (`/items`)
**List page:**
- ProTable: name, category, description, aliases_count, created_at
- Filters: category (tree select), search (name)
- Actions: edit, delete, view aliases

**Edit page:**
- Form: name, category_id (tree select), description (textarea), tags (multi-select)
- Submit → `PUT /admin/items/:id` or `POST /admin/items`

**Backend endpoints:**
- `GET /admin/items` → list (reuse `/items` endpoint)
- `GET /admin/items/:id` → detail
- `POST /admin/items` → create
- `PUT /admin/items/:id` → update
- `DELETE /admin/items/:id` → delete

---

### 4.6 Category Management (`/categories`)
**Features:**
- Tree table: name, description, items_count, sort_order
- CRUD with parent selection (tree dropdown)
- Drag-to-reorder (optional, v1.1)

**Backend endpoints:**
- `GET /admin/categories` → list
- `GET /admin/categories/tree` → tree structure
- `POST /admin/categories` → create
- `PUT /admin/categories/:id` → update
- `DELETE /admin/categories/:id` → delete

---

### 4.7 Region Management (`/regions`)
**Features:**
- Same as categories
- Tree table with region_type filter (province/city/district)

---

### 4.8 Tag Management (`/tags`)
**Features:**
- Simple table: name, color, aliases_count
- Inline edit for color picker
- Delete with confirmation

---

### 4.9 Audit Logs (`/audit-logs`)
**Features:**
- Table: admin_user, action, target_type, target_id, note, created_at
- Filters: action type (select), admin_user (search), date range
- Pagination

**Backend endpoints:**
- `GET /admin/audit-logs?page=1&page_size=50`
- `GET /admin/audit-logs/:id` (optional)

---

## 5. State Management

**React Query (server state):**
```typescript
// All API data fetching
const { data, isLoading, error } = useQuery({
  queryKey: ['users', { page, pageSize, role }],
  queryFn: () => fetchUsers(params),
});

const mutation = useMutation({
  mutationFn: updateUser,
  onSuccess: () => queryClient.invalidateQueries(['users']),
});
```

**Zustand (client state):**
```typescript
// Auth store (persisted to localStorage)
// UI state (sidebar collapsed, theme, etc.)
```

---

## 6. Routing

```tsx
const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <ProtectedRoute><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="/dashboard" /> },
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
```

---

## 7. Nginx Configuration

```nginx
# Production: /etc/nginx/sites-available/cnalias-admin

server {
    listen 80;
    server_name admin.cnalias.com;  # or your domain
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name admin.cnalias.com;

    # SSL config (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/admin.cnalias.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.cnalias.com/privkey.pem;

    root /var/www/cnalias-admin/dist;
    index index.html;

    # Serve React app
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /admin/api/ {
        rewrite ^/admin/api/(.*)$ /api/v1/$1 break;
        proxy_pass http://localhost:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

---

## 8. Docker Build

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 9. Environment Variables

```env
# .env (development)
VITE_API_BASE_URL=http://localhost:8081/api/v1

# .env.production
VITE_API_BASE_URL=/admin/api
```

---

## 10. Backend API Endpoints Required

### Existing (no changes):
- ✅ `POST /auth/login`
- ✅ `POST /auth/refresh`
- ✅ `GET /admin/stats`
- ✅ `GET /admin/review-queue`
- ✅ `POST /admin/aliases/:id/approve`
- ✅ `POST /admin/aliases/:id/reject`

### New (need implementation):
- `GET /admin/users` - List users with filters
- `GET /admin/users/:id` - Get user details
- `PUT /admin/users/:id` - Update user (role, verified)
- `DELETE /admin/users/:id` - Delete user
- `GET /admin/audit-logs` - List audit logs
- `GET /admin/items` - List all items (admin view)
- `PUT /admin/items/:id` - Update/delete items (optional, can use existing)
- `POST /admin/categories` - Create category
- `PUT /admin/categories/:id` - Update category
- `DELETE /admin/categories/:id` - Delete category
- `POST /admin/regions` - Create region
- `PUT /admin/regions/:id` - Update region
- `DELETE /admin/regions/:id` - Delete region
- `POST /admin/tags` - Create tag
- `PUT /admin/tags/:id` - Update tag
- `DELETE /admin/tags/:id` - Delete tag

---

## 11. Development Workflow

```bash
# Start backend
cd cnalias && go run cmd/server/main.go  # http://localhost:8081

# Start frontend
cd cnalias-admin && npm run dev  # http://localhost:3000

# Proxy: Configure Nginx or use Vite proxy
```

---

## 12. Deployment

```bash
# Build frontend
cd cnalias-admin && npm run build

# Copy dist to Nginx server
scp -r dist/* admin@server:/var/www/cnalias-admin/

# Or Docker
docker build -t cnalias-admin .
docker run -d -p 80:80 cnalias-admin
```

---

## 13. Implementation Phases

**Phase 1 (MVP - 核心功能):**
- Project scaffolding + auth
- Dashboard (stats only)
- Alias review (approve/reject)
- User list + edit

**Phase 2 (内容管理):**
- Item management
- Category/Region/Tag CRUD

**Phase 3 (完善):**
- Audit logs
- Charts + advanced filters
- Drag-to-reorder, batch operations
