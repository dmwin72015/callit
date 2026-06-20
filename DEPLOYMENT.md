# 生产环境部署指南

## 一键部署

```bash
# 1. 克隆代码到服务器
git clone <your-repo-url>
cd cnalias

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，修改 JWT_SECRET 等配置
vim .env

# 3. 启动所有服务
docker-compose up -d

# 4. 查看日志
docker-compose logs -f

# 5. 运行数据库迁移（如果需要）
docker-compose exec backend /app/server migrate
```

## 服务说明

部署完成后，以下服务将自动启动：

- **Frontend** (Nginx): http://your-server-ip (端口 80)
- **Backend API**: http://your-server-ip:8080
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 管理工具（可选）

启动 Redis Commander（Redis 管理界面）：

```bash
docker-compose --profile tools up -d redis-commander
```

访问 http://your-server-ip:8081

## 数据持久化

所有数据存储在 Docker volumes 中：

- `postgres_data` - PostgreSQL 数据
- `redis_data` - Redis 数据

## 备份

### 备份数据库

```bash
docker-compose exec postgres pg_dump -U postgres cnalias > backup.sql
```

### 恢复数据库

```bash
docker-compose exec -T postgres psql -U postgres cnalias < backup.sql
```

## 更新

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```

## 停止服务

```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷（谨慎使用）
docker-compose down -v
```

## 测试账号

- **邮箱**: `admin@test.com`
- **密码**: `Test123456`

## 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| DB_USER | 数据库用户名 | postgres |
| DB_PASSWORD | 数据库密码 | postgres |
| DB_NAME | 数据库名 | cnalias |
| JWT_SECRET | JWT 密钥（生产环境必须修改） | your-secret-key-change-in-production |
| JWT_ACCESS_TOKEN_TTL | Access Token 有效期 | 15m |
| JWT_REFRESH_TOKEN_TTL | Refresh Token 有效期 | 168h |
