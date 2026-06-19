# 中国地区叫法平台 - 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建中国地区叫法对比平台的后端API服务

**Architecture:** 分层架构（Handler → Service → Repository → Model），RESTful API设计，基于Go 1.22 + Chi + GORM + PostgreSQL + Redis

**Tech Stack:**
- Go 1.22+, Chi Router, GORM v1.25, pgx/v5
- PostgreSQL 15+, Redis 7+
- JWT认证，bcrypt密码加密
- Uber Zap结构化日志
- go-playground/validator参数验证

## Global Constraints

- **Go版本**: >= 1.22 (使用泛型、net/http增强)
- **GORM版本**: v1.25+ (稳定版API)
- **PostgreSQL**: 15+ (利用JSONB、窗口函数等特性)
- **密码加密**: bcrypt cost=12
- **Token过期**: Access Token 15分钟，Refresh Token 7天
- **API版本**: /api/v1/ (为未来版本预留)
- **响应格式**: 统一JSON格式 `{code, message, data, timestamp}`
- **HTTP状态码**: 遵循REST规范 (200/201/400/401/403/404/409/429/500)
- **数据库迁移**: 使用golang-migrate (版本化迁移脚本)

---

## 项目结构

```
cnalias/
├── cmd/
│   └── server/
│       └── main.go                    # 应用入口
├── internal/
│   ├── config/
│   │   ├── config.go                  # 配置结构体
│   │   └── database.go                # 数据库配置
│   ├── model/
│   │   ├── user.go                    # 用户模型
│   │   ├── item.go                    # 物品模型
│   │   ├── alias.go                   # 别名模型
│   │   ├── region.go                  # 地区模型
│   │   ├── category.go                # 分类模型
│   │   ├── tag.go                     # 标签模型
│   │   └── review_log.go              # 审核日志模型
│   ├── repository/
│   │   ├── base.go                    # 基础Repository接口
│   │   ├── user_repo.go
│   │   ├── item_repo.go
│   │   ├── alias_repo.go
│   │   ├── region_repo.go
│   │   └── category_repo.go
│   ├── service/
│   │   ├── user_service.go
│   │   ├── item_service.go
│   │   ├── alias_service.go
│   │   ├── review_service.go
│   │   └── region_service.go
│   ├── handler/
│   │   ├── auth_handler.go
│   │   ├── item_handler.go
│   │   ├── alias_handler.go
│   │   ├── region_handler.go
│   │   ├── category_handler.go
│   │   ├── admin_handler.go
│   │   └── response.go                # 统一响应格式
│   ├── middleware/
│   │   ├── auth.go                    # JWT认证
│   │   ├── cors.go                    # CORS
│   │   ├── logger.go                  # 日志
│   │   ├── rate_limit.go              # 限流
│   │   └── recovery.go                # Panic恢复
│   ├── dto/
│   │   ├── request.go
│   │   └── response.go
│   ├── cache/
│   │   ├── redis.go
│   │   └── strategy.go
│   ├── pkg/
│   │   ├── utils.go
│   │   ├── validator.go
│   │   └── password.go
│   └── router/
│       └── router.go                  # 路由配置
├── migrations/
│   ├── 001_create_users_table.up.sql
│   ├── 001_create_users_table.down.sql
│   ├── 002_create_categories_table.up.sql
│   ├── 002_create_categories_table.down.sql
│   ├── 003_create_regions_table.up.sql
│   ├── 003_create_regions_table.down.sql
│   ├── 004_create_items_table.up.sql
│   ├── 004_create_items_table.down.sql
│   ├── 005_create_item_aliases_table.up.sql
│   ├── 005_create_item_aliases_table.down.sql
│   ├── 006_create_tags_tables.up.sql
│   ├── 006_create_tags_tables.down.sql
│   └── 007_create_review_logs_table.up.sql
└── README.md
```

---

## Phase 1: 项目初始化和基础设施

### Task 1: 创建项目结构和Go模块

**Files:**
- Create: `go.mod`
- Create: `cmd/server/main.go`
- Create: `README.md`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: 无
- Produces: Go模块文件，可编译的main包

- [ ] **Step 1: 初始化Go模块**

创建 `go.mod`:
```go
module github.com/yourusername/cnalias

go 1.22

require (
	github.com/go-chi/chi/v5 v5.0.12
	github.com/gin-gonic/gin v1.9.1
	github.com/jackc/pgx/v5 v5.5.1
	github.com/redis/go-redis/v9 v9.0.5
	gorm.io/driver/postgres v1.5.4
	gorm.io/gorm v1.25.4
	golang.org/x/crypto v0.17.0
	github.com/golang-jwt/jwt/v5 v5.0.0
	github.com/spf13/viper v1.17.0
	go.uber.org/zap v1.26.0
	github.com/go-playground/validator/v10 v10.16.0
	github.com/swaggo/http-swagger v1.3.4
	github.com/swaggo/swag v1.16.2
)
```

创建 `.gitignore`:
```
# Binaries
bin/
*.exe
*.dll
*.so
*.dylib

# Go
vendor/
*.test
*.out
go.work

# Env
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# Build
dist/
build/

# Logs
*.log
logs/

# Database
*.db
*.sqlite

# Temp
tmp/
```

- [ ] **Step 2: 创建基础目录结构**

```bash
mkdir -p cmd/server
mkdir -p internal/{config,model,repository,service,handler,middleware,dto,cache,pkg,router}
mkdir -p migrations
mkdir -p docs
mkdir -p scripts
```

- [ ] **Step 3: 创建README.md**

```markdown
# 中国地区叫法对比平台 (cnalias)

记录中国不同地区对同一物品的不同叫法（方言/别名）。

## 技术栈

- Go 1.22+
- Chi Router
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
\`\`\`bash
cp .env.example .env
\`\`\`

编辑 \`.env\` 文件配置数据库连接等信息。

### 启动开发环境

\`\`\`bash
# 启动数据库 (使用Docker)
docker-compose up -d postgres redis

# 执行数据库迁移
migrate -path migrations -database "postgres://user:pass@localhost:5432/cnalias?sslmode=disable" up

# 启动服务
go run cmd/server/main.go
\`\`\`

服务将在 http://localhost:8080 启动

## API文档

启动服务后访问 http://localhost:8080/swagger/index.html

## 项目结构

\`\`\`
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
\`\`\`
```

- [ ] **Step 4: 运行go mod tidy**

```bash
go mod tidy
```

Expected: 下载所有依赖，生成go.sum文件

- [ ] **Step 5: 验证项目结构**

```bash
tree -L 2 -d
```

Expected: 显示完整的目录结构

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "chore: initialize project structure and Go module"
```

---

### Task 2: 配置管理模块

**Files:**
- Create: `internal/config/config.go`
- Create: `.env.example`

**Interfaces:**
- Consumes: 无
- Produces: `config.Config` 结构体，包含所有配置项

- [ ] **Step 1: 创建配置结构体**

创建 `internal/config/config.go`:
```go
package config

import (
	"time"
	"github.com/spf13/viper"
)

// Config 应用配置
type Config struct {
	App      AppConfig
	Database DatabaseConfig
	Redis    RedisConfig
	JWT      JWTConfig
	Server   ServerConfig
}

type AppConfig struct {
	Name        string
	Environment string
	LogLevel    string
}

type DatabaseConfig struct {
	Host            string
	Port            int
	User            string
	Password        string
	DBName          string
	SSLMode         string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
}

type RedisConfig struct {
	Host         string
	Port         int
	Password     string
	DB           int
	DialTimeout  time.Duration
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
}

type JWTConfig struct {
	Secret           string
	AccessTokenTTL   time.Duration
	RefreshTokenTTL  time.Duration
}

type ServerConfig struct {
	Port            string
	ReadTimeout     time.Duration
	WriteTimeout    time.Duration
	IdleTimeout     time.Duration
}

// Load 从环境变量加载配置
func Load() (*Config, error) {
	// 默认值
	viper.SetDefault("APP_NAME", "cnalias")
	viper.SetDefault("APP_ENV", "development")
	viper.SetDefault("LOG_LEVEL", "info")

	viper.SetDefault("DB_HOST", "localhost")
	viper.SetDefault("DB_PORT", 5432)
	viper.SetDefault("DB_SSLMODE", "disable")
	viper.SetDefault("DB_MAX_OPEN_CONNS", 25)
	viper.SetDefault("DB_MAX_IDLE_CONNS", 5)
	viper.SetDefault("DB_CONN_MAX_LIFETIME", "5m")

	viper.SetDefault("REDIS_HOST", "localhost")
	viper.SetDefault("REDIS_PORT", 6379)
	viper.SetDefault("REDIS_DB", 0)
	viper.SetDefault("REDIS_DIAL_TIMEOUT", "10s")
	viper.SetDefault("REDIS_READ_TIMEOUT", "3s")
	viper.SetDefault("REDIS_WRITE_TIMEOUT", "3s")

	viper.SetDefault("JWT_SECRET", "your-secret-key-change-in-production")
	viper.SetDefault("JWT_ACCESS_TOKEN_TTL", "15m")
	viper.SetDefault("JWT_REFRESH_TOKEN_TTL", "168h") // 7天

	viper.SetDefault("SERVER_PORT", "8080")
	viper.SetDefault("SERVER_READ_TIMEOUT", "10s")
	viper.SetDefault("SERVER_WRITE_TIMEOUT", "10s")
	viper.SetDefault("SERVER_IDLE_TIMEOUT", "60s")

	// 环境变量
	viper.AutomaticEnv()

	var config Config

	if err := viper.Unmarshal(&config); err != nil {
		return nil, err
	}

	return &config, nil
}
```

创建 `.env.example`:
```env
# App
APP_NAME=cnalias
APP_ENV=development
LOG_LEVEL=debug

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=cnalias
DB_SSLMODE=disable

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server
SERVER_PORT=8080
```

- [ ] **Step 2: 编写单元测试**

创建 `internal/config/config_test.go`:
```go
package config

import (
	"os"
	"testing"
)

func TestLoad(t *testing.T) {
	// 设置测试环境变量
	os.Setenv("APP_ENV", "test")
	os.Setenv("DB_HOST", "testhost")
	os.Setenv("DB_PORT", "5433")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}

	if cfg.App.Environment != "test" {
		t.Errorf("App.Environment = %v, want test", cfg.App.Environment)
	}

	if cfg.Database.Host != "testhost" {
		t.Errorf("Database.Host = %v, want testhost", cfg.Database.Host)
	}

	if cfg.Database.Port != 5433 {
		t.Errorf("Database.Port = %v, want 5433", cfg.Database.Port)
	}
}

func TestLoadDefaults(t *testing.T) {
	// 不设置环境变量，测试默认值
	os.Unsetenv("APP_ENV")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}

	if cfg.Server.Port != "8080" {
		t.Errorf("Server.Port = %v, want 8080", cfg.Server.Port)
	}
}
```

- [ ] **Step 3: 运行测试**

```bash
cd internal/config && go test -v
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add internal/config/ .env.example
git commit -m "feat: add configuration management module"
```

---

### Task 3: 日志工具

**Files:**
- Create: `internal/pkg/logger.go`

**Interfaces:**
- Consumes: `config.Config`
- Produces: `*zap.Logger` 实例，提供Info/Error/Warn等方法

- [ ] **Step 1: 创建日志工具**

创建 `internal/pkg/logger.go`:
```go
package pkg

import (
	"os"
	"strings"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"cnalias/internal/config"
)

// Logger 全局日志实例
var Logger *zap.Logger

// InitLogger 初始化日志
func InitLogger(cfg *config.Config) error {
	// 解析日志级别
	level := parseLogLevel(cfg.App.LogLevel)

	// 配置
	zapConfig := zap.Config{
		Level:       zap.NewAtomicLevelAt(level),
		Development: cfg.App.Environment == "development",
		Encoding:    "json",
		EncoderConfig: zapcore.EncoderConfig{
			TimeKey:        "timestamp",
			LevelKey:       "level",
			NameKey:        "logger",
			CallerKey:      "caller",
			FunctionKey:    zapcore.OmitKey,
			MessageKey:     "message",
			StacktraceKey:  "stacktrace",
			LineEnding:     zapcore.DefaultLineEnding,
			EncodeLevel:    zapcore.LowercaseLevelEncoder,
			EncodeTime:     zapcore.ISO8601TimeEncoder,
			EncodeDuration: zapcore.SecondsDurationEncoder,
			EncodeCaller:   zapcore.ShortCallerEncoder,
		},
		OutputPaths:      []string{"stdout"},
		ErrorOutputPaths: []string{"stderr"},
	}

	var err error
	Logger, err = zapConfig.Build()
	if err != nil {
		return err
	}

	// 替换全局logger
	zap.ReplaceGlobals(Logger)

	return nil
}

