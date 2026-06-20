# 开发环境指南

> **重要**：本地开发不需要 Docker。PostgreSQL 和 Redis 使用外部已存在的 Docker 容器。

## 环境要求

- Go 1.22+
- Node.js 20+
- PostgreSQL 15+（外部 Docker 容器）
- Redis 7+（外部 Docker 容器）

## 快速开始

### 1. 配置

```bash
cp .env.example .env
```

确保 `.env` 中的数据库和 Redis 配置与外部容器一致（默认 `localhost:5432` 和 `localhost:6379`）。

### 2. 启动后端

```bash
./server
# 或使用 air 热重载
air
```

后端运行在 http://localhost:8081

### 3. 启动前端

```bash
cd admin
npm install
npm run dev
```

前端运行在 http://localhost:3000

完成！

## 配置说明

### 后端配置 (`.env`)

```env
# 使用外部 Docker 容器
DB_HOST=localhost
DB_PORT=5432
REDIS_HOST=localhost
REDIS_PORT=6379
SERVER_PORT=8081
```

### 前端配置 (`admin/.env`)

```env
VITE_API_BASE_URL=http://localhost:8081/api/v1
```

### 生产环境配置

生产环境使用 Docker Compose 部署，配置参见：
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [PRODUCTION.md](./PRODUCTION.md)
- [.env.docker](./.env.docker) - 生产环境配置模板（不提交到 git）

## 常见问题

### 后端启动失败

```bash
# 检查数据库（确保外部容器正在运行）
psql -h localhost -U postgres -d cnalias -c "SELECT 1"

# 检查 Redis
redis-cli -h localhost ping
```

### 前端无法连接后端

```bash
# 测试后端
curl http://localhost:8081/health

# 清除缓存
cd admin && rm -rf node_modules/.vite
```
