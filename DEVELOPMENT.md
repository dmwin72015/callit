# 开发环境指南

本文档说明如何在本地开发环境中启动各个服务。

## 架构说明

开发环境采用**服务分离**模式：

```
┌──────────────────────────────────────────────────┐
│            Development Environment               │
├──────────────────────────────────────────────────┤
│  ┌─────────────┐      ┌─────────────┐           │
│  │   Frontend  │      │   Backend   │           │
│  │  (本地运行)  │      │  (本地运行)  │           │
│  │  :3000      │      │  :8081      │           │
│  └─────────────┘      └─────────────┘           │
│         ↕ 代理 /admin/api/*                      │
│  ┌─────────────┐      ┌─────────────┐           │
│  │ PostgreSQL  │      │    Redis    │           │
│  │  (Docker)   │      │  (Docker)   │           │
│  │  :5432      │      │  :6379      │           │
│  └─────────────┘      └─────────────┘           │
└──────────────────────────────────────────────────┘
```

## 快速开始

### 方式一：本地开发（推荐）⭐

**只有数据库和 Redis 使用 Docker，后端和前端在本地运行，支持热重载。**

#### 1. 启动基础设施

```bash
# 启动数据库和 Redis（只需执行一次）
docker-compose up -d postgres redis

# 验证服务状态
docker-compose ps

# 应该看到两个服务都在运行：
# - cnalias-postgres (healthy) :5432
# - cnalias-redis (healthy) :6379
```

#### 2. 配置环境变量

```bash
# 如果还没配置
cp .env.example .env

# 确保 .env 中使用 localhost（因为数据库在 Docker 中映射到本地）
```

#### 3. 启动后端服务

```bash
# 方式 A：直接运行编译后的二进制文件（最快）
./server

# 方式 B：使用 Go 热重载（推荐开发时使用）
# 安装 air: go install github.com/air-verse/air@latest
air

# 后端将在 http://localhost:8081 启动
# 支持热重载：修改 Go 代码后自动重启
```

#### 4. 启动前端管理后台

```bash
# 新开一个终端窗口
cd cnalias-admin

# 安装依赖（首次运行）
npm install

# 启动开发服务器
npm run dev

# 前端将在 http://localhost:3000 启动
# 支持 HMR：修改 React 代码后自动刷新
```

### 方式二：完全 Docker 开发

所有服务都在 Docker 容器中运行（适合团队统一环境）。

```bash
# 启动所有服务
docker-compose -f docker-compose.dev.yml up

# 后台运行
docker-compose -f docker-compose.dev.yml up -d

# 查看日志
docker-compose -f docker-compose.dev.yml logs -f

# 停止服务
docker-compose -f docker-compose.dev.yml down
```

访问地址：
- 前端管理后台：http://localhost:3000
- 后端 API：http://localhost:8081
- Swagger 文档：http://localhost:8081/swagger/index.html

### 方式三：仅后端 Docker

前端本地运行，后端和数据库在 Docker 中（适合前端开发）。

```bash
# 1. 启动所有服务
docker-compose up -d

# 2. 前端本地运行
cd cnalias-admin && npm run dev

# 访问 http://localhost:3000
# 前端通过 Vite 代理访问 Docker 中的后端
```

## 配置说明

### 环境变量

#### 后端 (.env) - 本地开发

```env
# 服务器配置
APP_ENV=development
LOG_LEVEL=debug
SERVER_PORT=8081

# 数据库配置（本地连接 Docker 中的数据库）
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=cnalias
DB_SSLMODE=disable

# Redis 配置（本地连接 Docker 中的 Redis）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT 配置
JWT_SECRET=dev-secret-key-change-in-production
JWT_ACCESS_TOKEN_TTL=15m
JWT_REFRESH_TOKEN_TTL=168h
```

#### 前端 (cnalias-admin/.env)

```env
# API 地址（开发环境指向本地后端）
VITE_API_BASE_URL=http://localhost:8081/api/v1
```

### Vite 开发代理

`cnalias-admin/vite.config.ts` 配置了代理，解决开发环境 CORS 问题：

```typescript
proxy: {
  '/admin/api': {
    target: 'http://localhost:8081',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/admin\/api/, '/api/v1'),
  },
}
```

