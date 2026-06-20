package model

import (
	"testing"
	"github.com/stretchr/testify/assert"
	"time"
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
	// UserResponse应该不包含密码等敏感字段
	assert.NotEmpty(t, resp.ID)
	assert.NotEmpty(t, resp.Username)
}
