package model

import "time"

// User 用户模型
type User struct {
	ID            int64      `gorm:"primaryKey" json:"id"`
	Username      string     `gorm:"uniqueIndex;not null;size:50" json:"username" validate:"required,min=3,max=50"`
	Email         string     `gorm:"uniqueIndex;not null;size:100" json:"email" validate:"required,email"`
	Slug          string     `gorm:"not null;size:50;uniqueIndex" json:"slug"`
	PasswordHash  string     `gorm:"column:password_hash;not null;size:255" json:"-" validate:"required,min:8"`
	Role          string     `gorm:"type:varchar(20);not null;default:'USER'" json:"role"`
	IsVerified    bool       `gorm:"not null;default:false" json:"isVerified"`
	CreatedAt     time.Time  `json:"createdAt"`
	LastLoginAt   *time.Time `json:"lastLoginAt"`
	UpdatedAt     time.Time  `json:"-"`
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
	ID         int64     `json:"id"`
	Username   string    `json:"username"`
	Email      string    `json:"email"`
	Slug       string    `json:"slug"`
	Role       string    `json:"role"`
	IsVerified bool      `json:"isVerified"`
	CreatedAt  time.Time `json:"createdAt"`
}

// ToResponse 转换为响应格式
func (u *User) ToResponse() *UserResponse {
	return &UserResponse{
		ID:         u.ID,
		Username:   u.Username,
		Email:      u.Email,
		Slug:       u.Slug,
		Role:       u.Role,
		IsVerified: u.IsVerified,
		CreatedAt:  u.CreatedAt,
	}
}
