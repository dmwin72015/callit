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

服务将在 http://localhost:8080 启动

## API文档

启动服务后访问 http://localhost:8080/swagger/index.html

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
└── migrations/           # 数据库迁移
```
