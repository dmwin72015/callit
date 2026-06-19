# 中国地区叫法对比平台 - 后端架构设计

## 项目概述

一个让用户浏览、提交和审核中国不同地区对同一物品（动植物、食物等）的不同叫法（方言/别名）的Web平台。

### 核心价值
- 记录和传承中国各地丰富的方言文化
- 通过用户贡献建立权威的地区叫法词典
- 管理员审核机制保证内容质量

### 设计原则
- **以物品为核心**：所有别名围绕同一物品，确保客观性
- **地区多级结构**：支持省、市、方言区等多粒度标注
- **审核机制**：匿名提交需审核，可信用户高优先级
- **可扩展架构**：模块化设计，支持后续快速迭代

---

## 数据库设计

### 核心表

#### 1. items（物品表）
```sql
id          BIGSERIAL PRIMARY KEY
name        VARCHAR(100) NOT NULL          -- 标准/通用名称
category_id BIGINT REFERENCES categories   -- 所属分类
description TEXT                            -- 物品描述
created_by  BIGINT REFERENCES users        -- 创建者（NULL表示匿名）
created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()

UNIQUE(name, category_id)
INDEX idx_category (category_id)
```

#### 2. item_aliases（物品别名表）
```sql
id           BIGSERIAL PRIMARY KEY
item_id      BIGINT NOT NULL REFERENCES items
alias_name   VARCHAR(100) NOT NULL         -- 地区别名
region_id    BIGINT NOT NULL REFERENCES regions
name_type    VARCHAR(20) NOT NULL          -- 'COMMON' | 'ALIAS'
votes_count  INT DEFAULT 0                 -- 投票数（备用）
status       VARCHAR(20) DEFAULT 'PENDING' -- 'PENDING' | 'APPROVED' | 'REJECTED'
submitted_by BIGINT REFERENCES users
reviewer_id  BIGINT REFERENCES users
reviewed_at  TIMESTAMPTZ
review_note  TEXT                          -- 审核意见
created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()

UNIQUE(item_id, region_id, alias_name)
INDEX idx_status (status)
INDEX idx_region (region_id)
INDEX idx_item_region (item_id, region_id)
```

#### 3. categories（分类表）
```sql
id         BIGSERIAL PRIMARY KEY
name       VARCHAR(50) NOT NULL
parent_id  BIGINT REFERENCES categories  -- 支持多级分类
icon       VARCHAR(50)
sort_order INT DEFAULT 0

UNIQUE(name, parent_id)
```

#### 4. regions（地区表）
```sql
id          BIGSERIAL PRIMARY KEY
name        VARCHAR(50) NOT NULL
parent_id   BIGINT REFERENCES regions
region_type VARCHAR(20) NOT NULL          -- 'PROVINCE' | 'CITY' | 'DIALECT' | 'CUSTOM'
code        VARCHAR(20) UNIQUE            -- 行政区划代码
sort_order  INT DEFAULT 0

UNIQUE(name, parent_id)
```

#### 5. tags（标签表）
```sql
id    BIGSERIAL PRIMARY KEY
name  VARCHAR(50) NOT NULL UNIQUE
color VARCHAR(20)                         -- 标签颜色
```

#### 6. item_tags（物品标签关联表）
```sql
item_id BIGINT REFERENCES items
tag_id  BIGINT REFERENCES tags
PRIMARY KEY (item_id, tag_id)
```

#### 7. users（用户表）
```sql
id              BIGSERIAL PRIMARY KEY
username        VARCHAR(50) NOT NULL UNIQUE
email           VARCHAR(100) NOT NULL UNIQUE
password_hash   VARCHAR(255) NOT NULL
role            VARCHAR(20) DEFAULT 'USER' -- 'USER' | 'ADMIN'
is_verified     BOOLEAN DEFAULT FALSE
created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
last_login_at   TIMESTAMPTZ
```

