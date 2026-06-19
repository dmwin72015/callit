package repository

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"github.com/rdd/cnalias/internal/model"
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
