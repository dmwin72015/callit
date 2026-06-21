package main

import (
	"context"
	"fmt"

	"github.com/rdd/cnalias/server/internal/model"
	"github.com/rdd/cnalias/server/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

// initDefaultAdmin 初始化默认管理员账号
func initDefaultAdmin(ctx context.Context, userRepo repository.UserRepository) error {
	// 检查是否已存在 admin@test.com
	existing, err := userRepo.FindByEmail(ctx, "admin@test.com")
	if err == nil && existing != nil {
		fmt.Println("Admin user already exists, skipping creation")
		return nil
	}

	// 创建默认管理员密码哈希
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("Test1234"), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// 创建管理员用户
	admin := &model.User{
		Username:     "admin",
		Email:        "admin@test.com",
		Slug:         "admin",
		PasswordHash: string(hashedPassword),
		Role:         "ADMIN",
		IsVerified:   true,
	}

	if err := userRepo.Create(ctx, admin); err != nil {
		return fmt.Errorf("failed to create admin user: %w", err)
	}

	fmt.Println("✅ Default admin user created: admin@test.com / Test1234")
	return nil
}