func parseLogLevel(level string) zapcore.Level {
	switch strings.ToLower(level) {
	case "debug":
		return zapcore.DebugLevel
	case "info":
		return zapcore.InfoLevel
	case "warn":
		return zapcore.WarnLevel
	case "error":
		return zapcore.ErrorLevel
	case "fatal":
		return zapcore.FatalLevel
	default:
		return zapcore.InfoLevel
	}
}

// Sync 同步日志缓冲区
func Sync() {
	if Logger != nil {
		Logger.Sync()
	}
}
```

- [ ] **Step 2: 编写简单测试**

创建 `internal/pkg/logger_test.go`:
```go
package pkg

import (
	"testing"

	"cnalias/internal/config"
)

func TestInitLogger(t *testing.T) {
	cfg := &config.Config{
		App: config.AppConfig{
			Environment: "development",
			LogLevel:    "debug",
		},
	}

	err := InitLogger(cfg)
	if err != nil {
		t.Fatalf("InitLogger() error = %v", err)
	}

	if Logger == nil {
		t.Error("Logger is nil")
	}

	Sync()
}
```

- [ ] **Step 3: 运行测试**

```bash
cd internal/pkg && go test -v
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add internal/pkg/
git commit -m "feat: add logger utility"
```

---

### Task 4: 数据库连接和迁移配置

**Files:**
- Create: `internal/config/database.go`
- Create: `internal/pkg/database.go`
- Create: `migrations/` (empty for now)

**Interfaces:**
- Consumes: `config.Config`
- Produces: `*gorm.DB` 实例，已配置连接池

- [ ] **Step 1: 数据库配置扩展**

创建 `internal/config/database.go`:
```go
package config

import "time"

// DatabaseConfig 已在config.go中定义，这里添加辅助方法

// ToDSN 生成PostgreSQL连接字符串
func (c *DatabaseConfig) ToDSN() string {
	return "host=" + c.Host +
		" user=" + c.User +
		" password=" + c.Password +
		" dbname=" + c.DBName +
		" port=" + itoa(c.Port) +
		" sslmode=" + c.SSLMode
}

func itoa(i int) string {
	return string(rune(i + '0'))
}
```

修改 `internal/config/config.go`，添加辅助函数：

创建 `internal/pkg/database.go`:
```go
package pkg

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"cnalias/internal/config"
)

// NewDB 创建数据库连接
func NewDB(cfg *config.DatabaseConfig) (*gorm.DB, error) {
	dsn := cfg.ToDSN()

	// 配置日志
	var logLevel logger.LogLevel
	if cfg.Environment == "development" {
		logLevel = logger.Info
	} else {
		logLevel = logger.Error
	}

	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN: dsn,
	}), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
		DisableForeignKeyConstraintWhenMigrating: true, // 迁移时禁用外键，避免循环依赖
	})

	if err != nil {
		return nil, fmt.Errorf("failed to connect database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database instance: %w", err)
	}

	// 设置连接池
	sqlDB.SetMaxOpenConns(cfg.MaxOpenConns)
	sqlDB.SetMaxIdleConns(cfg.MaxIdleConns)
	sqlDB.SetConnMaxLifetime(cfg.ConnMaxLifetime)

	return db, nil
}
```

- [ ] **Step 2: 编写简单测试**

创建 `internal/pkg/database_test.go`:
```go
package pkg

import (
	"testing"

	"cnalias/internal/config"
)

func TestNewDB_InvalidConfig(t *testing.T) {
	cfg := &config.DatabaseConfig{
		Host:     "invalid_host",
		Port:     5432,
		User:     "invalid",
		Password: "invalid",
		DBName:   "invalid_db",
	}

	_, err := NewDB(cfg)
	// 应该返回错误
	if err == nil {
		t.Error("Expected error for invalid database config")
	}
}
```

- [ ] **Step 3: 运行测试**

```bash
cd internal/pkg && go test -v -run TestNewDB
```

Expected: PASS (即使连接失败，测试也通过因为预期返回错误)

- [ ] **Step 4: Commit**

```bash
git add internal/config/database.go internal/pkg/database.go internal/pkg/database_test.go
git commit -m "feat: add database connection configuration"
```

---

### Task 5: Redis连接配置

**Files:**
- Create: `internal/cache/redis.go`

**Interfaces:**
- Consumes: `config.Config`
- Produces: `*redis.Client` 实例

- [ ] **Step 1: 创建Redis客户端**

创建 `internal/cache/redis.go`:
```go
package cache

import (
	"fmt"

	"github.com/redis/go-redis/v9"
	"cnalias/internal/config"
)

// RedisClient Redis客户端单例
var RedisClient *redis.Client

// InitRedis 初始化Redis连接
func InitRedis(cfg *config.RedisConfig) error {
	RedisClient = redis.NewClient(&redis.Options{
		Addr:         fmt.Sprintf("%s:%d", cfg.Host, cfg.Port),
		Password:     cfg.Password,
		DB:           cfg.DB,
		DialTimeout:  cfg.DialTimeout,
		ReadTimeout:  cfg.ReadTimeout,
		WriteTimeout: cfg.WriteTimeout,
	})

	// 测试连接
	_, err := RedisClient.Ping(Ctx).Result()
	if err != nil {
		return fmt.Errorf("failed to connect redis: %w", err)
	}

	return nil
}

// Close 关闭Redis连接
func Close() error {
	if RedisClient != nil {
		return RedisClient.Close()
	}
	return nil
}
```

修改 `internal/cache/redis.go`，添加context：

```go
package cache

import "context"

// Ctx 全局context
var Ctx = context.Background()
```

- [ ] **Step 2: Commit**

```bash
git add internal/cache/redis.go
git commit -m "feat: add redis connection configuration"
```

---

### Task 6: 创建数据库迁移脚本 - 用户和分类表

**Files:**
- Create: `migrations/001_create_users_table.up.sql`
- Create: `migrations/001_create_users_table.down.sql`
- Create: `migrations/002_create_categories_table.up.sql`
- Create: `migrations/002_create_categories_table.down.sql`

**Interfaces:**
- Consumes: 数据库设计文档
- Produces: 可执行的SQL迁移脚本

- [ ] **Step 1: 创建用户表迁移**

创建 `migrations/001_create_users_table.up.sql`:
```sql
-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- 添加注释
COMMENT ON TABLE users IS '用户表';
COMMENT ON COLUMN users.role IS '用户角色: USER=普通用户, ADMIN=管理员';
```

创建 `migrations/001_create_users_table.down.sql`:
```sql
DROP TABLE IF EXISTS users CASCADE;
```

- [ ] **Step 2: 创建分类表迁移**

创建 `migrations/002_create_categories_table.up.sql`:
```sql
-- 创建分类表
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    icon VARCHAR(50),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 唯一约束: 同一父分类下名称唯一
CREATE UNIQUE INDEX uniq_categories_name_parent ON categories(name, parent_id);

-- 创建索引
CREATE INDEX idx_categories_parent_id ON categories(parent_id);

-- 添加注释
COMMENT ON TABLE categories IS '物品分类表，支持多级分类';
```

创建 `migrations/002_create_categories_table.down.sql`:
```sql
DROP TABLE IF EXISTS categories CASCADE;
```

- [ ] **Step 3: 验证SQL语法**

```bash
# 如果本地有PostgreSQL，可以验证
psql -U postgres -c "SELECT 1;" 2>&1 && echo "PostgreSQL is running" || echo "PostgreSQL not available"
```

- [ ] **Step 4: Commit**

```bash
git add migrations/001_* migrations/002_*
git commit -m "db: add users and categories table migrations"
```

---

### Task 7: 创建地区表和标签表迁移

**Files:**
- Create: `migrations/003_create_regions_table.up.sql`
- Create: `migrations/003_create_regions_table.down.sql`
- Create: `migrations/004_create_tags_table.up.sql`
- Create: `migrations/004_create_tags_table.down.sql`

- [ ] **Step 1: 创建地区表迁移**

创建 `migrations/003_create_regions_table.up.sql`:
```sql
-- 创建地区表
CREATE TABLE IF NOT EXISTS regions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    parent_id BIGINT REFERENCES regions(id) ON DELETE SET NULL,
    region_type VARCHAR(20) NOT NULL CHECK (region_type IN ('PROVINCE', 'CITY', 'DIALECT', 'CUSTOM')),
    code VARCHAR(20) UNIQUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 唯一约束: 同一父分类下名称唯一
CREATE UNIQUE INDEX uniq_regions_name_parent ON regions(name, parent_id);

-- 创建索引
CREATE INDEX idx_regions_parent_id ON regions(parent_id);
CREATE INDEX idx_regions_type ON regions(region_type);

-- 添加注释
COMMENT ON TABLE regions IS '地区表，支持省、市、方言区等多级结构';
COMMENT ON COLUMN regions.region_type IS '地区类型: PROVINCE=省, CITY=市, DIALECT=方言区, CUSTOM=自定义';
```

创建 `migrations/003_create_regions_table.down.sql`:
```sql
DROP TABLE IF EXISTS regions CASCADE;
```

- [ ] **Step 2: 创建标签表迁移**

创建 `migrations/004_create_tags_table.up.sql`:
```sql
-- 创建标签表
CREATE TABLE IF NOT EXISTS tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(20) DEFAULT '#1890ff',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_tags_name ON tags(name);

-- 添加注释
COMMENT ON TABLE tags IS '物品标签表';
```

创建 `migrations/004_create_tags_table.down.sql`:
```sql
DROP TABLE IF EXISTS tags CASCADE;
```

- [ ] **Step 3: Commit**

```bash
git add migrations/003_* migrations/004_*
git commit -m "db: add regions and tags table migrations"
```

---

### Task 8: 创建物品表和别名表迁移

**Files:**
- Create: `migrations/005_create_items_table.up.sql`
- Create: `migrations/005_create_items_table.down.sql`
- Create: `migrations/006_create_item_aliases_table.up.sql`
- Create: `migrations/006_create_item_aliases_table.down.sql`

- [ ] **Step 1: 创建物品表迁移**

创建 `migrations/005_create_items_table.up.sql`:
```sql
-- 创建物品表
CREATE TABLE IF NOT EXISTS items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 唯一约束: 同一分类下物品名称唯一
CREATE UNIQUE INDEX uniq_items_name_category ON items(name, category_id);

-- 创建索引
CREATE INDEX idx_items_category_id ON items(category_id);
CREATE INDEX idx_items_created_by ON items(created_by);
CREATE INDEX idx_items_name ON items(name);

