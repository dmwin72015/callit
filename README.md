# 中国地区叫法对比平台 (cnalias)

记录中国不同地区对同一物品的不同叫法（方言/别名）。

## 技术栈

- **后端**：Go 1.22 + Gin + GORM + PostgreSQL + Redis
- **前端**：React 18 + TypeScript + Vite + Ant Design + Tailwind CSS

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

## 快速开始

### 环境要求

- Go 1.22+
- Node.js 20+
- PostgreSQL 15+（已在外部运行）
- Redis 7+（已在外部运行）

### 开发环境

**开发非常简单**，只需两步：

```bash
# 1. 启动后端
./server

# 2. 启动前端（新终端）
cd admin && npm install && npm run dev
```

访问 http://localhost:3000

详细开发指南请查看 [DEVELOPMENT.md](./DEVELOPMENT.md)。

## 生产部署

使用 Docker 一键部署：

```bash
docker-compose up -d
```

前端单独构建：
```bash
cd admin && npm run build
```

## 测试账号

- **邮箱**：`admin@test.com`
- **密码**：`Test123456`
