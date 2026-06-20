# 开发环境指南

PostgreSQL 和 Redis 在外部 Docker 容器中运行，开发时只需启动本地服务。

## 快速开始

### 1. 配置

```bash
cp .env.example .env
```

确保数据库配置正确（默认 `localhost:5432` 和 `localhost:6379`）。

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

## 配置

**后端**（`.env`）：

```env
DB_HOST=localhost
DB_PORT=5432
REDIS_HOST=localhost
REDIS_PORT=6379
SERVER_PORT=8081
```

**前端**（`admin/.env`）：

```env
VITE_API_BASE_URL=http://localhost:8081/api/v1
```

## 常见问题

### 后端启动失败

```bash
# 检查数据库
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
