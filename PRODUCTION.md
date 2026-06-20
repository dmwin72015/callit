# 生产环境部署架构

## 服务架构

```
┌─────────────────────────────────────────────────┐
│                    Nginx (80)                    │
│  ┌──────────────────────────────────────────┐   │
│  │  - 静态文件服务 (React 前端)               │   │
│  │  - Gzip 压缩                              │   │
│  │  - API 反向代理 /admin/api/* → backend    │   │
│  │  - React Router 客户端路由支持             │   │
│  └──────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│              Backend (Go + Gin) (8080)           │
│  ┌──────────────────────────────────────────┐   │
│  │  - JWT 认证                               │   │
│  │  - API 路由 /api/v1/*                     │   │
│  │  - 业务逻辑处理                           │   │
│  └──────────────────────────────────────────┘   │
└──────────┬───────────────────────┬──────────────┘
           │                       │
┌──────────▼───────┐    ┌──────────▼──────────┐
│  PostgreSQL      │    │   Redis             │
│  (5432)          │    │   (6379)            │
│  - 主数据库       │    │   - 缓存            │
│  - 数据持久化     │    │   - Session         │
└──────────────────┘    └─────────────────────┘
```

## 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| Frontend (Nginx) | 80 | React 前端 + API 代理 |
| Backend | 8080 | Go API 服务 |
| PostgreSQL | 5432 | 数据库 |
| Redis | 6379 | 缓存 |
| Redis Commander | 8081 | Redis 管理工具（可选） |

## 访问方式

- **前端界面**: http://your-server-ip/
- **后端 API**: http://your-server-ip:8080
- **API 文档**: http://your-server-ip:8080/swagger/index.html
- **Redis Commander**: http://your-server-ip:8081（可选）

## 一键部署

```bash
# 1. 克隆代码
git clone <your-repo>
cd cnalias

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，修改 JWT_SECRET 等配置

# 3. 启动所有服务
docker-compose up -d

# 4. 验证部署
docker-compose ps
curl http://localhost/health
```

## 数据流

### 前端请求流程

```
用户浏览器
    ↓
Nginx (80)
    ├─→ /admin/api/* → Backend:8080/api/v1/*
    ├─→ /admin/* → 返回 index.html (React Router 处理)
    └─→ /* → 返回 index.html
```

### API 请求流程

```
Nginx (80)
    ↓
Backend (8080)
    ├─→ PostgreSQL (5432) - 数据读写
    └─→ Redis (6379) - 缓存/Session
```

## 环境变量配置

所有配置通过环境变量注入，支持热更新（需重启容器）。

### 必需配置

```env
# JWT 密钥（生产环境必须修改！）
JWT_SECRET=your-super-secret-key-here

# 数据库
DB_USER=postgres
DB_PASSWORD=secure-password
DB_NAME=cnalias
```

### 可选配置

```env
# JWT Token 有效期
JWT_ACCESS_TOKEN_TTL=15m
JWT_REFRESH_TOKEN_TTL=168h

# Redis
REDIS_PASSWORD=  # 如果 Redis 需要密码
```

## 健康检查

所有服务都配置了健康检查：

```bash
# 查看服务状态
docker-compose ps

# 查看健康状态
docker-compose ps --format json | grep Health
```

## 日志查看

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 扩展示例

### 使用自定义域名

在 Nginx 配置中添加：

```nginx
server_name your-domain.com;
```

### 启用 HTTPS

使用 Let's Encrypt：

```bash
# 安装 certbot
docker run -it --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  certbot/certbot certonly --webroot -w /var/www/certbot \
  -d your-domain.com
```

### 数据库备份

```bash
# 备份
docker-compose exec postgres pg_dump -U postgres cnalias > backup.sql

# 恢复
docker-compose exec -T postgres psql -U postgres cnalias < backup.sql
```
