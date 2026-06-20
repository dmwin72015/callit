# CallIt Admin Panel

基于 React + TypeScript + Ant Design 的管理后台系统，用于管理中国地区叫法平台的内容、用户和审核流程。

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **UI 组件**: Ant Design 6
- **样式**: Tailwind CSS 4
- **状态管理**: Zustand 5 + localStorage 持久化
- **HTTP 客户端**: 原生 Fetch API (封装为 FetchService)
  - 拦截器、请求取消、自动 token 刷新
  - 已完全移除 axios
- **路由**: React Router v8

## 项目结构

```
admin/src/
├── assets/              # 静态资源
│   ├── images/         # 图片资源
│   └── icons/          # 图标资源
│
├── lib/                 # 基础设施层
│   └── http/            # HTTP 客户端
│       ├── fetch.ts     # Fetch 客户端封装（支持拦截器）
│       ├── examples.ts  # 使用示例
│       └── index.ts     # HTTP 模块统一导出
│
├── components/         # React 组件
│   ├── Auth/           # 认证相关组件
│   │   └── ProtectedRoute.tsx  # 路由保护组件
│   ├── ErrorBoundary/  # 错误边界组件
│   ├── Layout/         # 布局组件
│   └── ...
│
├── hooks/              # 自定义 React Hooks
│   ├── useAsync.ts     # 异步状态管理
│   ├── useDebounce.ts  # 防抖 Hook
│   ├── useLocalStorage.ts  # localStorage 封装
│   └── index.ts        # Hooks 统一导出
│
├── lib/                 # 基础设施层
│   └── http/            # HTTP 客户端
│       ├── fetch.ts     # Fetch 客户端封装
│       └── index.ts     # HTTP 模块统一导出
│
├── pages/              # 页面组件
│   ├── Dashboard/      # 仪表板
│   ├── Items/          # 条目管理
│   ├── Categories/     # 分类管理
│   ├── Regions/        # 地区管理
│   ├── Tags/           # 标签管理
│   ├── Aliases/        # 别名管理
│   ├── Users/          # 用户管理
│   ├── Login/          # 登录页
│   └── NotFound/       # 404 页面
│
├── services/           # API 服务层
│   ├── auth.ts         # 认证服务
│   ├── items.ts        # 条目 API
│   ├── categories.ts   # 分类 API
│   ├── regions.ts      # 地区 API
│   ├── tags.ts         # 标签 API
│   ├── aliases.ts      # 别名 API
│   ├── users.ts        # 用户 API
│   ├── auditLogs.ts    # 审计日志 API
│   └── stats.ts        # 统计数据 API
│
├── stores/             # Zustand 状态管理
│   ├── authStore.ts    # 认证状态
│   └── ...
│
├── types/              # TypeScript 类型定义
│   └── index.ts        # 所有接口集中定义
│
├── utils/              # 工具函数
│   ├── constants.ts    # 常量定义
│   ├── formatters.ts   # 格式化工具
│   ├── validators.ts   # 验证工具
│   └── index.ts        # 统一导出
│
├── App.tsx             # 根组件
├── main.tsx            # 应用入口
└── vite-env.d.ts       # Vite 类型声明
```

## 目录说明

### components/

- **Auth/**: 认证相关组件，包括 ProtectedRoute 和登录表单
- **Common/**: 通用 UI 组件（按钮、表单、表格等）
- **Layout/**: 页面布局组件（侧边栏、顶部导航等）
- 按照业务领域组织组件，避免过度抽象

### hooks/

- **useAsync**: 统一管理异步操作的 loading/error/data 状态
- **useDebounce**: 防抖 Hook，适用于搜索输入
- **useLocalStorage**: 类型安全的 localStorage 封装

### pages/

每个页面都有独立的目录，包含：
- 页面组件 (.tsx)
- 页面相关的子组件
- 页面样式（如需要）

### lib/

基础设施层，包含第三方库封装和通用基础设施：

- **http/fetch.ts**: 基于原生 Fetch API 封装的 HTTP 客户端
  - 支持拦截器（请求/响应/错误）
  - 事件系统（request/response/error）
  - 自动认证头管理
  - 统一错误处理
  - 类似 axios 的 API 设计
  - 详见 [HTTP 客户端文档](./docs/http-client.md)

- **http/examples.ts**: 拦截器使用示例和初始化模板
- 与业务逻辑分离，可独立测试和替换

### services/

业务 API 服务层，每个文件对应一个 API 域：

- **auth.ts**: 认证相关 API（登录、刷新 token、登出）
- **items.ts**: 条目管理 API
- **categories.ts**: 分类管理 API
- **regions.ts**: 地区管理 API
- **tags.ts**: 标签管理 API
- **aliases.ts**: 别名管理 API
- **users.ts**: 用户管理 API
- **auditLogs.ts**: 审计日志 API
- **stats.ts**: 统计数据 API

### stores/

使用 Zustand 进行全局状态管理：
- **authStore**: 管理用户认证状态、token、登录状态
- 使用 `persist` 中间件自动持久化到 localStorage

### types/

所有 TypeScript 接口集中定义：
- **API 类型**: ApiResponse, PaginatedResponse
- **认证类型**: UserResponse, AuthResponse
- **业务实体**: ItemResponse, CategoryResponse, AliasResponse 等
- 按功能分类，便于查找和维护

### utils/

通用工具函数集合：
- **constants.ts**: 路由、存储键、API 端点等常量
- **formatters.ts**: 日期、时间、文件大小、数字格式化
- **validators.ts**: 邮箱、手机号、密码强度等验证函数

## 开发

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000/admin

### 构建生产版本

```bash
pnpm build
```

### 类型检查

```bash
pnpm typecheck
```

## 目录组织原则

1. **单一职责**: 每个目录有明确的职责边界
2. **业务隔离**: 不同业务模块的组件、页面、API 服务分离
3. **按功能分组**: hooks、utils、types 等通用代码独立组织
4. **避免过度抽象**: 只抽象真正可复用的代码
5. **易于导航**: 清晰的目录结构便于快速定位代码

## 编码规范

- 使用 TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- 优先使用命名导出而非默认导出
- API 服务层统一使用 fetchService
- 所有异步操作考虑错误处理

## 默认账号

开发环境默认管理员账号：

- **邮箱**: admin@test.com
- **密码**: Test1234

## 后端 API

后端服务运行在 http://localhost:8081

开发环境代理配置：

- `/admin/api/v1/*` → `http://localhost:8081/api/v1/*`

## 已修复问题

### ✅ 401 错误（2026-06-20）

**问题**: 所有受保护的前端 API 请求返回 401 Unauthorized
**原因**: FetchService 没有自动添加 Authorization 请求头
**修复**: `src/lib/http/fetch.ts` 现在自动从 localStorage 读取 token 并添加到每个请求的 Authorization 头

## 相关文档

- [后端项目](../README.md)
- [API 文档](http://localhost:8081/swagger/index.html)
- [HTTP 客户端文档](./docs/http-client.md)
- [项目目录结构](./docs/directory-structure.md)