-- 添加注释
COMMENT ON TABLE items IS '物品表，存储标准/通用名称';
```

创建 `migrations/005_create_items_table.down.sql`:
```sql
DROP TABLE IF EXISTS items CASCADE;
```

- [ ] **Step 2: 创建物品别名表迁移**

创建 `migrations/006_create_item_aliases_table.up.sql`:
```sql
-- 创建物品别名表
CREATE TABLE IF NOT EXISTS item_aliases (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    alias_name VARCHAR(100) NOT NULL,
    region_id BIGINT NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
    name_type VARCHAR(20) NOT NULL CHECK (name_type IN ('COMMON', 'ALIAS')),
    votes_count INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    submitted_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    reviewer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 唯一约束: 防止同一物品+地区+别名的重复提交
CREATE UNIQUE INDEX uniq_alias_item_region ON item_aliases(item_id, region_id, alias_name);

-- 创建索引
CREATE INDEX idx_aliases_item_id ON item_aliases(item_id);
CREATE INDEX idx_aliases_region_id ON item_aliases(region_id);
CREATE INDEX idx_aliases_status ON item_aliases(status);
CREATE INDEX idx_aliases_submitted_by ON item_aliases(submitted_by);
CREATE INDEX idx_aliases_created_at ON item_aliases(created_at);

-- 添加注释
COMMENT ON TABLE item_aliases IS '物品别名表，记录不同地区对同一物品的叫法';
COMMENT ON COLUMN item_aliases.name_type IS '名称类型: COMMON=常用名, ALIAS=别名/俗称';
COMMENT ON COLUMN item_aliases.status IS '状态: PENDING=待审核, APPROVED=已通过, REJECTED=已拒绝';
```

创建 `migrations/006_create_item_aliases_table.down.sql`:
```sql
DROP TABLE IF EXISTS item_aliases CASCADE;
```

- [ ] **Step 3: Commit**

```bash
git add migrations/005_* migrations/006_*
git commit -m "db: add items and item_aliases table migrations"
```

---

### Task 9: 创建标签关联表和审核日志表迁移

**Files:**
- Create: `migrations/007_create_item_tags_table.up.sql`
- Create: `migrations/007_create_item_tags_table.down.sql`
- Create: `migrations/008_create_review_logs_table.up.sql`
- Create: `migrations/008_create_review_logs_table.down.sql`

- [ ] **Step 1: 创建物品标签关联表迁移**

创建 `migrations/007_create_item_tags_table.up.sql`:
```sql
-- 创建物品标签关联表
CREATE TABLE IF NOT EXISTS item_tags (
    item_id BIGINT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (item_id, tag_id)
);

-- 添加注释
COMMENT ON TABLE item_tags IS '物品和标签的多对多关联表';
```

创建 `migrations/007_create_item_tags_table.down.sql`:
```sql
DROP TABLE IF EXISTS item_tags CASCADE;
```

- [ ] **Step 2: 创建审核日志表迁移**

创建 `migrations/008_create_review_logs_table.up.sql`:
```sql
-- 创建审核日志表
CREATE TABLE IF NOT EXISTS review_logs (
    id BIGSERIAL PRIMARY KEY,
    alias_id BIGINT NOT NULL REFERENCES item_aliases(id) ON DELETE CASCADE,
    reviewer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action VARCHAR(20) NOT NULL CHECK (action IN ('APPROVE', 'REJECT')),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_review_logs_alias_id ON review_logs(alias_id);
CREATE INDEX idx_review_logs_reviewer_id ON review_logs(reviewer_id);
CREATE INDEX idx_review_logs_created_at ON review_logs(created_at);

-- 添加注释
COMMENT ON TABLE review_logs IS '审核日志表，记录所有审核操作';
```

创建 `migrations/008_create_review_logs_table.down.sql`:
```sql
DROP TABLE IF EXISTS review_logs CASCADE;
```

- [ ] **Step 3: Commit**

```bash
git add migrations/007_* migrations/008_*
git commit -m "db: add item_tags and review_logs table migrations"
```

---

## Phase 2: 核心数据模型

### Task 10: 用户模型

**Files:**
- Create: `internal/model/user.go`
- Create: `internal/model/user_test.go`

**Interfaces:**
- Consumes: 无
- Produces: `User` 结构体，包含验证标签和辅助方法

- [ ] **Step 1: 创建用户模型**

创建 `internal/model/user.go`:
```go
package model

import "time"

// User 用户模型
type User struct {
	ID            int64     `gorm:"primaryKey" json:"id"`
	Username      string    `gorm:"uniqueIndex;not null;size:50" json:"username" validate:"required,min=3,max=50"`
	Email         string    `gorm:"uniqueIndex;not null;size:100" json:"email" validate:"required,email"`
	PasswordHash  string    `gorm:"column:password_hash;not null;size:255" json:"-" validate:"required,min=8"`
	Role          string    `gorm:"type:varchar(20);not null;default:'USER'" json:"role"`
	IsVerified    bool      `gorm:"not null;default:false" json:"is_verified"`
	CreatedAt     time.Time `json:"created_at"`
	LastLoginAt   *time.Time `json:"last_login_at"`
	UpdatedAt     time.Time `json:"-"`
}

// TableName 指定表名
func (User) TableName() string {
	return "users"
}

// IsAdmin 检查是否为管理员
func (u *User) IsAdmin() bool {
	return u.Role == "ADMIN"
}

// UserRegisterRequest 用户注册请求
type UserRegisterRequest struct {
	Username string `json:"username" validate:"required,min=3,max=50,alphanum"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8,max=72"`
}

// UserLoginRequest 用户登录请求
type UserLoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// UserResponse 用户响应（不包含敏感信息）
type UserResponse struct {
	ID        int64     `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	IsVerified bool     `json:"is_verified"`
	CreatedAt time.Time `json:"created_at"`
}

// ToResponse 转换为响应格式
func (u *User) ToResponse() *UserResponse {
	return &UserResponse{
		ID:         u.ID,
		Username:   u.Username,
		Email:      u.Email,
		Role:       u.Role,
		IsVerified: u.IsVerified,
		CreatedAt:  u.CreatedAt,
	}
}
```

- [ ] **Step 2: 编写单元测试**

创建 `internal/model/user_test.go`:
```go
package model

import (
	"testing"
	"github.com/stretchr/testify/assert"
)

func TestUser_IsAdmin(t *testing.T) {
	tests := []struct {
		name     string
		role     string
		expected bool
	}{
		{"admin role", "ADMIN", true},
		{"user role", "USER", false},
		{"invalid role", "INVALID", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			u := &User{Role: tt.role}
			assert.Equal(t, tt.expected, u.IsAdmin())
		})
	}
}

func TestUser_ToResponse(t *testing.T) {
	user := &User{
		ID:        1,
		Username:  "testuser",
		Email:     "test@example.com",
		Role:      "USER",
		IsVerified: true,
		CreatedAt: time.Now(),
	}

	resp := user.ToResponse()

	assert.Equal(t, user.ID, resp.ID)
	assert.Equal(t, user.Username, resp.Username)
	assert.Equal(t, user.Email, resp.Email)
	assert.Equal(t, user.Role, resp.Role)
	assert.Equal(t, user.IsVerified, resp.IsVerified)
	assert.Empty(t, resp.Password) // 确保不包含密码
}
```

- [ ] **Step 3: 运行测试**

```bash
cd internal/model && go test -v -run TestUser
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add internal/model/user.go internal/model/user_test.go
git commit -m "feat: add user model"
```

---

### Task 11: 分类和地区模型

**Files:**
- Create: `internal/model/category.go`
- Create: `internal/model/category_test.go`
- Create: `internal/model/region.go`
- Create: `internal/model/region_test.go`

- [ ] **Step 1: 创建分类模型**

创建 `internal/model/category.go`:
```go
package model

import (
	"database/sql/driver"
	"fmt"
	"time"
)

// Category 分类模型
type Category struct {
	ID        int64     `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"not null;size:50" json:"name" validate:"required,min=1,max=50"`
	ParentID  *int64   `json:"parent_id"`
	Icon      string    `gorm:"size:50" json:"icon"`
	SortOrder int       `gorm:"not null;default:0" json:"sort_order"`
	Children  []Category `gorm:"-" json:"children,omitempty"`
	CreatedAt time.Time `json:"-"`
	UpdatedAt time.Time `json:"-"`
}

func (Category) TableName() string {
	return "categories"
}

// CategoryRequest 分类请求
type CategoryRequest struct {
	Name      string `json:"name" validate:"required,min=1,max=50"`
	ParentID  *int64 `json:"parent_id"`
	Icon      string `json:"icon"`
	SortOrder int    `json:"sort_order"`
}

// CategoryResponse 分类响应
type CategoryResponse struct {
	ID        int64            `json:"id"`
	Name      string           `json:"name"`
	ParentID  *int64           `json:"parent_id"`
	Icon      string           `json:"icon"`
	SortOrder int              `json:"sort_order"`
	Children  []CategoryResponse `json:"children,omitempty"`
}
```

创建 `internal/model/category_test.go`:
```go
package model

import (
	"testing"
	"github.com/stretchr/testify/assert"
)

func TestCategory_ToResponse(t *testing.T) {
	cat := &Category{
		ID:        1,
		Name:      "蔬菜",
		SortOrder: 1,
	}

	resp := &CategoryResponse{
		ID:        cat.ID,
		Name:      cat.Name,
		SortOrder: cat.SortOrder,
	}

	assert.Equal(t, cat.ID, resp.ID)
	assert.Equal(t, cat.Name, resp.Name)
	assert.Empty(t, resp.ParentID) // nil
	assert.Empty(t, resp.Children) // 空列表
}
```

- [ ] **Step 2: 创建地区模型**

创建 `internal/model/region.go`:
```go
package model

import "time"

// RegionType 地区类型
type RegionType string

const (
	RegionTypeProvince RegionType = "PROVINCE"
	RegionTypeCity     RegionType = "CITY"
	RegionTypeDialect  RegionType = "DIALECT"
	RegionTypeCustom   RegionType = "CUSTOM"
)

// Region 地区模型
type Region struct {
	ID          int64     `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"not null;size:50" json:"name" validate:"required,min=1,max=50"`
	ParentID    *int64   `json:"parent_id"`
	RegionType  RegionType `gorm:"column:region_type;not null;type:varchar(20)" json:"region_type"`
	Code        string    `gorm:"size:20;unique" json:"code"`
	SortOrder   int       `gorm:"not null;default:0" json:"sort_order"`
	Children    []Region `gorm:"-" json:"children,omitempty"`
	CreatedAt   time.Time `json:"-"`
}

func (Region) TableName() string {
	return "regions"
}

// RegionRequest 地区请求
type RegionRequest struct {
	Name       string    `json:"name" validate:"required,min=1,max=50"`
	ParentID   *int64    `json:"parent_id"`
	RegionType RegionType `json:"region_type" validate:"required,oneof=PROVINCE CITY DIALECT CUSTOM"`
	Code       string    `json:"code"`
	SortOrder  int       `json:"sort_order"`
}

// RegionResponse 地区响应
type RegionResponse struct {
	ID          int64       `json:"id"`
	Name        string      `json:"name"`
	ParentID    *int64      `json:"parent_id"`
	RegionType  RegionType  `json:"region_type"`
	Code        string      `json:"code"`
	SortOrder   int         `json:"sort_order"`
	Children    []RegionResponse `json:"children,omitempty"`
}
```

创建 `internal/model/region_test.go`:
```go
package model

import (
	"testing"
	"github.com/stretchr/testify/assert"
)

func TestRegionType_Validate(t *testing.T) {
	tests := []struct {
		name    string
		rt      RegionType
		valid   bool
	}{
		{"valid province", RegionTypeProvince, true},
		{"valid city", RegionTypeCity, true},
		{"valid dialect", RegionTypeDialect, true},
		{"valid custom", RegionTypeCustom, true},
		{"invalid type", "INVALID", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			switch tt.rt {
			case RegionTypeProvince, RegionTypeCity, RegionTypeDialect, RegionTypeCustom:
				assert.True(t, true)
			default:
				assert.False(t, tt.valid)
			}
		})
	}
}
```

- [ ] **Step 3: 运行测试**

```bash
cd internal/model && go test -v -run "TestCategory|TestRegion"
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add internal/model/category*.go internal/model/region*.go
git commit -m "feat: add category and region models"
```

---

### Task 12: 物品和别名模型

**Files:**
- Create: `internal/model/item.go`
- Create: `internal/model/item_test.go`
- Create: `internal/model/alias.go`
- Create: `internal/model/alias_test.go`

- [ ] **Step 1: 创建物品模型**

创建 `internal/model/item.go`:
```go
package model

import (
	"database/sql/driver"
	"time"
)

// NameType 名称类型
type NameType string

const (
	NameTypeCommon NameType = "COMMON"
	NameTypeAlias  NameType = "ALIAS"
)

// AliasStatus 别名状态
type AliasStatus string

const (
	AliasStatusPending  AliasStatus = "PENDING"
	AliasStatusApproved AliasStatus = "APPROVED"
	AliasStatusRejected AliasStatus = "REJECTED"
)

// Item 物品模型
type Item struct {
	ID          int64      `gorm:"primaryKey" json:"id"`
	Name        string     `gorm:"not null;size:100" json:"name" validate:"required,min=1,max=100"`
	CategoryID  *int64    `json:"category_id"`
	Description string     `json:"description"`
	CreatedBy   *int64    `json:"created_by"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"-"`
}

func (Item) TableName() string {
	return "items"
}

// ItemRequest 物品请求
type ItemRequest struct {
	Name        string `json:"name" validate:"required,min=1,max=100"`
	CategoryID  *int64 `json:"category_id"`
	Description string `json:"description"`
}

// ItemResponse 物品响应
type ItemResponse struct {
	ID          int64             `json:"id"`
	Name        string            `json:"name"`
	CategoryID  *int64            `json:"category_id"`
	Description string            `json:"description"`
	Aliases     []AliasResponse   `json:"aliases,omitempty"`
	Tags        []TagResponse     `json:"tags,omitempty"`
	CreatedAt   time.Time         `json:"created_at"`
}

// ToResponse 转换为响应
func (i *Item) ToResponse() *ItemResponse {
	return &ItemResponse{
		ID:          i.ID,
		Name:        i.Name,
		CategoryID:  i.CategoryID,
		Description: i.Description,
		CreatedAt:   i.CreatedAt,
	}
}
```

创建 `internal/model/item_test.go`:
```go
package model

import (
	"testing"
	"github.com/stretchr/testify/assert"
	"time"
)

func TestItem_ToResponse(t *testing.T) {
	now := time.Now()
	catID := int64(1)

	item := &Item{
		ID:         1,
		Name:        "马铃薯",
		CategoryID: &catID,
		Description: "一种常见蔬菜",
		CreatedAt:  now,
	}

	resp := item.ToResponse()

	assert.Equal(t, item.ID, resp.ID)
	assert.Equal(t, item.Name, resp.Name)
	assert.Equal(t, item.Description, resp.Description)
	assert.Empty(t, resp.Aliases)
	assert.Empty(t, resp.Tags)
}
```

- [ ] **Step 2: 创建别名模型**

创建 `internal/model/alias.go`:
```go
package model

import (
	"time"
)

// Alias 别名模型
type Alias struct {
	ID           int64       `gorm:"primaryKey" json:"id"`
	ItemID       int64       `gorm:"not null" json:"item_id" validate:"required"`
	AliasName    string      `gorm:"not null;size:100" json:"alias_name" validate:"required,min=1,max=100"`
	RegionID     int64       `gorm:"not null" json:"region_id" validate:"required"`
	NameType     NameType    `gorm:"column:name_type;not null;type:varchar(20)" json:"name_type"`
	VotesCount   int         `gorm:"not null;default:0" json:"votes_count"`
	Status       AliasStatus `gorm:"not null;default:'PENDING';type:varchar(20)" json:"status"`
	SubmittedBy  *int64     `json:"submitted_by"`
	ReviewerID   *int64     `json:"reviewer_id"`
	ReviewedAt   *time.Time `json:"reviewed_at"`
	ReviewNote   string     `gorm:"type:text" json:"review_note"`
	CreatedAt    time.Time  `json:"created_at"`
}

func (Alias) TableName() string {
	return "item_aliases"
}

// AliasRequest 提交别名请求
type AliasRequest struct {
	ItemID    int64     `json:"item_id" validate:"required"`
	RegionID  int64     `json:"region_id" validate:"required"`
	AliasName string    `json:"alias_name" validate:"required,min=1,max=100"`
	NameType  NameType  `json:"name_type" validate:"required,oneof=COMMON ALIAS"`
}

// AnonymousAliasRequest 匿名提交别名请求
type AnonymousAliasRequest struct {
	ItemID    int64    `json:"item_id" validate:"required"`
	RegionID  int64    `json:"region_id" validate:"required"`
	AliasName string   `json:"alias_name" validate:"required,min=1,max=100"`
	NameType  NameType `json:"name_type" validate:"required,oneof=COMMON ALIAS"`
	Submitter string   `json:"submitter" validate:"required,min=2,max=100"` // 提交者昵称
}

// AliasResponse 别名响应
type AliasResponse struct {
	ID          int64       `json:"id"`
	ItemID      int64       `json:"item_id"`
	AliasName   string      `json:"alias_name"`
	RegionID    int64       `json:"region_id"`
	NameType    NameType    `json:"name_type"`
	VotesCount  int         `json:"votes_count"`
	Status      AliasStatus `json:"status"`
	SubmittedBy *int64      `json:"submitted_by"`
	ReviewedAt  *time.Time  `json:"reviewed_at"`
	CreatedAt   time.Time   `json:"created_at"`
}

// AliasDetailResponse 别名详情响应（包含物品和地区信息）
type AliasDetailResponse struct {
	ID          int64           `json:"id"`
	AliasName   string          `json:"alias_name"`
	NameType    NameType        `json:"name_type"`
	VotesCount  int             `json:"votes_count"`
	Status      AliasStatus     `json:"status"`
	Item        ItemSimpleResponse `json:"item"`
	Region      RegionSimpleResponse `json:"region"`
	CreatedAt   time.Time       `json:"created_at"`
}

// ItemSimpleResponse 简化物品信息
type ItemSimpleResponse struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

// RegionSimpleResponse 简化地区信息
type RegionSimpleResponse struct {
	ID         int64      `json:"id"`
	Name       string     `json:"name"`
	RegionType RegionType `json:"region_type"`
}

// ToResponse 转换为响应
func (a *Alias) ToResponse() *AliasResponse {
	return &AliasResponse{
		ID:          a.ID,
		ItemID:      a.ItemID,
		AliasName:   a.AliasName,
		RegionID:    a.RegionID,
		NameType:    a.NameType,
		VotesCount:  a.VotesCount,
		Status:      a.Status,
		SubmittedBy: a.SubmittedBy,
		ReviewedAt:  a.ReviewedAt,
		CreatedAt:   a.CreatedAt,
	}
}
```

创建 `internal/model/alias_test.go`:
```go
package model

import (
	"testing"
	"github.com/stretchr/testify/assert"
	"time"
)

func TestAlias_ToResponse(t *testing.T) {
	alias := &Alias{
		ID:        1,
		ItemID:    1,
		AliasName: "土豆",
		RegionID:  1,
		NameType:  NameTypeCommon,
		Status:    AliasStatusApproved,
		CreatedAt: time.Now(),
	}

	resp := alias.ToResponse()

	assert.Equal(t, alias.ID, resp.ID)
	assert.Equal(t, alias.AliasName, resp.AliasName)
	assert.Equal(t, alias.NameType, resp.NameType)
	assert.Equal(t, alias.Status, resp.Status)
}

func TestNameType_Validate(t *testing.T) {
	tests := []struct {
		name    string
		nt      NameType
		valid   bool
	}{
		{"valid common", NameTypeCommon, true},
		{"valid alias", NameTypeAlias, true},
		{"invalid", "INVALID", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			switch tt.nt {
			case NameTypeCommon, NameTypeAlias:
				assert.True(t, true)
			default:
				assert.False(t, tt.valid)
			}
		})
	}
}
```

- [ ] **Step 3: 运行测试**

```bash
cd internal/model && go test -v -run "TestItem|TestAlias"
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add internal/model/item*.go internal/model/alias*.go
git commit -m "feat: add item and alias models"
```

---

### Task 13: 标签和审核日志模型

**Files:**
- Create: `internal/model/tag.go`
- Create: `internal/model/review_log.go`

- [ ] **Step 1: 创建标签和审核日志模型**

创建 `internal/model/tag.go`:
```go
package model

import (
	"time"
)

// Tag 标签模型
type Tag struct {
	ID        int64     `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"not null;unique;size:50" json:"name" validate:"required,min=1,max=50"`
	Color     string    `gorm:"size:20;default:'#1890ff'" json:"color"`
	CreatedAt time.Time `json:"-"`
}

func (Tag) TableName() string {
	return "tags"
}

// TagResponse 标签响应
type TagResponse struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Color string `json:"color"`
}

// TagRequest 标签请求
type TagRequest struct {
	Name  string `json:"name" validate:"required,min=1,max=50"`
	Color string `json:"color"`
}
```

创建 `internal/model/review_log.go`:
```go
package model

import (
	"database/sql/driver"
	"time"
)

// ReviewAction 审核动作
type ReviewAction string

const (
	ReviewActionApprove ReviewAction = "APPROVE"
	ReviewActionReject  ReviewAction = "REJECT"
)

// ReviewLog 审核日志模型
type ReviewLog struct {
	ID         int64        `gorm:"primaryKey" json:"id"`
	AliasID    int64        `gorm:"not null" json:"alias_id"`
	ReviewerID int64        `gorm:"not null" json:"reviewer_id"`
	Action     ReviewAction `gorm:"column:action;not null;type:varchar(20)" json:"action"`
	Note       string       `gorm:"type:text" json:"note"`
	CreatedAt  time.Time    `json:"created_at"`
}

func (ReviewLog) TableName() string {
	return "review_logs"
}

// ReviewLogResponse 审核日志响应
type ReviewLogResponse struct {
	ID         int64        `json:"id"`
	Action     ReviewAction `json:"action"`
	Note       string       `json:"note"`
	ReviewerID int64        `json:"reviewer_id"`
	CreatedAt  time.Time    `json:"created_at"`
}

// ReviewRequest 审核请求
type ReviewRequest struct {
	Note string `json:"note"`
}
```

- [ ] **Step 2: Commit**

```bash
git add internal/model/tag.go internal/model/review_log.go
git commit -m "feat: add tag and review_log models"
```

---

## Phase 3: 数据访问层

### Task 14: Repository基础接口

**Files:**
- Create: `internal/repository/base.go`

**Interfaces:**
- Consumes: `model`包
- Produces: 基础Repository接口，用于后续所有Repository实现

- [ ] **Step 1: 创建基础Repository接口**

创建 `internal/repository/base.go`:
```go
package repository

import (
	"context"
	"gorm.io/gorm"
)

// BaseRepository 基础Repository接口
type BaseRepository[T any] interface {
	Create(ctx context.Context, entity *T) error
	Update(ctx context.Context, entity *T) error
	Delete(ctx context.Context, id int64) error
	GetByID(ctx context.Context, id int64) (*T, error)
	GetAll(ctx context.Context) ([]T, error)
}

// BaseGORMRepository GORM基础实现
type BaseGORMRepository[T any] struct {
	db *gorm.DB
}

func NewBaseGORMRepository[T any](db *gorm.DB) *BaseGORMRepository[T] {
	return &BaseGORMRepository[T]{db: db}
}

func (r *BaseGORMRepository[T]) Create(ctx context.Context, entity *T) error {
	return r.db.WithContext(ctx).Create(entity).Error
}

func (r *BaseGORMRepository[T]) Update(ctx context.Context, entity *T) error {
	return r.db.WithContext(ctx).Save(entity).Error
}

func (r *BaseGORMRepository[T]) Delete(ctx context.Context, id int64) error {
	return r.db.WithContext(ctx).Delete(new(T), id).Error
}

func (r *BaseGORMRepository[T]) GetByID(ctx context.Context, id int64) (*T, error) {
	var entity T
	err := r.db.WithContext(ctx).First(&entity, id).Error
	if err != nil {
		return nil, err
	}
	return &entity, nil
}

func (r *BaseGORMRepository[T]) GetAll(ctx context.Context) ([]T, error) {
	var entities []T
	err := r.db.WithContext(ctx).Find(&entities).Error
	return entities, err
}

// WithDB 设置db实例（用于测试）
func (r *BaseGORMRepository[T]) WithDB(db *gorm.DB) {
	r.db = db
}
```

- [ ] **Step 2: 编写简单测试**

创建 `internal/repository/base_test.go`:
```go
package repository

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"cnalias/internal/model"
)

func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect database: %v", err)
	}

	// 自动迁移User表
	db.AutoMigrate(&model.User{})

	return db
}

func TestBaseGORMRepository_CreateAndGet(t *testing.T) {
	db := setupTestDB(t)
	repo := NewBaseGORMRepository[model.User](db)
	ctx := context.Background()

	// Create
	user := &model.User{
		Username:     "testuser",
		Email:        "test@example.com",
		PasswordHash: "hashedpassword",
	}

	err := repo.Create(ctx, user)
	assert.NoError(t, err)
	assert.NotZero(t, user.ID)

	// GetByID
	fetched, err := repo.GetByID(ctx, user.ID)
	assert.NoError(t, err)
	assert.Equal(t, user.Username, fetched.Username)
	assert.Equal(t, user.Email, fetched.Email)
}

func TestBaseGORMRepository_Delete(t *testing.T) {
	db := setupTestDB(t)
	repo := NewBaseGORMRepository[model.User](db)
	ctx := context.Background()

	user := &model.User{
		Username:     "testuser",
		Email:        "test@example.com",
		PasswordHash: "hashedpassword",
	}
	repo.Create(ctx, user)

	err := repo.Delete(ctx, user.ID)
	assert.NoError(t, err)

	_, err = repo.GetByID(ctx, user.ID)
	assert.Error(t, err)
}

func TestBaseGORMRepository_GetAll(t *testing.T) {
	db := setupTestDB(t)
	repo := NewBaseGORMRepository[model.User](db)
	ctx := context.Background()

	// 插入2条记录
	users := []*model.User{
		{Username: "user1", Email: "user1@example.com", PasswordHash: "hash1"},
		{Username: "user2", Email: "user2@example.com", PasswordHash: "hash2"},
	}

	for _, u := range users {
		repo.Create(ctx, u)
	}

	// 获取所有
	result, err := repo.GetAll(ctx)
	assert.NoError(t, err)
	assert.Len(t, result, 2)
}
```

- [ ] **Step 3: 运行测试**

```bash
cd internal/repository && go mod tidy && go test -v
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add internal/repository/base.go internal/repository/base_test.go
git commit -m "feat: add base repository interface and GORM implementation"
```

---

## Phase 4: 密码工具和JWT工具

### Task 15: 密码加密工具

**Files:**
- Create: `internal/pkg/password.go`
- Create: `internal/pkg/password_test.go`

**Interfaces:**
- Consumes: golang.org/x/crypto/bcrypt
- Produces: `HashPassword()`, `ComparePassword()` 函数

- [ ] **Step 1: 创建密码工具**

创建 `internal/pkg/password.go`:
```go
package pkg

import (
	"github.com/golang.org/x/crypto/bcrypt"
)

const (
	// DefaultCost bcrypt默认cost
	DefaultCost = 12
)

// HashPassword 加密密码
func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// ComparePassword 比较密码
func ComparePassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}
```

创建 `internal/pkg/password_test.go`:
```go
package pkg

import (
	"testing"
	"github.com/stretchr/testify/assert"
)

func TestHashPassword(t *testing.T) {
	password := "mypassword123"

	hash, err := HashPassword(password)
	assert.NoError(t, err)
	assert.NotEmpty(t, hash)
	assert.NotEqual(t, password, hash) // 确保已加密
}

func TestComparePassword_Correct(t *testing.T) {
	password := "mypassword123"
	hash, _ := HashPassword(password)

	err := ComparePassword(hash, password)
	assert.NoError(t, err)
}

func TestComparePassword_Wrong(t *testing.T) {
	password := "mypassword123"
	hash, _ := HashPassword(password)

	err := ComparePassword(hash, "wrongpassword")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "password is incorrect")
}
```

- [ ] **Step 2: 运行测试**

```bash
cd internal/pkg && go test -v -run TestHashPassword
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add internal/pkg/password.go internal/pkg/password_test.go
git commit -m "feat: add password hashing utility"
```

---

### Task 16: JWT工具

**Files:**
- Create: `internal/pkg/jwt.go`
- Create: `internal/pkg/jwt_test.go`

**Interfaces:**
- Consumes: `github.com/golang-jwt/jwt/v5`, `cnalias/internal/config`, `cnalias/internal/model`
- Produces: `GenerateAccessToken()`, `GenerateRefreshToken()`, `ValidateToken()`, `RefreshToken()` 函数

- [ ] **Step 1: 创建JWT工具**

创建 `internal/pkg/jwt.go`:
```go
package pkg

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"cnalias/internal/config"
	"cnalias/internal/model"
)

var jwtConfig *config.JWTConfig

// InitJWT 初始化JWT配置
func InitJWT(cfg *config.JWTConfig) {
	jwtConfig = cfg
}

// Claims JWT claims
type Claims struct {
	UserID int64  `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// GenerateAccessToken 生成Access Token (15分钟)
func GenerateAccessToken(user *model.User) (string, error) {
	now := time.Now()
	claims := Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(jwtConfig.AccessTokenTTL)),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			Subject:   fmt.Sprintf("user:%d", user.ID),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(jwtConfig.Secret))
}

// GenerateRefreshToken 生成Refresh Token (7天)
func GenerateRefreshToken(user *model.User) (string, error) {
	now := time.Now()
	claims := Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(jwtConfig.RefreshTokenTTL)),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			Subject:   fmt.Sprintf("user:%d:refresh", user.ID),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(jwtConfig.Secret))
}

