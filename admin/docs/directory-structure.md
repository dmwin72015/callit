# 前端项目目录结构规范

## 目录结构

```
src/
├── App.tsx                    # 根组件
├── AppRoutes.tsx             # 路由配置
├── main.tsx                  # 应用入口
├── vite-env.d.ts            # Vite 类型声明
│
├── types/                   # ✅ 类型定义
│   └── index.ts             # 全局类型
│
├── stores/                  # ✅ 状态管理
│   └── authStore.ts         # Zustand stores
│
├── hooks/                   # 🆕 自定义 Hooks
│
├── utils/                   # 🆕 工具函数
│   ├── constants.ts         # 常量定义
│   ├── formatters.ts        # 格式化工具
│   └── validators.ts        # 验证工具
│
├── styles/                  # ✅ 全局样式
│   └── global.css           # 全局 CSS
│
├── assets/                  # 🆕 静态资源
│
├── services/                # ✅ API 服务层
│   ├── auth.ts              # 认证服务
│   ├── items.ts             # 物品管理
│   ├── categories.ts        # 分类管理
│   ├── regions.ts           # 地区管理
│   ├── tags.ts              # 标签管理
│   ├── users.ts             # 用户管理
│   ├── aliases.ts           # 别名审核
│   ├── auditLogs.ts         # 审计日志
│   └── stats.ts             # 统计信息
│
├── lib/                     # 🆕 基础设施层
│   └── http/                # HTTP 客户端
│       ├── fetch.ts         # FetchService 实现
│       ├── examples.ts      # 使用示例
│       └── index.ts         # 统一导出
│
├── components/              # 组件目录
│   ├── Auth/               # 认证相关组件
│   │   └── ProtectedRoute.tsx
│   ├── Layout/             # 布局组件
│   │   ├── AdminLayout.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   └── common/             # 🆕 通用 UI 组件
│       ├── Loading.tsx
│       ├── ConfirmModal.tsx
│       └── DataTable.tsx
│
└── pages/                  # 页面组件
    ├── Login/              # 登录页
    ├── Dashboard/          # 仪表盘
    ├── Items/              # 物品管理
    ├── Categories/         # 分类管理
    ├── Regions/            # 地区管理
    ├── Tags/               # 标签管理
    ├── Users/              # 用户管理
    ├── Aliases/            # 别名审核
    └── AuditLogs/          # 审计日志
```

## 目录职责

### 1. **types/** - 类型定义
- 全局 TypeScript 类型、接口
- API 响应类型
- 业务实体类型

### 2. **stores/** - 状态管理
- Zustand stores
- 全局状态
- 认证状态

### 3. **hooks/** - 自定义 Hooks
- 可复用的状态逻辑
- 业务无关的通用 Hooks
- 示例：`useDebounce`, `useLocalStorage`, `usePrevious`

### 4. **utils/** - 工具函数
- **constants.ts**: 常量、配置、枚举值
- **formatters.ts**: 日期、数字、字符串格式化
- **validators.ts**: 表单验证、数据验证

### 5. **styles/** - 全局样式
- 全局 CSS
- CSS 变量
- 主题配置

### 6. **assets/** - 静态资源
- 图片（logo, icons）
- 字体文件
- 其他静态资源

### 7. **services/** - API 服务层
- HTTP 请求封装（已迁移到 lib/http/）
- 按业务领域组织的 API 调用
- 数据转换和错误处理

### 8. **lib/** - 🆕 基础设施层
存放第三方库封装和基础设施代码：
- **http/fetch.ts** - FetchService
  - 拦截器（请求/响应/错误）
  - 事件系统
  - 请求取消（基于 AbortController）
  - 自动 Token 刷新
  - 替代了原来的 axios
- **http/examples.ts** - 使用示例和配置模板

### 8. **components/** - 组件

#### 8.1 Auth/ - 认证相关
- 认证流程专用组件
- 权限控制组件

#### 8.2 Layout/ - 布局组件
- 页面框架、导航
- 业务无关的布局

#### 8.3 common/ - 通用 UI 组件
- **业务无关**的纯 UI 组件
- 可被任何页面复用的组件
- 示例：Loading, Modal, Table, Form, Button

### 9. **pages/** - 页面组件
- 业务页面
- 按路由组织
- 每个页面包含该页面的所有相关逻辑

## 组织原则

### ✅ 应该放在 src/ 下的
- 全局配置、类型、常量
- 纯函数、工具函数
- 通用的 UI 组件（不包含业务逻辑）
- 全局状态管理
- 全局样式

### ❌ 不应该放在 src/ 下的
- 第三方库（node_modules）
- 配置文件（vite.config.ts, tsconfig.json）
- 构建产物（dist/）

### 🗂️ 文件组织原则

1. **按职责分离**
   - 类型 → types/
   - 状态 → stores/
   - 逻辑 → hooks/, utils/
   - 表现 → components/, pages/

2. **按层次分离**
   - 基础设施 → utils/, services/
   - 通用组件 → components/common/
   - 业务组件 → components/[domain]/, pages/

3. **按复用性分离**
   - 高频复用 → hooks/, utils/, components/common/
   - 低频复用 → components/[domain]/
   - 一次性使用 → pages/

## 新增目录说明

### hooks/ 🆕
存放自定义 React Hooks，如：
- `useAuth.ts` - 认证逻辑（如果需要复杂逻辑）
- `useDebounce.ts` - 防抖
- `useThrottle.ts` - 节流
- `useLocalStorage.ts` - localStorage 封装
- `useAsync.ts` - 异步状态管理

### utils/ 🆕
存放纯工具函数，如：
- **constants.ts**
  ```typescript
  export const ROUTES = { ... }
  export const STORAGE_KEYS = { ... }
  export const API_ENDPOINTS = { ... }
  ```
- **formatters.ts**
  ```typescript
  export const formatDate = (date: Date) => string
  export const formatNumber = (num: number) => string
  export const formatFileSize = (bytes: number) => string
  ```
- **validators.ts**
  ```typescript
  export const validateEmail = (email: string) => boolean
  export const validatePassword = (password: string) => boolean
  ```

### assets/ 🆕
存放静态资源：
- `images/` - 图片
- `icons/` - 图标（非组件化的）
- `fonts/` - 字体

### components/common/ 🆕
存放通用的、业务无关的 UI 组件：
- `Loading/` - 加载组件
- `Modal/` - 模态框
- `ConfirmModal/` - 确认对话框
- `DataTable/` - 数据表格（通用表格组件）
- `EmptyState/` - 空状态
- `ErrorBoundary/` - 错误边界
