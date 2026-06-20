#!/bin/bash
# 创建测试管理员账号
# 使用方法: ./scripts/setup.sh

set -e

echo "正在创建测试管理员账号..."

# 创建临时 Go 脚本
cat > /tmp/create_admin.go << 'GOEOF'
package main

import (
	"fmt"
	"os"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type TempUser struct {
	ID           int64
	Email        string
	PasswordHash string
	Role         string
}

func main() {
	dsn := "host=localhost user=postgres password=root1234 dbname=cnalias port=15432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		fmt.Printf("❌ 连接数据库失败: %v\n", err)
		os.Exit(1)
	}

	// 检查用户是否已存在
	var user TempUser
	if err := db.Raw("SELECT id, email, password_hash, role FROM users WHERE email = ?", "admin@test.com").Scan(&user).Error; err == nil && user.ID > 0 {
		fmt.Println("✅ 管理员账号已存在:")
		fmt.Printf("  邮箱: %s\n", user.Email)
		fmt.Printf("  角色: %s\n", user.Role)
		os.Exit(0)
	}

	// 生成密码哈希
	password := "Test123456"
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		fmt.Printf("❌ 密码加密失败: %v\n", err)
		os.Exit(1)
	}

	// 创建管理员用户
	now := "NOW()"
	if err := db.Exec(
		"INSERT INTO users (username, email, password_hash, role, is_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, " + now + ", " + now + ")",
		"admin", "admin@test.com", string(hashedPassword), "ADMIN", true,
	).Error; err != nil {
		fmt.Printf("❌ 创建用户失败: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("✅ 管理员账号创建成功:")
	fmt.Println("  邮箱: admin@test.com")
	fmt.Println("  密码: Test123456")
	fmt.Println("  角色: ADMIN")
}
GOEOF

# 运行脚本
cd /Users/rdd/playground/cnalias && go run /tmp/create_admin.go

# 清理
rm -f /tmp/create_admin.go