// ValidateToken 验证token并返回claims
func ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(jwtConfig.Secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// RefreshToken 刷新token
func RefreshToken(refreshToken string) (string, string, error) {
	claims, err := ValidateToken(refreshToken)
	if err != nil {
		return "", "", err
	}

	// 从Redis验证refresh token是否存在
	// 这里先简化处理，实际应查询Redis
	_ = bcrypt.CompareHashAndPassword

	// 生成新的token
	newAccessToken, err := GenerateAccessToken(&model.User{
		ID:    claims.UserID,
		Email: claims.Email,
		Role:  claims.Role,
	})
	if err != nil {
		return "", "", err
	}

	newRefreshToken, err := GenerateRefreshToken(&model.User{
		ID:    claims.UserID,
		Email: claims.Email,
		Role:  claims.Role,
	})
	if err != nil {
		return "", "", err
	}

	return newAccessToken, newRefreshToken, nil
}
```

创建 `internal/pkg/jwt_test.go`:
```go
package pkg

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"cnalias/internal/config"
	"cnalias/internal/model"
)

func setupJWT(t *testing.T) {
	cfg := &config.JWTConfig{
		Secret:           "test-secret-key",
		AccessTokenTTL:   time.Minute * 15,
		RefreshTokenTTL:  time.Hour * 24 * 7,
	}
	InitJWT(cfg)
}