**工作原理：**
- 前端调用 `/admin/api/auth/login` → Vite 代理 → `http://localhost:8081/api/v1/auth/login`
- 生产环境使用 Nginx 配置相同的代理规则

## 数据库操作

### 执行迁移

```bash
# 安装 migrate 工具（如果还没安装）
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# 执行所有迁移
migrate -path migrations -database "postgres://postgres:postgres@localhost:5432/cnalias?sslmode=disable" up

# 查看当前版本
migrate -path migrations -database "postgres://postgres:postgres@localhost:5432/cnalias?sslmode=disable" version

# 回滚一个版本
migrate -path migrations -database "postgres://postgres:postgres@localhost:5432/cnalias?sslmode=disable" down 1
```

### 手动操作数据库

```bash
# 连接到数据库
docker-compose exec postgres psql -U postgres -d cnalias

# 或使用本地 psql
psql -h localhost -U postgres -d cnalias
```

## 测试账号

创建完成后，使用以下测试账号登录管理后台：

- **邮箱**：`admin@test.com`
- **密码**：`Test123456`
- **角色**：ADMIN

### 重新创建测试账号

```bash
# 1. 注册用户
curl -X POST http://localhost:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testadmin","email":"admin@test.com","password":"Test123456"}'

# 2. 提升为管理员并验证
docker-compose exec -T postgres psql -U postgres -d cnalias \
  -c "UPDATE users SET role = 'ADMIN', is_verified = true WHERE email = 'admin@test.com';"

# 3. 验证
docker-compose exec -T postgres psql -U postgres -d cnalias \
  -c "SELECT id, username, email, role, is_verified FROM users WHERE email = 'admin@test.com';"
```

## 常见问题

### 后端启动失败

```bash
# 1. 检查数据库是否运行
docker-compose ps

# 2. 检查数据库连接
docker-compose exec postgres pg_isready -U postgres

# 3. 检查环境变量
cat .env

# 4. 查看详细日志
./server 2>&1 | tee server.log

# 5. 如果是端口冲突
lsof -i :8081
kill -9 <PID>
```

### 前端无法连接后端

```bash
# 1. 测试后端是否正常
curl http://localhost:8081/health

# 2. 检查前端配置
cat cnalias-admin/.env

# 3. 清除 Vite 缓存
cd cnalias-admin && rm -rf node_modules/.vite

# 4. 重新安装依赖
cd cnalias-admin && npm install

# 5. 检查代理配置
cat cnalias-admin/vite.config.ts
```

### CORS 错误

确认以下几点：
1. ✅ 后端 `.env` 中 `APP_ENV=development`
2. ✅ Vite 代理配置正确
3. ✅ 后端已启动并监听 `:8081`
4. ✅ 前端 `VITE_API_BASE_URL=http://localhost:8081/api/v1`

### 数据库迁移失败

```bash
# 检查迁移文件
ls -la migrations/

# 查看迁移状态
docker-compose exec postgres psql -U postgres -d cnalias -c "\d"

# 重置数据库（谨慎使用！）
docker-compose down -v  # 删除 volume
docker-compose up -d postgres
```

## 开发工具推荐

- **后端**：
  - [air](https://github.com/air-verse/air) - Go 热重载
  - [golangci-lint](https://golangci-lint.run/) - Go 代码检查

- **前端**：
  - [React Developer Tools](https://react.dev/learn/react-developer-tools) - React 调试
  - [Ant Design DevTools](https://ant.design/docs/react/devtools) - Ant Design 调试

- **数据库**：
  - [pgAdmin 4](https://www.pgadmin.org/) - PostgreSQL 管理（已在 docker-compose.yml 中配置）
  - [Redis Insight](https://redis.io/insight/) - Redis 可视化

## 生产环境部署

生产环境使用单容器部署，所有服务集成到 Docker：

```bash
# 仅启动后端（不含前端）
docker-compose up -d

# 使用生产配置（包含 Nginx）
docker-compose -f docker-compose.prod.yml up -d
```

前端单独构建：
```bash
cd cnalias-admin
npm run build
# 将 dist/ 目录部署到 Web 服务器（如 Nginx）
# 配置 /admin/api/* -> http://backend:8080/api/v1/* 代理
```

详见 [docker-compose.prod.yml](./docker-compose.prod.yml) 和 [cnalias-admin/Dockerfile](./cnalias-admin/Dockerfile)。

