# 中国地区叫法对比平台 (cnalias)

记录中国不同地区对同一物品的不同叫法（方言/别名）。

## 技术栈

- Go 1.22+
- Gin Router
- GORM + PostgreSQL 15+
- Redis 7+
- JWT认证

## 快速开始

### 环境要求

- Go 1.22+
- PostgreSQL 15+
- Redis 7+
- golang-migrate (数据库迁移工具)

### 环境配置

复制环境变量模板:
```bash
cp .env.example .env
```

编辑 `.env` 文件配置数据库连接等信息。

### 启动开发环境

```bash
# 启动数据库 (使用Docker)
docker-compose up -d postgres redis

# 执行数据库迁移
migrate -path migrations -database "postgres://user:pass@localhost:5432/cnalias?sslmode=disable" up

# 启动服务
go run cmd/server/main.go
```

服务将在 http://localhost:8081 启动

## API文档

启动服务后访问 http://localhost:8081/swagger/index.html

## 项目结构

```
cnalias/
├── cmd/server/           # 应用入口
├── internal/             # 内部代码
│   ├── config/          # 配置
│   ├── model/           # 数据模型
│   ├── repository/      # 数据访问
│   ├── service/         # 业务逻辑
│   ├── handler/         # HTTP处理器
│   ├── middleware/      # 中间件
│   └── dto/             # 请求响应DTO
├── migrations/           # 数据库迁移
└── cnalias-admin/        # 管理后台 (React + Vite + Ant Design)
    ├── src/
    │   ├── components/  # 组件
    │   ├── pages/       # 页面
    │   ├── services/    # API服务
    │   ├── stores/      # Zustand状态管理
    │   └── types/       # TypeScript类型
    ├── Dockerfile       # 生产构建配置
    └── nginx.conf       # Nginx配置
```

## 管理后台

### 技术栈

- React 18 + TypeScript
- Vite 5
- Ant Design 5
- Tailwind CSS 3
- React Query (TanStack Query)
- Zustand
- React Router v6

### 快速开始

#### 开发环境

```bash
cd cnalias-admin
npm install
npm run dev
```

管理后台将在 http://localhost:3000 启动

#### 生产部署

**方式一：Docker独立部署**

```bash
# 构建并启动管理后台
docker-compose -f docker-compose.admin.yml up -d

# 访问 http://localhost:3000
```

**方式二：单独构建**

```bash
cd cnalias-admin
npm run build

# 使用任何Web服务器（如Nginx）托管dist/目录
# 配置反向代理 /admin/api/* -> http://backend:8080/api/v1/*
```

**Nginx配置示例**（与主服务共享域名，路径为/admin）：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 管理后台
    location /admin {
        root /usr/share/nginx/html/admin;
        try_files $uri $uri/ /admin/index.html;
    }

    # 管理后台API代理
    location /admin/api/ {
        proxy_pass http://backend:8080/api/v1/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 其他配置...
}
```

### 功能特性

- ✅ 用户管理（列表、筛选、编辑、删除）
- ✅ 别名审核（通过/拒绝、备注）
- ✅ 物品管理（CRUD）
- ✅ 分类管理（CRUD）
- ✅ 地区管理（CRUD）
- ✅ 标签管理（CRUD）
- ✅ 审计日志（过滤、分页）
- ✅ 看板统计
- ✅ JWT认证与自动刷新
- ✅ 权限控制（仅管理员可访问）