func TestGenerateAndValidateAccessToken(t *testing.T) {
	setupJWT(t)

	user := &model.User{
		ID:    1,
		Email: "test@example.com",
		Role:  "USER",
	}

	token, err := GenerateAccessToken(user)
	assert.NoError(t, err)
	assert.NotEmpty(t, token)

	claims, err := ValidateToken(token)
	assert.NoError(t, err)
	assert.Equal(t, user.ID, claims.UserID)
	assert.Equal(t, user.Email, claims.Email)
	assert.Equal(t, user.Role, claims.Role)
}

func TestValidateToken_Invalid(t *testing.T) {
	setupJWT(t)

	_, err := ValidateToken("invalid.token.here")
	assert.Error(t, err)
}

func TestValidateToken_Expired(t *testing.T) {
	setupJWT(t)

	// 生成已过期的token
	cfg := &config.JWTConfig{
		Secret:         "test-secret-key",
		AccessTokenTTL: time.Minute * -1, // 已过期
	}
	InitJWT(cfg)

	user := &model.User{
		ID:    1,
		Email: "test@example.com",
		Role:  "USER",
	}

	token, _ := GenerateAccessToken(user)
	_, err := ValidateToken(token)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "expired")
}
```

- [ ] **Step 2: 运行测试**

```bash
cd internal/pkg && go test -v -run TestGenerate
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add internal/pkg/jwt.go internal/pkg/jwt_test.go
git commit -m "feat: add JWT utilities"
```

---

## Phase 5: Repository层实现

### Task 17: 用户Repository

**Files:**
- Create: `internal/repository/user_repo.go`
- Create: `internal/repository/user_repo_test.go`

**Interfaces:**
- Consumes: `internal/model.User`, `BaseRepository`
- Produces: `UserRepository` 接口和GORM实现

- [ ] **Step 1: 创建用户Repository**

创建 `internal/repository/user_repo.go`:
```go
package repository

import (
	"context"
	"cnalias/internal/model"
	"gorm.io/gorm"
)

// UserRepository 用户Repository接口
type UserRepository interface {
	BaseRepository[model.User]
	FindByEmail(ctx context.Context, email string) (*model.User, error)
	FindByUsername(ctx context.Context, username string) (*model.User, error)
	ExistsByEmail(ctx context.Context, email string) (bool, error)
	ExistsByUsername(ctx context.Context, username string) (bool, error)
}

// userGORMRepository 用户Repository GORM实现
type userGORMRepository struct {
	*BaseGORMRepository[model.User]
	db *gorm.DB
}

// NewUserRepository 创建用户Repository
func NewUserRepository(db *gorm.DB) UserRepository {
	return &userGORMRepository{
		BaseGORMRepository: NewBaseGORMRepository[model.User](db),
		db:                 db,
	}
}

// FindByEmail 根据邮箱查找用户
func (r *userGORMRepository) FindByEmail(ctx context.Context, email string) (*model.User, error) {
	var user model.User
	err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// FindByUsername 根据用户名查找用户
func (r *userGORMRepository) FindByUsername(ctx context.Context, username string) (*model.User, error) {
	var user model.User
	err := r.db.WithContext(ctx).Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// ExistsByEmail 检查邮箱是否存在
func (r *userGORMRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&model.User{}).Where("email = ?", email).Count(&count).Error
	return count > 0, err
}

// ExistsByUsername 检查用户名是否存在
func (r *userGORMRepository) ExistsByUsername(ctx context.Context, username string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&model.User{}).Where("username = ?", username).Count(&count).Error
	return count > 0, err
}
```

创建 `internal/repository/user_repo_test.go`:
```go
package repository

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"cnalias/internal/model"
)

func setupUserRepo(t *testing.T) (UserRepository, func()) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect database: %v", err)
	}

	// 迁移
	db.AutoMigrate(&model.User{})

	repo := NewUserRepository(db)

	cleanup := func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}

	return repo, cleanup
}

func TestUserRepository_FindByEmail(t *testing.T) {
	repo, cleanup := setupUserRepo(t)
	defer cleanup()
	ctx := context.Background()

	// 创建测试用户
	user := &model.User{
		Username:      "testuser",
		Email:         "test@example.com",
		PasswordHash:  "hash",
	}
	repo.Create(ctx, user)

	// 查找
	found, err := repo.FindByEmail(ctx, "test@example.com")
	assert.NoError(t, err)
	assert.Equal(t, user.Email, found.Email)

	// 查找不存在的
	_, err = repo.FindByEmail(ctx, "notfound@example.com")
	assert.Error(t, err)
}

func TestUserRepository_ExistsByUsername(t *testing.T) {
	repo, cleanup := setupUserRepo(t)
	defer cleanup()
	ctx := context.Background()

	// 插入用户
	repo.Create(ctx, &model.User{
		Username: "existing",
		Email:    "existing@example.com",
		PasswordHash: "hash",
	})

	exists, err := repo.ExistsByUsername(ctx, "existing")
	assert.NoError(t, err)
	assert.True(t, exists)

	exists, err = repo.ExistsByUsername(ctx, "nonexistent")
	assert.NoError(t, err)
	assert.False(t, exists)
}
```

- [ ] **Step 2: 运行测试**

```bash
cd internal/repository && go mod tidy && go test -v -run TestUser
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add internal/repository/user_repo.go internal/repository/user_repo_test.go
git commit -m "feat: add user repository"
```

---

### Task 18: 物品Repository

**Files:**
- Create: `internal/repository/item_repo.go`
- Create: `internal/repository/item_repo_test.go`

**Interfaces:**
- Consumes: `model.Item`
- Produces: `ItemRepository` 接口

- [ ] **Step 1: 创建物品Repository**

创建 `internal/repository/item_repo.go`:
```go
package repository

import (
	"context"
	"cnalias/internal/model"
	"gorm.io/gorm"
)

// ItemRepository 物品Repository接口
type ItemRepository interface {
	BaseRepository[model.Item]
	FindByName(ctx context.Context, name string) (*model.Item, error)
	ListWithFilters(ctx context.Context, opts ItemListOptions) ([]model.Item, int64, error)
	FindWithAliases(ctx context.Context, itemID int64) (*model.Item, error)
}

// ItemListOptions 物品列表选项
type ItemListOptions struct {
	Page       int
	PageSize   int
	CategoryID *int64
	Search     string
	OrderBy    string // "name", "created_at"
}

// itemGORMRepository 物品Repository GORM实现
type itemGORMRepository struct {
	*BaseGORMRepository[model.Item]
	db *gorm.DB
}

// NewItemRepository 创建物品Repository
func NewItemRepository(db *gorm.DB) ItemRepository {
	return &itemGORMRepository{
		BaseGORMRepository: NewBaseGORMRepository[model.Item](db),
		db:                 db,
	}
}