#### 8. review_logs（审核日志表）
```sql
id           BIGSERIAL PRIMARY KEY
alias_id     BIGINT NOT NULL REFERENCES item_aliases
reviewer_id  BIGINT NOT NULL REFERENCES users
action       VARCHAR(20) NOT NULL         -- 'APPROVE' | 'REJECT'
note         TEXT
created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

---

## 技术架构

### 技术栈

#### 后端
- **语言**: Go 1.22+
- **Web框架**: Chi Router (v5)
- **ORM**: GORM v1.25
- **数据库驱动**: pgx/v5
- **缓存**: Redis 7+
- **认证**: JWT + Redis Refresh Token
- **验证**: go-playground/validator
- **配置**: Viper
- **日志**: Uber Zap (结构化日志)
- **文档**: Swag (OpenAPI 3.0)

#### 数据库
- **PostgreSQL 15+** (JSONB、全文检索、窗口函数)
- **Redis Cluster** (会话、缓存、队列)

### 项目结构

```
cnalias/
├── cmd/
│   └── server/                  # 主入口
│       └── main.go
├── internal/
│   ├── config/                  # 配置管理
│   │   ├── config.go
│   │   └── database.go
│   ├── handler/                 # HTTP处理器
│   │   ├── item/
│   │   ├── alias/
│   │   ├── region/
│   │   ├── admin/
│   │   └── auth/
│   ├── service/                 # 业务逻辑
│   │   ├── item/
│   │   ├── alias/
│   │   ├── review/
│   │   └── user/
│   ├── repository/              # 数据访问
│   │   ├── item_repo.go
│   │   ├── alias_repo.go
│   │   ├── review_repo.go
│   │   └── user_repo.go
│   ├── model/                   # 数据模型
│   │   ├── item.go
│   │   ├── alias.go
│   │   └── ...
│   ├── middleware/               # 中间件
│   │   ├── auth.go
│   │   ├── cors.go
│   │   ├── logger.go
│   │   └── rate_limit.go
│   ├── dto/                     # 请求/响应DTO
│   ├── cache/                    # 缓存策略
│   └── pkg/                     # 工具函数
├── migrations/                   # 数据库迁移
│   ├── 001_create_tables.up.sql
│   └── 001_create_tables.down.sql
├── docs/                        # API文档
├── deploy/                      # 部署配置
│   ├── docker-compose.yml
│   └── Dockerfile
├── scripts/                     # 工具脚本
├── go.mod
├── .env.example
└── README.md
```

---

## API 设计

### 公开接口（无需认证）

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/v1/items` | 物品列表（分页、搜索、分类筛选） |
| GET | `/api/v1/items/{id}` | 物品详情（含已审核别名） |
| GET | `/api/v1/regions` | 地区树形结构 |
| GET | `/api/v1/categories` | 分类树 |
| GET | `/api/v1/aliases/search` | 别名搜索（根据地区词查找物品） |
| GET | `/api/v1/aliases/popular` | 热门别名排行 |
| POST | `/api/v1/auth/register` | 用户注册 |
| POST | `/api/v1/auth/login` | 登录 |
| POST | `/api/v1/auth/refresh` | 刷新token |
| POST | `/api/v1/submissions/anonymous` | 匿名提交别名 |

### 用户接口（需登录）

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/v1/aliases` | 提交别名 |
| GET | `/api/v1/users/me/submissions` | 我的提交记录 |
| PATCH | `/api/v1/users/me/submissions/{id}` | 修改提交 |
| DELETE | `/api/v1/users/me/submissions/{id}` | 删除提交 |

### 管理员接口（需admin角色）

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/v1/admin/review/queue` | 审核队列（按优先级） |
| POST | `/api/v1/admin/review/{id}/approve` | 审核通过 |
| POST | `/api/v1/admin/review/{id}/reject` | 审核拒绝 |
| GET | `/api/v1/admin/items` | 管理物品（CRUD） |
| POST | `/api/v1/admin/categories` | 管理分类 |
| POST | `/api/v1/admin/regions` | 管理地区 |
| GET | `/api/v1/admin/users` | 用户管理 |
| PATCH | `/api/v1/admin/users/{id}/role` | 修改用户角色 |
| GET | `/api/v1/admin/stats` | 统计数据 |

---

## 核心流程

### 1. 提交审核流程

```
用户提交别名
  → 参数验证
  → 检查重复（物品+地区+别名）
  → 根据用户类型设置优先级
  → 存入数据库（status=PENDING）
  → 加入Redis审核队列
  → 返回成功
```

**优先级规则：**
- 已登录可信用户：优先级 = 100
- 新注册用户：优先级 = 50
- 匿名提交：优先级 = 10

### 2. 审核处理流程

```
管理员获取队列（按优先级降序）
  → 查看提交详情
  → 操作：通过 / 拒绝
  → 通过：
    - 更新别名状态为APPROVED
    - 清除相关缓存
    - 记录审核日志
    - 发送通知（可选）
  → 拒绝：
    - 更新状态为REJECTED
    - 记录原因
    - 记录审核日志
```

### 3. 查询流程

```
请求到达
  → 限流检查
  → 查Redis缓存
  → 缓存命中 → 直接返回
  → 缓存未命中 → 查询数据库
  → 数据组装 → 写入缓存 → 返回
```

---

## 中间件

### 1. 认证中间件 (auth)
- 验证JWT token有效性
- 从Redis校验token是否被撤销
- 将用户信息注入context

### 2. 权限中间件 (rbac)
- 检查用户角色（USER / ADMIN）
- 未授权返回403

### 3. 限流中间件 (rate-limit)
基于Redis令牌桶算法：

| 接口 | 限制 | 说明 |
|------|------|------|
| 匿名提交 | 1次/5分钟/IP | 防止滥用 |
| 登录接口 | 5次/分钟/IP | 防止暴力破解 |
| 登录用户提交 | 10次/分钟 | 正常使用 |

