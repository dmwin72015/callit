# 中国地区叫法对比平台 (cnalias)

记录中国不同地区对同一物品的不同叫法（方言/别名）。

## 技术栈

- **后端**：Go 1.22 + Gin + GORM + PostgreSQL + Redis
- **前端**：React 19 + TypeScript + Vite + Ant Design + Tailwind CSS

## 项目结构

```
cnalias/
├── server/          # Go 后端服务
│   ├── cmd/server/  # 应用入口
│   └── internal/    # 业务逻辑
├── admin/           # 管理后台前端
│   └── src/
├── migrations/      # 数据库迁移
└── docs/            # 项目文档
```

---

## 开发环境

> **注意**：本地开发不需要 Docker。PostgreSQL 和 Redis 使用外部已存在的 Docker 容器。

### 环境要求

- Go 1.22+
- Node.js 20+
- PostgreSQL 15+（外部 Docker 容器）
- Redis 7+（外部 Docker 容器）

### 快速开始

**只需两步：**

```bash
# 1. 启动后端
./server

# 2. 启动前端（新终端）
cd admin && npm install && npm run dev
```

访问 http://localhost:3000

默认配置（.env）：
```env
DB_HOST=localhost
DB_PORT=5432
REDIS_HOST=localhost
REDIS_PORT=6379
SERVER_PORT=8081
```

详细开发指南请查看 [DEVELOPMENT.md](./DEVELOPMENT.md)。

---

## 生产环境

> **注意**：生产环境使用 Docker Compose 一键部署，包含所有服务。

### 一键部署

```bash
# 1. 配置环境变量
cp .env.example .env
vim .env  # 修改 JWT_SECRET 等配置

# 2. 启动所有服务
docker-compose up -d

# 3. 验证部署
docker-compose ps
```

访问 http://your-server-ip

### 生产环境服务

- **Frontend (Nginx)**: 端口 80
- **Backend API**: 端口 8080
- **PostgreSQL**: 端口 5432
- **Redis**: 端口 6379
- **Redis Commander**（可选）: 端口 8081

详细部署指南请查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 和 [PRODUCTION.md](./PRODUCTION.md)。

---

## 测试账号

- **邮箱**：`admin@test.com`
- **密码**：`Test123456`