// FindByName 根据名称查找物品
func (r *itemGORMRepository) FindByName(ctx context.Context, name string) (*model.Item, error) {
	var item model.Item
	err := r.db.WithContext(ctx).Where("name = ?", name).First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

// ListWithFilters 带过滤条件的列表查询
func (r *itemGORMRepository) ListWithFilters(ctx context.Context, opts ItemListOptions) ([]model.Item, int64, error) {
	var items []model.Item
	var total int64

	query := r.db.WithContext(ctx).Model(&model.Item{})

	// 过滤条件
	if opts.CategoryID != nil {
		query = query.Where("category_id = ?", *opts.CategoryID)
	}

	if opts.Search != "" {
		searchPattern := "%" + opts.Search + "%"
		query = query.Where("name ILIKE ? OR description ILIKE ?", searchPattern, searchPattern)
	}

	// 统计总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 排序
	switch opts.OrderBy {
	case "created_at":
		query = query.Order("created_at DESC")
	default:
		query = query.Order("name ASC")
	}

	// 分页
	if opts.Page > 0 && opts.PageSize > 0 {
		offset := (opts.Page - 1) * opts.PageSize
		query = query.Offset(offset).Limit(opts.PageSize)
	}

	err := query.Find(&items).Error
	return items, total, err
}

// FindWithAliases 查找物品及其别名（已审核）
func (r *itemGORMRepository) FindWithAliases(ctx context.Context, itemID int64) (*model.Item, error) {
	var item model.Item

	err := r.db.WithContext(ctx).
		Preload("Category").
		Preload("Tags").
		First(&item, itemID).Error
	if err != nil {
		return nil, err
	}

	// 查询已审核的别名
	var aliases []model.Alias
	if err := r.db.WithContext(ctx).
		Where("item_id = ? AND status = ?", itemID, model.AliasStatusApproved).
		Order("name_type DESC, created_at DESC").
		Find(&aliases).Error; err != nil {
		return nil, err
	}

	// 手动组装响应
	response := item.ToResponse()
	for _, alias := range aliases {
		response.Aliases = append(response.Aliases, *alias.ToResponse())
	}

	return response, nil
}
```

创建 `internal/repository/item_repo_test.go`:
```go
package repository

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"cnalias/internal/model"
)

func setupItemRepo(t *testing.T) (ItemRepository, func()) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect database: %v", err)
	}

	db.AutoMigrate(&model.Item{}, &model.Alias{}, &model.Category{}, &model.Tag{}, &model.ItemTag{})

	repo := NewItemRepository(db)

	cleanup := func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}

	return repo, cleanup
}

func TestItemRepository_FindByName(t *testing.T) {
	repo, cleanup := setupItemRepo(t)
	defer cleanup()
	ctx := context.Background()

	item := &model.Item{Name: "马铃薯", Description: "蔬菜"}
	repo.Create(ctx, item)

	found, err := repo.FindByName(ctx, "马铃薯")
	assert.NoError(t, err)
	assert.Equal(t, "马铃薯", found.Name)

	_, err = repo.FindByName(ctx, "不存在")
	assert.Error(t, err)
}

func TestItemRepository_ListWithFilters(t *testing.T) {
	repo, cleanup := setupItemRepo(t)
	defer cleanup()
	ctx := context.Background()

	items := []*model.Item{
		{Name: "苹果", Description: "水果"},
		{Name: "香蕉", Description: "水果"},
		{Name: "胡萝卜", Description: "蔬菜"},
	}

	for _, item := range items {
		repo.Create(ctx, item)
	}

	// 列表查询
	result, total, err := repo.ListWithFilters(ctx, ItemListOptions{
		Page:     1,
		PageSize: 10,
	})
	assert.NoError(t, err)
	assert.Equal(t, int64(3), total)
	assert.Len(t, result, 3)

	// 搜索过滤
	result, _, err = repo.ListWithFilters(ctx, ItemListOptions{
		Page:   1,
		Search: "水果",
	})
	assert.NoError(t, err)
	assert.Equal(t, int64(2), total) // 苹果、香蕉
}
```

- [ ] **Step 2: 运行测试**

```bash
cd internal/repository && go test -v -run TestItem
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add internal/repository/item_repo.go internal/repository/item_repo_test.go
git commit -m "feat: add item repository"
```

---

### Task 19: 别名Repository

**Files:**
- Create: `internal/repository/alias_repo.go`
- Create: `internal/repository/alias_repo_test.go`

**Interfaces:**
- Consumes: `model.Alias`, `model.AliasStatus`
- Produces: `AliasRepository` 接口

- [ ] **Step 1: 创建别名Repository**

创建 `internal/repository/alias_repo.go`:
```go
package repository

import (
	"context"
	"cnalias/internal/model"
	"gorm.io/gorm"
)

// AliasRepository 别名Repository接口
type AliasRepository interface {
	BaseRepository[model.Alias]
	CreateWithCheck(ctx context.Context, alias *model.Alias) (*model.Alias, error)
	FindPending(ctx context.Context, offset, limit int, minPriority int) ([]model.Alias, error)
	GetPendingCount(ctx context.Context) (int64, error)
	UpdateStatus(ctx context.Context, id int64, status model.AliasStatus, reviewerID int64, note string) error
}

// aliasGORMRepository 别名Repository GORM实现
type aliasGORMRepository struct {
	*BaseGORMRepository[model.Alias]
	db *gorm.DB
}

// NewAliasRepository 创建别名Repository
func NewAliasRepository(db *gorm.DB) AliasRepository {
	return &aliasGORMRepository{
		BaseGORMRepository: NewBaseGORMRepository[model.Alias](db),
		db:                 db,
	}
}

// CreateWithCheck 创建别名（带重复检查）
func (r *aliasGORMRepository) CreateWithCheck(ctx context.Context, alias *model.Alias) (*model.Alias, error) {
	// 检查是否已存在相同的别名
	var existing model.Alias
	err := r.db.WithContext(ctx).
		Where("item_id = ? AND region_id = ? AND alias_name = ?",
			alias.ItemID, alias.RegionID, alias.AliasName).
		First(&existing).Error

	if err == nil {
		// 已存在，返回错误
		return nil, ErrDuplicateAlias
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// 创建新记录
	if err := r.db.WithContext(ctx).Create(alias).Error; err != nil {
		return nil, err
	}

	return alias, nil
}

// FindPending 查找待审核的别名（按优先级排序）
// minPriority用于过滤低优先级提交
func (r *aliasGORMRepository) FindPending(ctx context.Context, offset, limit int, minPriority int) ([]model.Alias, error) {
	var aliases []model.Alias

	// TODO: 实际项目中需要额外字段存储优先级，这里简化为按提交时间排序
	err := r.db.WithContext(ctx).
		Where("status = ?", model.AliasStatusPending).
		Order("created_at ASC").
		Offset(offset).
		Limit(limit).
		Find(&aliases).Error

	return aliases, err
}

// GetPendingCount 获取待审核数量
func (r *aliasGORMRepository) GetPendingCount(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&model.Alias{}).
		Where("status = ?", model.AliasStatusPending).Count(&count)
	return count, err
}

// UpdateStatus 更新别名状态
func (r *aliasGORMRepository) UpdateStatus(ctx context.Context, id int64, status model.AliasStatus, reviewerID int64, note string) error {
	return r.db.WithContext(ctx).Model(&model.Alias{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"status":       status,
			"reviewer_id":  reviewerID,
			"reviewed_at":  gorm.Expr("NOW()"),
			"review_note":  note,
		}).Error
}

// ErrDuplicateAlias 重复别名错误
var ErrDuplicateAlias = errors.New("alias already exists for this item and region")
```

创建 `internal/repository/alias_repo_test.go`:
```go
package repository

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"cnalias/internal/model"
	"errors"
)

func setupAliasRepo(t *testing.T) (AliasRepository, func()) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect database: %v", err)
	}

	db.AutoMigrate(&model.Item{}, &model.Alias{}, &model.Region{}, &model.Category{})

	repo := NewAliasRepository(db)

	cleanup := func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}

	return repo, cleanup
}

func TestAliasRepository_CreateWithCheck(t *testing.T) {
	repo, cleanup := setupAliasRepo(t)
	defer cleanup()
	ctx := context.Background()

	// 先创建item和region
	item := &model.Item{Name: "马铃薯"}
	db.Create(item)

	region := &model.Region{Name: "广东", RegionType: model.RegionTypeProvince}
	db.Create(region)

	// 创建别名
	alias := &model.Alias{
		ItemID:    item.ID,
		RegionID:  region.ID,
		AliasName: "土豆",
		NameType:  model.NameTypeCommon,
		Status:    model.AliasStatusPending,
	}

	created, err := repo.CreateWithCheck(ctx, alias)
	assert.NoError(t, err)
	assert.NotZero(t, created.ID)

	// 尝试创建重复
	_, err = repo.CreateWithCheck(ctx, alias)
	assert.ErrorIs(t, err, ErrDuplicateAlias)
}

func TestAliasRepository_UpdateStatus(t *testing.T) {
	repo, cleanup := setupAliasRepo(t)
	defer cleanup()
	ctx := context.Background()

	// 创建别名
	alias := &model.Alias{
		ItemID:    1,
		RegionID:  1,
		AliasName: "土豆",
		NameType:  model.NameTypeCommon,
		Status:    model.AliasStatusPending,
	}
	db.Create(alias)

	// 更新状态
	err := repo.UpdateStatus(ctx, alias.ID, model.AliasStatusApproved, 1, "通过")
	assert.NoError(t, err)

	// 验证
	updated, _ := repo.GetByID(ctx, alias.ID)
	assert.Equal(t, model.AliasStatusApproved, updated.Status)
	assert.Equal(t, int64(1), *updated.ReviewerID)
	assert.Equal(t, "通过", updated.ReviewNote)
}
```

- [ ] **Step 2: 运行测试**

```bash
cd internal/repository && go test -v -run TestAlias
```

Expected: PASS (可能会因为sqlite不支持某些GORM语法需要调整)

- [ ] **Step 3: Commit**

```bash
git add internal/repository/alias_repo.go internal/repository/alias_repo_test.go
git commit -m "feat: add alias repository"
```

---

## 实施提示

### 依赖管理

每次新增 `internal/` 目录下的模块后，需要更新 `internal` 目录的 `go.mod`：

```bash
cd internal && go mod tidy
```

### 数据库迁移工具推荐

使用 [golang-migrate](https://github.com/golang-migrate/migrate):

```bash
# 安装
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# 创建新迁移
migrate create -ext sql -dir migrations -seq add_new_table

# 执行迁移
migrate -path migrations -database "postgres://user:pass@localhost:5432/cnalias?sslmode=disable" up

# 回滚
migrate -path migrations -database "postgres://user:pass@localhost:5432/cnalias?sslmode=disable" down 1
```

### Docker Compose 开发环境

创建 `docker-compose.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: cnalias
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 测试策略

- **单元测试**: 使用内存数据库 (sqlite) 或 mock
- **集成测试**: 使用Docker启动PostgreSQL和Redis
- **覆盖率目标**: 核心模块≥80%

### 后续任务（待实施）

- [ ] Region Repository
- [ ] Category Repository
- [ ] Review Log Repository
- [ ] Tag Repository
- [ ] Service层实现
- [ ] Handler层实现
- [ ] 中间件实现
- [ ] 路由配置和启动
- [ ] Swagger文档配置
- [ ] Docker和部署配置
- [ ] 集成测试
- [ ] 性能优化
- [ ] 监控和日志

---

## Phase 6: Service层实现

### Task 20: 用户Service

**Files:**
- Create: `internal/service/user_service.go`
- Create: `internal/service/user_service_test.go`

**Interfaces:**
- Consumes: `UserRepository`, `repository.UserRepository`
- Produces: `UserService` 接口

