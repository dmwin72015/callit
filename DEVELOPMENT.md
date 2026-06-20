# 开发环境指南

本文档说明如何在本地开发环境中启动项目。

## 架构说明

开发环境采用**本地运行**模式：

```
┌─────────────────────────────────────────────┐
│        Development Environment              │
├─────────────────────────────────────────────┤
│  ┌─────────────┐      ┌─────────────┐      │
│  │   Frontend  │      │   Backend   │      │
│  │  (本地)     │      │  (本地)     │      │
│  │  :3000      │      │  :8081      │      │
│  └─────────────┘      └─────────────┘      │
│              ↕ Vite Proxy                   │
│  ┌─────────────┐      ┌─────────────┐      │
│  │ PostgreSQL  │      │    Redis    │      │
│  │  (Docker)   │      │  (Docker)   │      │
│  │  :5432      │      │  :6379      │      │
│  └─────────────┘      └─────────────┘      │
└─────────────────────────────────────────────┘
```

## 快速开始

### 前置条件

- Go 1.22+
- Node.js 20+
- Docker & Docker Compose（用于运行 PostgreSQL 和 Redis）

### 1. 启动基础设施

只需在第一次启动或需要重置数据库时执行：

```bash
# 启动 PostgreSQL 和 Redis
docker-compose up -d postgres redis

# 验证服务状态
docker-compose ps
```

### 2. 配置环境变量

```bash
# 复制环境变量模板（如果还没配置）
cp .env.example .env

# 编辑配置（可选）
vim .env
```

### 3. 启动后端服务

```bash
# 方式 A：直接运行（最快）
./server

# 方式 B：使用 air 热重载（推荐开发时使用）
# 安装: go install github.com/air-verse/air@latest
air
```

后端将在 **http://localhost:8081** 启动。

### 4. 启动前端管理后台

```bash
# 新开一个终端窗口
cd admin

# 安装依赖（首次运行）
npm install

# 启动开发服务器
npm run dev
```

前端将在 **http://localhost:3000** 启动。

### 完成！

访问 http://localhost:3000 即可使用管理后台。

## 测试账号

- **邮箱**：`admin@test.com`
- **密码**：`Test123456`

如果没有测试账号，参考 [创建测试账号](#创建测试账号)。

## 数据库迁移

```bash
# 安装 migrate 工具
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# 执行迁移
migrate -path migrations -database "postgres://postgres:postgres@localhost:5432/cnalias?sslmode=disable" up

# 查看版本
migrate -path migrations -database "postgres://postgres:postgres@localhost:5432/cnalias?sslmode=disable" version
```

## 常见问题

### 后端启动失败

```bash
# 1. 检查数据库是否运行
docker-compose ps

# 2. 检查环境变量
cat .env

# 3. 查看详细日志
./server
```

### 前端无法连接后端

```bash
# 1. 测试后端
curl http://localhost:8081/health

# 2. 检查前端配置
cat admin/.env

# 3. 清除缓存
cd admin && rm -rf node_modules/.vite
```

### 数据库连接失败

```bash
# 测试 PostgreSQL
docker-compose exec postgres pg_isready -U postgres

# 测试 Redis
docker-compose exec redis redis-cli ping

# 重启服务
docker-compose restart postgres redis
```

## 创建测试账号

```bash
# 1. 注册用户
curl -X POST http://localhost:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testadmin","email":"admin@test.com","password":"Test123456"}'

# 2. 提升为管理员
docker-compose exec -T postgres psql -U postgres -d cnalias \
  -c "UPDATE users SET role = 'ADMIN', is_verified = true WHERE email = 'admin@test.com';"

# 3. 验证
docker-compose exec -T postgres psql -U postgres -d cnalias \
  -c "SELECT id, username, email, role, is_verified FROM users WHERE email = 'admin@test.com';"
```

## 生产环境部署

生产环境使用 Docker 一键部署：

```bash
# 构建并启动所有服务
docker-compose up -d

# 仅查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

前端单独构建：
```bash
cd admin
npm run build
# dist/ 目录包含所有静态文件
```

## 配置说明

### 后端配置 (.env)

```env
APP_ENV=development
SERVER_PORT=8081
DB_HOST=localhost          # Docker 映射到本地
DB_PORT=5432
REDIS_HOST=localhost       # Docker 映射到本地
REDIS_PORT=6379
JWT_SECRET=dev-secret-key
```

### 前端配置 (admin/.env)

```env
VITE_API_BASE_URL=http://localhost:8081/api/v1
```

### Vite 代理

开发环境通过 Vite 代理转发 API 请求到后端，避免 CORS 问题：

```typescript
// vite.config.ts
proxy: {
  '/admin/api': {
    target: 'http://localhost:8081',
    rewrite: (path) => path.replace(/^\/admin\/api/, '/api/v1'),
  },
}
```
