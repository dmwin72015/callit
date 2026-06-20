# 管理员账号设置指南

## 问题原因

之前访问后台提示 403 权限不足，原因是：

1. **测试管理员账号不存在** - 数据库中没有创建管理员用户
2. **.env 文件未正确加载** - Go 服务没有读取 .env 配置文件

## 解决方案

### 1. 添加 .env 文件加载

安装了 `github.com/joho/godotenv` 依赖，在 `main.go` 中添加：

```go
import "github.com/joho/godotenv"

func main() {
    // 加载 .env 文件（如果存在）
    _ = godotenv.Load()
    // ...
}
```

这样服务启动时会自动读取 `.env` 文件中的配置。

### 2. 创建测试管理员账号

提供了自动创建脚本：

```bash
./scripts/setup.sh
```

脚本会：
- 检查管理员账号是否已存在
- 如果不存在，创建账号：`admin@test.com` / `Test123456`
- 角色设置为 `ADMIN`

### 3. 重启服务

修改代码后需要重新编译并重启服务：

```bash
# 编译
go build -o tmp/server ./server/cmd/server

# 停止旧进程并启动新进程
pkill -f "tmp/server"
./tmp/server
```

## 测试账号

创建完成后，可以使用以下账号登录：

- **邮箱**: `admin@test.com`
- **密码**: `Test123456`
- **角色**: ADMIN

## 验证

### 测试登录

```bash
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Test123456"}'
```

预期返回：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "expires_in": 900
  }
}
```

### 测试管理后台

```bash
TOKEN=上面返回的access_token
curl http://localhost:8081/api/v1/admin/stats \
  -H "Authorization: Bearer $TOKEN"
```

预期返回统计数据，确认权限正常。

## 注意事项

- 如果外部 PostgreSQL 容器重置，需要重新运行 `./scripts/setup.sh`
- `.env` 文件不会被提交到 git，每次克隆代码后需要复制 `.env.example` 到 `.env`
- 生产环境使用 `.env.docker` 配置文件