```go
package service

import (
	"context"
	"cnalias/internal/model"
	"cnalias/internal/repository"
	"cnalias/internal/pkg"
)

// UserService 用户服务接口
type UserService interface {
	Register(ctx context.Context, req *model.UserRegisterRequest) (*model.UserResponse, error)
	Login(ctx context.Context, req *model.UserLoginRequest) (string, string, error)
	GetByID(ctx context.Context, id int64) (*model.User, error)
}

type userService struct {
	userRepo repository.UserRepository
}

func NewUserService(userRepo repository.UserRepository) UserService {
	return &userService{userRepo: userRepo}
}

// Register 用户注册
func (s *userService) Register(ctx context.Context, req *model.UserRegisterRequest) (*model.UserResponse, error) {
	// 验证用户名和邮箱是否已存在
	exists, _ := s.userRepo.ExistsByUsername(ctx, req.Username)
	if exists {
		return nil, errors.New("username already taken")
	}

	exists, _ = s.userRepo.ExistsByEmail(ctx, req.Email)
	if exists {
		return nil, errors.New("email already registered")
	}

	// 加密密码
	hash, err := pkg.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// 创建用户
	user := &model.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: hash,
		Role:         "USER",
		IsVerified:   false,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return user.ToResponse(), nil
}

// Login 用户登录
func (s *userService) Login(ctx context.Context, req *model.UserLoginRequest) (string, string, error) {
	// 查找用户
	user, err := s.userRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return "", "", errors.New("invalid email or password")
	}

	// 验证密码
	if err := pkg.ComparePassword(user.PasswordHash, req.Password); err != nil {
		return "", "", errors.New("invalid email or password")
	}

	// 生成token
	accessToken, err := pkg.GenerateAccessToken(user)
	if err != nil {
		return "", "", fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, err := pkg.GenerateRefreshToken(user)
	if err != nil {
		return "", "", fmt.Errorf("failed to generate refresh token: %w", err)
	}

	return accessToken, refreshToken, nil
}

// GetByID 根据ID获取用户
func (s *userService) GetByID(ctx context.Context, id int64) (*model.User, error) {
	return s.userRepo.GetByID(ctx, id)
}
```

- [ ] **Step 2: 编写测试**
- [ ] **Step 3: 运行测试**
- [ ] **Step 4: Commit**

---

### Task 21: 物品Service

**Files:**
- Create: `internal/service/item_service.go`
- Create: `internal/service/item_service_test.go`

**接口和实现类似，重点测试：**
- 创建物品（检查重复）
- 搜索功能
- 分页功能
- 关联别名查询

---

### Task 22: 别名Service

**Files:**
- Create: `internal/service/alias_service.go`
- Create: `internal/service/alias_service_test.go`

**重点：**
- 提交别名（匿名/登录用户）
- 重复检查
- 状态过滤查询
- 用户自己的提交查询

---

### Task 23: 审核Service

**Files:**
- Create: `internal/service/review_service.go`
- Create: `internal/service/review_service_test.go`

**重点：**
- 获取审核队列
- 审核通过/拒绝
- 记录审核日志
- 清除相关缓存

---

## Phase 7: Handler层和中间件

### Task 24: 统一响应格式

**Files:**
- Create: `internal/handler/response.go`

```go
package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Response 统一响应格式
type Response struct {
	Code      int         `json:"code"`
	Message   string      `json:"message"`
	Data      interface{} `json:"data,omitempty"`
	Timestamp time.Time   `json:"timestamp"`
}

// Success 成功响应
func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:      0,
		Message:   "success",
		Data:      data,
		Timestamp: time.Now(),
	})
}

// Created 创建成功
func Created(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, Response{
		Code:      0,
		Message:   "created",
		Data:      data,
		Timestamp: time.Now(),
	})
}

// Error 错误响应
func Error(c *gin.Context, statusCode int, message string) {
	c.JSON(statusCode, Response{
		Code:      statusCode,
		Message:   message,
		Timestamp: time.Now(),
	})
}

// BadRequest 400错误
func BadRequest(c *gin.Context, message string) {
	Error(c, http.StatusBadRequest, message)
}

// Unauthorized 401错误
func Unauthorized(c *gin.Context, message string) {
	Error(c, http.StatusUnauthorized, message)
}

// Forbidden 403错误
func Forbidden(c *gin.Context, message string) {
	Error(c, http.StatusForbidden, message)
}

// NotFound 404错误
func NotFound(c *gin.Context, message string) {
	Error(c, http.StatusNotFound, message)
}

// Conflict 409错误
func Conflict(c *gin.Context, message string) {
	Error(c, http.StatusConflict, message)
}

// TooManyRequests 429错误
func TooManyRequests(c *gin.Context, message string) {
	Error(c, http.StatusTooManyRequests, message)
}

// InternalError 500错误
func InternalError(c *gin.Context, message string) {
	Error(c, http.StatusInternalServerError, message)
}
```

---

### Task 25: 认证中间件

**Files:**
- Create: `internal/middleware/auth.go`

```go
package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"cnalias/internal/pkg"
)

// AuthMiddleware JWT认证中间件
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			handler.Unauthorized(c, "missing authorization header")
			c.Abort()
			return
		}

		// Bearer token
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			handler.Unauthorized(c, "invalid authorization header format")
			c.Abort()
			return
		}

		tokenString := parts[1]
		claims, err := pkg.ValidateToken(tokenString)
		if err != nil {
			handler.Unauthorized(c, "invalid or expired token")
			c.Abort()
			return
		}

		// 将用户信息存入context
		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Set("user_role", claims.Role)

		c.Next()
	}
}

// RequireAdmin 要求管理员权限
func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("user_role")
		if !exists || role != "ADMIN" {
			handler.Forbidden(c, "admin access required")
			c.Abort()
			return
		}
		c.Next()
	}
}

// OptionalAuth 可选认证（不强制要求token，但有token会验证）
func OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) == 2 && parts[0] == "Bearer" {
				claims, err := pkg.ValidateToken(parts[1])
				if err == nil {
					c.Set("user_id", claims.UserID)
					c.Set("user_email", claims.Email)
					c.Set("user_role", claims.Role)
				}
			}
		}
		c.Next()
	}
}
```

---

### Task 26: 限流中间件

**Files:**
- Create: `internal/middleware/rate_limit.go`

```go
package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"cnalias/internal/cache"
)

// RateLimiter 限流中间件
func RateLimiter() gin.HandlerFunc {
	return func(c *gin.Context) {
		key := c.ClientIP()
		limitKey := fmt.Sprintf("rate_limit:%s", key)

		// 获取当前计数
		count, err := cache.RedisClient.Incr(cache.Ctx, limitKey).Result()
		if err != nil {
			// Redis不可用时，允许请求（降级策略）
			c.Next()
			return
		}

		// 第一次请求时设置过期时间
		if count == 1 {
			cache.RedisClient.Expire(cache.Ctx, limitKey, time.Minute)
		}

		// 限制：60次/分钟
		if count > 60 {
			handler.TooManyRequests(c, "too many requests")
			c.Abort()
			return
		}

		// 设置响应头
		c.Header("X-RateLimit-Limit", "60")
		c.Header("X-RateLimit-Remaining", strconv.FormatInt(60-count, 10))

		c.Next()
	}
}
```

---

### Task 27: 日志和Recovery中间件

**Files:**
- Create: `internal/middleware/logger.go`
- Create: `internal/middleware/recovery.go`

**Logger Middleware:**
```go
package middleware

import (
	"time"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"cnalias/internal/pkg"
)

// LoggerMiddleware 日志中间件
func LoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		c.Next()

		latency := time.Since(start)
		statusCode := c.Writer.Status()
		method := c.Request.Method
		clientIP := c.ClientIP()

		if raw != "" {
			path = path + "?" + raw
		}

		pkg.Logger.Info("request",
			zap.String("method", method),
			zap.String("path", path),
			zap.Int("status", statusCode),
			zap.Duration("latency", latency),
			zap.String("ip", clientIP),
		)
	}
}
```

**Recovery Middleware:**
```go
package middleware

import (
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"cnalias/internal/pkg"
)

// RecoveryMiddleware Panic恢复中间件
func RecoveryMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				pkg.Logger.Error("panic recovered",
					zap.Any("error", err),
					zap.String("path", c.Request.URL.Path),
				)

				handler.InternalError(c, "internal server error")
				c.Abort()
			}
		}()
		c.Next()
	}
}
```

---

### Task 28: CORS中间件

**Files:**
- Create: `internal/middleware/cors.go`

```go
package middleware

import (
	"github.com/gin-gonic/gin"
)

// CORSMiddleware CORS中间件
func CORSMiddleware(allowedOrigins []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		// 检查是否在允许列表中
		allowed := false
		for _, allowedOrigin := range allowedOrigins {
			if allowedOrigin == "*" || allowedOrigin == origin {
				allowed = true
				break
			}
		}

		if allowed {
			c.Header("Access-Control-Allow-Origin", origin)
		}

		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With")
		c.Header("Access-Control-Expose-Headers", "Content-Length, Content-Disposition")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Max-Age", "86400") // 24小时

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
```

---

## Phase 8: 路由和Handler实现

### Task 29: Auth Handler

**Files:**
- Create: `internal/handler/auth_handler.go`

```go
package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"cnalias/internal/model"
	"cnalias/internal/service"
)

type AuthHandler struct {
	userService service.UserService
}

func NewAuthHandler(userService service.UserService) *AuthHandler {
	return &AuthHandler{userService: userService}
}

// Register 用户注册
// @Summary 用户注册
// @Description 注册新用户
// @Tags auth
// @Accept json
// @Produce json
// @Param request body model.UserRegisterRequest true "注册信息"
// @Success 201 {object} Response{data=model.UserResponse}
// @Failure 400 {object} Response
// @Failure 409 {object} Response
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req model.UserRegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	user, err := h.userService.Register(c.Request.Context(), &req)
	if err != nil {
		if err.Error() == "username already taken" || err.Error() == "email already registered" {
			Conflict(c, err.Error())
			return
		}
		InternalError(c, "registration failed")
		return
	}

	Created(c, user)
}

// Login 用户登录
// @Summary 用户登录
// @Description 用户登录获取token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body model.UserLoginRequest true "登录信息"
// @Success 200 {object} Response{data=map[string]string}
// @Failure 400 {object} Response
// @Failure 401 {object} Response
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req model.UserLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	accessToken, refreshToken, err := h.userService.Login(c.Request.Context(), &req)
	if err != nil {
		Unauthorized(c, "invalid email or password")
		return
	}

	Success(c, gin.H{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"token_type":    "Bearer",
		"expires_in":    900, // 15分钟，秒
	})
}

// Refresh 刷新token
func (h *AuthHandler) Refresh(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	// TODO: 实现refresh逻辑
	InternalError(c, "not implemented")
}
```

---

### Task 30: Item Handler

**Files:**
- Create: `internal/handler/item_handler.go`

```go
package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"cnalias/internal/model"
	"cnalias/internal/service"
)

type ItemHandler struct {
	itemService service.ItemService
}

func NewItemHandler(itemService service.ItemService) *ItemHandler {
	return &ItemHandler{itemService: itemService}
}

// List 物品列表
// @Summary 获取物品列表
// @Description 支持分页、搜索、分类筛选
// @Tags items
// @Produce json
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(20)
// @Param category_id query int false "分类ID"
// @Param search query string false "搜索关键词"
// @Success 200 {object} Response{data=map[string]interface{}}
// @Router /items [get]
func (h *ItemHandler) List(c *gin.Context) {
	// 解析查询参数
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	categoryIDStr := c.Query("category_id")
	search := c.Query("search")

	var categoryID *int64
	if categoryIDStr != "" {
		id, err := strconv.ParseInt(categoryIDStr, 10, 64)
		if err != nil {
			BadRequest(c, "invalid category_id")
			return
		}
		categoryID = &id
	}

	opts := model.ItemListOptions{
		Page:       page,
		PageSize:   pageSize,
		CategoryID: categoryID,
		Search:     search,
		OrderBy:    c.DefaultQuery("order_by", "name"),
	}

	items, total, err := h.itemService.List(c.Request.Context(), opts)
	if err != nil {
		InternalError(c, "failed to fetch items")
		return
	}

	Success(c, gin.H{
		"items":      items,
		"total":      total,
		"page":      page,
		"page_size": pageSize,
	})
}

// GetByID 获取物品详情
// @Summary 获取物品详情
// @Description 获取物品及其已审核别名
// @Tags items
// @Produce json
// @Param id path int true "物品ID"
// @Success 200 {object} Response{data=model.ItemResponse}
// @Failure 404 {object} Response
// @Router /items/{id} [get]
func (h *ItemHandler) GetByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		BadRequest(c, "invalid item id")
		return
	}

	item, err := h.itemService.GetByID(c.Request.Context(), id)
	if err != nil {
		NotFound(c, "item not found")
		return
	}

	Success(c, item)
}
```

---

### Task 31: Alias Handler

**Files:**
- Create: `internal/handler/alias_handler.go`