### 4. 日志中间件 (logger)
- 请求日志（方法、路径、耗时、状态码）
- 错误日志（panic捕获）

### 5. CORS中间件
- 允许配置的来源、方法、Header

---

## 安全设计

### 认证安全
- 密码：bcrypt加密（cost=12）
- Access Token：15分钟过期
- Refresh Token：7天过期，存储在Redis
- 支持主动退出（删除Redis中的token）

### 数据安全
- 所有查询使用参数化（GORM自动处理）
- 用户输入验证（validator）
- XSS防护：前端输出编码 + 后端过滤HTML标签
- CSRF防护：JWT通过Authorization header传输

### 接口安全
- 限流：防止暴力请求
- 幂等性：提交接口支持幂等键（Idempotency-Key）
- 敏感接口：仅管理员可访问

---

## 缓存策略（Redis）

| 数据 | Key | 过期时间 | 更新策略 |
|------|-----|---------|---------|
| 物品列表 | `items:list:{page}:{filters}` | 5分钟 | 别名审核通过后删除 |
| 物品详情 | `item:{id}` | 10分钟 | 别名审核通过后删除 |
| 地区树 | `regions:tree` | 1小时 | 地区管理修改后删除 |
| 分类树 | `categories:tree` | 1小时 | 分类管理修改后删除 |
| 热门别名 | `aliases:popular` | 30分钟 | 定时刷新 |
| Refresh Token | `refresh_token:{user_id}` | 7天 | 主动退出时删除 |
| 限流计数器 | `rate_limit:{key}` | 1分钟 | 自动过期 |
| 审核队列 | `review:queue` | - | 实时操作 |

---

## 错误处理

### HTTP状态码规范
- `200` - 成功
- `201` - 创建成功
- `400` - 参数错误
- `401` - 未认证
- `403` - 无权限
- `404` - 资源不存在
- `409` - 资源冲突（如重复提交）
- `429` - 请求过于频繁
- `500` - 服务器错误

### 统一响应格式
```json
{
  "code": 200,
  "message": "success",
  "data": { ... },
  "timestamp": "2026-06-19T12:00:00Z"
}
```

---

## 监控与可观测性

### 日志
- 结构化JSON日志（Uber Zap）
- 关键操作日志（提交、审核、登录）
- 错误日志带堆栈信息

### 指标（后续）
- 请求QPS、响应时间
- 数据库查询耗时
- Redis命中率
- 审核队列长度

---

## 部署方案

### 开发环境
```bash
docker-compose up -d  # 启动PostgreSQL + Redis
go run cmd/server/main.go
```

### 生产环境
- 容器化部署（Docker + Kubernetes）
- 数据库主从复制（读写分离）
- Redis Cluster（高可用）
- 数据库自动备份（pg_dump）

---

## 后续迭代扩展点

### 短期（v1.1-v1.2）
1. **数据导入**：批量导入方言词典数据
2. **全文检索优化**：引入Elasticsearch替代PG tsvector

### 中期（v1.3-v1.5）
3. **用户等级系统**：贡献积分、免审核权限
4. **投票功能**：用户对已审核别名投票，自动认定常用名/别名（v1.3+）
5. **数据统计仪表板**：热门地区、活跃用户、审核效率
6. **API限流优化**：基于用户等级差异化

### 长期（v2.0+）
7. **内容推荐**：基于浏览历史推荐相关物品
8. **多语言支持**：物品描述支持英文等其他语言
9. **移动端API优化**：GraphQL支持
10. **社交功能**：关注用户、分享、评论

---

## 性能优化

### 数据库
- 索引策略：高频查询字段建立索引
- 分页查询：使用keyset pagination替代offset
- 连接池：pgx连接池配置（max 20）
- 查询优化：避免N+1查询

### Redis
- Pipeline批量操作
- 热点数据预加载
- 大key拆分

### API
- 响应压缩（gzip）
- HTTP/2支持
- CDN缓存静态资源

---

## 开发规范

### 代码组织
- 按功能模块分包
- 每个模块包含：handler、service、repository、model
- 业务逻辑在service层，不在handler层

### 接口设计
- RESTful风格
- 版本控制（/api/v1/）
- 统一响应格式
- 详细错误信息

### 数据库迁移
- 使用golang-migrate或 goose
- 迁移脚本命名：`YYYYMMDDHHMMSS_description.up.sql`

### Git提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档
- refactor: 重构
- test: 测试
- chore: 构建/工具

---

## 总结

本设计采用经典的分层架构，前后端分离，具有以下特点：

✅ **清晰的职责划分**：handler → service → repository → model
✅ **高扩展性**：模块化设计，新功能独立模块
✅ **性能优化**：Redis缓存、数据库索引、连接池
✅ **安全可靠**：JWT认证、限流、权限控制、输入验证
✅ **可维护性**：统一日志、错误处理、监控指标
✅ **未来友好**：预留投票、用户等级、全文检索等扩展点