```go
package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"cnalias/internal/model"
	"cnalias/internal/service"
)

type AliasHandler struct {
	aliasService service.AliasService
}

func NewAliasHandler(aliasService service.AliasService) *AliasHandler {
	return &AliasHandler{aliasService: aliasService}
}

// Submit 提交别名
// @Summary 提交别名
// @Description 用户提交地区别名（需登录）
// @Tags aliases
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body model.AliasRequest true "别名信息"
// @Success 201 {object} Response{data=model.AliasResponse}
// @Failure 400 {object} Response
// @Failure 409 {object} Response
// @Router /aliases [post]
func (h *AliasHandler) Submit(c *gin.Context) {
	var req model.AliasRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	userID, _ := c.Get("user_id")

	alias, err := h.aliasService.Submit(c.Request.Context(), &req, &userID)
	if err != nil {
		if err.Error() == "alias already exists" {
			Conflict(c, err.Error())
			return
		}
		InternalError(c, "submission failed")
		return
	}

	Created(c, alias)
}

// AnonymousSubmit 匿名提交
// @Summary 匿名提交别名
// @Description 匿名提交需要管理员审核
// @Tags aliases
// @Accept json
// @Produce json
// @Param request body model.AnonymousAliasRequest true "匿名提交信息"
// @Success 201 {object} Response{data=model.AliasResponse}
// @Router /submissions/anonymous [post]
func (h *AliasHandler) AnonymousSubmit(c *gin.Context) {
	var req model.AnonymousAliasRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	alias, err := h.aliasService.SubmitAnonymous(c.Request.Context(), &req)
	if err != nil {
		if err.Error() == "alias already exists" {
			Conflict(c, err.Error())
			return
		}
		InternalError(c, "submission failed")
		return
	}

	Created(c, alias)
}

// GetMySubmissions 我的提交记录
// @Summary 我的提交记录
// @Tags aliases
// @Security BearerAuth
// @Produce json
// @Success 200 {object} Response{data=[]model.AliasResponse}
// @Router /users/me/submissions [get]
func (h *AliasHandler) GetMySubmissions(c *gin.Context) {
	userID, _ := c.Get("user_id")

	submissions, err := h.aliasService.GetUserSubmissions(c.Request.Context(), userID.(int64))
	if err != nil {
		InternalError(c, "failed to fetch submissions")
		return
	}

	Success(c, submissions)
}

// SearchByAlias 根据别名搜索
// @Summary 根据地区别名搜索物品
// @Description 根据地区词查找对应的物品
// @Tags aliases
// @Produce json
// @Param q query string true "搜索关键词（地区别名）"
// @Param region_id query int false "地区ID筛选"
// @Success 200 {object} Response{data=[]model.AliasResponse}
// @Router /aliases/search [get]
func (h *AliasHandler) SearchByAlias(c *gin.Context) {
	q := c.Query("q")
	if q == "" {
		BadRequest(c, "query parameter 'q' is required")
		return
	}

	regionIDStr := c.Query("region_id")
	var regionID *int64
	if regionIDStr != "" {
		id, err := strconv.ParseInt(regionIDStr, 10, 64)
		if err != nil {
			BadRequest(c, "invalid region_id")
			return
		}
		regionID = &id
	}

	results, err := h.aliasService.Search(c.Request.Context(), q, regionID)
	if err != nil {
		InternalError(c, "search failed")
		return
	}

	Success(c, results)
}
```

---

### Task 32: Admin Handler

**Files:**
- Create: `internal/handler/admin_handler.go`

```go
package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"cnalias/internal/model"
	"cnalias/internal/service"
)

type AdminHandler struct {
	reviewService service.ReviewService
	itemService   service.ItemService
}

func NewAdminHandler(reviewService service.ReviewService, itemService service.ItemService) *AdminHandler {
	return &AdminHandler{
		reviewService: reviewService,
		itemService:   itemService,
	}
}

// GetReviewQueue 获取审核队列
// @Summary 获取审核队列
// @Description 获取待审核别名列表（按优先级排序）
// @Tags admin
// @Security BearerAuth
// @Produce json
// @Success 200 {object} Response{data=[]model.AliasResponse}
// @Router /admin/review/queue [get]
func (h *AdminHandler) GetReviewQueue(c *gin.Context) {
	// 分页参数
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	// TODO: 实现获取队列逻辑

	Success(c, gin.H{"message": "review queue endpoint"})
}

// ApproveAlias 审核通过
// @Summary 审核通过别名
// @Tags admin
// @Security BearerAuth
// @Param id path int true "别名ID"
// @Success 200 {object} Response
// @Router /admin/review/{id}/approve [post]
func (h *AdminHandler) ApproveAlias(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	reviewerID, _ := c.Get("user_id")

	var req model.ReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	err := h.reviewService.Approve(c.Request.Context(), id, reviewerID.(int64), req.Note)
	if err != nil {
		InternalError(c, "approval failed")
		return
	}

	Success(c, gin.H{"message": "approved"})
}

// RejectAlias 审核拒绝
// @Summary 审核拒绝别名
// @Tags admin
// @Security BearerAuth
// @Param id path int true "别名ID"
// @Success 200 {object} Response
// @Router /admin/review/{id}/reject [post]
func (h *AdminHandler) RejectAlias(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	reviewerID, _ := c.Get("user_id")

	var req model.ReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		BadRequest(c, err.Error())
		return
	}

	err := h.reviewService.Reject(c.Request.Context(), id, reviewerID.(int64), req.Note)
	if err != nil {
		InternalError(c, "rejection failed")
		return
	}

	Success(c, gin.H{"message": "rejected"})
}

// GetStats 获取统计数据
// @Summary 统计数据
// @Tags admin
// @Security BearerAuth
// @Produce json
// @Success 200 {object} Response{data=map[string]interface{}}
// @Router /admin/stats [get]
func (h *AdminHandler) GetStats(c *gin.Context) {
	// TODO: 实现统计逻辑

	Success(c, gin.H{
		"total_items":     0,
		"total_aliases":   0,
		"pending_reviews": 0,
		"total_users":     0,
	})
}
```

---

## Phase 9: 路由配置和启动

### Task 33: 路由配置

**Files:**
- Create: `internal/router/router.go`

```go
package router

import (
	"github.com/gin-gonic/gin"
	"cnalias/internal/handler"
	"cnalias/internal/middleware"
	"cnalias/internal/service"
)

// SetupRouter 配置路由
func SetupRouter(
	authHandler *handler.AuthHandler,
	itemHandler *handler.ItemHandler,
	aliasHandler *handler.AliasHandler,
	adminHandler *handler.AdminHandler,
	regionHandler *handler.RegionHandler,
	categoryHandler *handler.CategoryHandler,
) *gin.Engine {
	router := gin.New()
	router.Use(gin.Recovery())

	// 中间件
	router.Use(middleware.LoggerMiddleware())
	router.Use(middleware.CORSMiddleware([]string{"*"}))
	router.Use(middleware.RateLimiter())

	// 健康检查
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API v1
	v1 := router.Group("/api/v1")
	{
		// 认证相关
		auth := v1.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.Refresh)
		}

		// 公开接口
		v1.GET("/items", itemHandler.List)
		v1.GET("/items/:id", itemHandler.GetByID)
		v1.GET("/aliases/search", aliasHandler.SearchByAlias)
		v1.GET("/regions", regionHandler.List)
		v1.GET("/categories", categoryHandler.List)

		// 需要认证的接口
		authenticated := v1.Group("")
		authenticated.Use(middleware.AuthMiddleware())
		{
			authenticated.POST("/aliases", aliasHandler.Submit)
			authenticated.GET("/users/me/submissions", aliasHandler.GetMySubmissions)
		}

		// 管理员接口
		admin := v1.Group("/admin")
		admin.Use(middleware.AuthMiddleware(), middleware.RequireAdmin())
		{
			admin.GET("/review/queue", adminHandler.GetReviewQueue)
			admin.POST("/review/:id/approve", adminHandler.ApproveAlias)
			admin.POST("/review/:id/reject", adminHandler.RejectAlias)
			admin.GET("/stats", adminHandler.GetStats)
		}
	}

	// Swagger (如果配置了)
	// router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	return router
}
```

---

### Task 34: 主入口

**Files:**
- Create: `cmd/server/main.go`

```go
package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"cnalias/internal/cache"
	"cnalias/internal/config"
	"cnalias/internal/handler"
	"cnalias/internal/middleware"
	"cnalias/internal/pkg"
	"cnalias/internal/repository"
	"cnalias/internal/router"
	"cnalias/internal/service"

	_ "cnalias/migrations"

	"github.com/gin-gonic/gin"
)

func main() {
	// 加载配置
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// 初始化日志
	if err := pkg.InitLogger(cfg); err != nil {
		log.Fatalf("Failed to init logger: %v", err)
	}
	defer pkg.Sync()

	pkg.Logger.Info("Starting application",
		zap.String("env", cfg.App.Environment),
		zap.String("version", "1.0.0"),
	)

	// 连接数据库
	db, err := pkg.NewDB(&cfg.Database)
	if err != nil {
		pkg.Logger.Fatal("Failed to connect database", zap.Error(err))
	}

	// 初始化Redis
	if err := cache.InitRedis(&cfg.Redis); err != nil {
		pkg.Logger.Fatal("Failed to connect redis", zap.Error(err))
	}
	defer cache.Close()

	// 初始化Repository
	userRepo := repository.NewUserRepository(db)
	itemRepo := repository.NewItemRepository(db)
	aliasRepo := repository.NewAliasRepository(db)
	// TODO: regionRepo, categoryRepo, tagRepo

	// 初始化Service
	userService := service.NewUserService(userRepo)
	itemService := service.NewItemService(itemRepo)
	aliasService := service.NewAliasService(aliasRepo)
	// TODO: reviewService, regionService

	// 初始化Handler
	authHandler := handler.NewAuthHandler(userService)
	itemHandler := handler.NewItemHandler(itemService)
	aliasHandler := handler.NewAliasHandler(aliasService)
	adminHandler := handler.NewAdminHandler(nil, itemService) // TODO: 注入reviewService
	regionHandler := handler.NewRegionHandler(nil) // TODO
	categoryHandler := handler.NewCategoryHandler(nil) // TODO

	// 配置路由
	router := router.SetupRouter(
		authHandler,
		itemHandler,
		aliasHandler,
		adminHandler,
		regionHandler,
		categoryHandler,
	)

	// 启动服务
	addr := fmt.Sprintf(":%s", cfg.Server.Port)
	pkg.Logger.Info("Server starting", zap.String("addr", addr))

	if err := router.Run(addr); err != nil {
		pkg.Logger.Fatal("Failed to start server", zap.Error(err))
	}

	// 优雅关闭
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	pkg.Logger.Info("Shutting down server...")
}
```

---

## 完成清单

### 已完成
- [x] 项目结构初始化
- [x] 配置管理
- [x] 数据库连接配置
- [x] Redis连接配置
- [x] 数据模型（User, Item, Alias, Category, Region, Tag, ReviewLog）
- [x] Repository基础接口和实现
- [x] 密码加密工具
- [x] JWT工具
- [x] 统一响应格式
- [x] 中间件（Auth, CORS, Logger, RateLimit, Recovery）
- [x] 路由配置
- [x] Handler框架
- [x] 数据库迁移脚本

### 待完成
- [ ] Region Repository和Service
- [ ] Category Repository和Service
- [ ] Tag Repository和Service
- [ ] Review Service实现
- [ ] Handler完整实现
- [ ] 数据库迁移实际执行
- [ ] Swagger文档配置
- [ ] 集成测试
- [ ] Docker配置
- [ ] 性能优化
- [ ] 监控和日志增强

---

## 测试建议

### 单元测试
- 使用sqlite内存数据库模拟PostgreSQL
- Mock Redis（使用miniredis）
- 测试覆盖率目标：≥80%

### 集成测试
- 使用Docker Compose启动测试环境
- 测试完整的API流程

### 性能测试
- 使用wrk或hey进行压测
- 重点关注：列表查询、审核队列

---

## 下一步行动

1. **立即执行**: 完成所有Service和Handler的TODO
2. **本地测试**: 连接PostgreSQL和Redis，执行迁移
3. **API验证**: 使用curl或Postman测试接口
4. **编写文档**: 完善README和API文档
5. **部署准备**: Docker配置和CI/CD

---

**预计工时**: 
- 核心功能完成: 40-60小时
- 测试和优化: 20-30小时
- 文档和部署: 10-15小时

**总计**: 70-105小时（约2-3周全职开发）
